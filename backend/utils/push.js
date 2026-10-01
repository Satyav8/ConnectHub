const webpush = require("web-push")
const PushSubscription = require("../models/PushSubscription")

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env

const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)

if (pushEnabled) {
  webpush.setVapidDetails(
    VAPID_SUBJECT || "https://connecthub.work",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
} else {
  console.warn("⚠️  VAPID keys not set — push notifications disabled")
}

// Send a notification payload to every device of the given users
async function sendPushToUsers(userIds, payload) {
  if (!pushEnabled || userIds.length === 0) return

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

module.exports = { pushEnabled, sendPushToUsers, VAPID_PUBLIC_KEY }
