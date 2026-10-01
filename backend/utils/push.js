const webpush = require("web-push")
const PushSubscription = require("../models/PushSubscription")
const DeviceToken = require("../models/DeviceToken")

// ─── Web Push (browsers / installed web app) ─────────────────────
const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env

const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)

if (pushEnabled) {
  webpush.setVapidDetails(
    VAPID_SUBJECT || "https://connecthub.work",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
} else {
  console.warn("⚠️  VAPID keys not set — web push notifications disabled")
}

// ─── Firebase Cloud Messaging (Android app) ──────────────────────
// FIREBASE_SERVICE_ACCOUNT holds the service-account JSON (raw or base64)
let messaging = null

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim()
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
    const { initializeApp, cert } = require("firebase-admin/app")
    const { getMessaging } = require("firebase-admin/messaging")
    messaging = getMessaging(initializeApp({ credential: cert(JSON.parse(json)) }))
  } catch (error) {
    console.error("⚠️  FIREBASE_SERVICE_ACCOUNT is invalid — Android push disabled:", error.message)
  }
} else {
  console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT not set — Android push notifications disabled")
}

const fcmEnabled = Boolean(messaging)

async function sendWebPush(userIds, payload) {
  if (!pushEnabled) return

  const subs = await PushSubscription.find({ user: { $in: userIds } })
  const body = JSON.stringify(payload)

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body,
          { TTL: 60 * 60 * 24, urgency: "high", topic: payload.tag?.slice(0, 32) }
        )
      } catch (error) {
        // 404/410 = the browser dropped this subscription, so forget it
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id })
        } else {
          console.error("Push failed:", error.statusCode, error.body || error.message)
        }
      }
    })
  )
}

async function sendFcm(userIds, payload) {
  if (!fcmEnabled) return

  const devices = await DeviceToken.find({ user: { $in: userIds } })
  if (devices.length === 0) return

  const response = await messaging.sendEachForMulticast({
    tokens: devices.map((d) => d.token),
    notification: { title: payload.title, body: payload.body },
    // FCM data values must be strings
    data: {
      url: payload.url || "/chat",
      chatType: payload.chat?.type || "",
      chatId: payload.chat?.id || "",
    },
    android: {
      priority: "high",
      ttl: 60 * 60 * 24 * 1000,
      notification: {
        tag: payload.tag,
        channelId: "messages",
        icon: "ic_stat_connecthub",
        color: "#ff2d78",
      },
    },
  })

  // Forget tokens for uninstalled apps
  const dead = response.responses
    .map((r, i) => (r.success ? null : { code: r.error?.code, id: devices[i]._id }))
    .filter(Boolean)
  for (const { code, id } of dead) {
    if (code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token" ||
        code === "messaging/invalid-argument") {
      await DeviceToken.deleteOne({ _id: id })
    } else {
      console.error("FCM failed:", code)
    }
  }
}

// Send a notification payload to every device of the given users
async function sendPushToUsers(userIds, payload) {
  if (userIds.length === 0) return
  await Promise.all([
    sendWebPush(userIds, payload),
    sendFcm(userIds, payload).catch((err) => console.error("FCM error:", err.message)),
  ])
}

module.exports = { pushEnabled, fcmEnabled, sendPushToUsers, VAPID_PUBLIC_KEY }
