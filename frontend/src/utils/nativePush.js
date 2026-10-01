import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { saveNativeToken, removeNativeToken } from "./api.js"

export const isNative = Capacitor.isNativePlatform()

// Only true in APKs built with a Firebase config — calling register() without one crashes the app
export const fcmAvailable = isNative && import.meta.env.VITE_FCM_ENABLED === "true"

const TOKEN_KEY = "connecthub_fcm_token"

// A notification tapped before the chat screen was ready (e.g. cold start)
let pendingChat = null

export function consumePendingChat() {
  const chat = pendingChat
  pendingChat = null
  return chat
}

export function initNativePush() {
  if (!fcmAvailable) return

  PushNotifications.createChannel({
    id: "messages",
    name: "Messages",
    description: "New chat and direct messages",
    importance: 5,
    visibility: 1,
    lights: true,
    lightColor: "#ff2d78",
    vibration: true,
  }).catch(() => {})

  PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
    const data = notification.data || {}
    if (!data.chatId) return
    pendingChat = { type: data.chatType, id: data.chatId }
    window.dispatchEvent(new CustomEvent("connecthub:open-chat", { detail: pendingChat }))
  })
}

// Ask FCM for this device's token
function requestToken() {
  return new Promise((resolve, reject) => {
    const handles = []
    const done = (fn, value) => {
      handles.forEach((h) => h.remove())
      fn(value)
    }
    Promise.all([
      PushNotifications.addListener("registration", (t) => done(resolve, t.value)),
      PushNotifications.addListener("registrationError", (e) => done(reject, new Error(e.error))),
    ]).then((hs) => {
      handles.push(...hs)
      PushNotifications.register()
    })
  })
}

function storedToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function getNativePushState() {
  if (!fcmAvailable) return "unsupported"
  const { receive } = await PushNotifications.checkPermissions()
  if (receive === "denied") return "denied"
  if (receive !== "granted") return "off"
  return storedToken() ? "on" : "off"
}

export async function enableNativePush() {
  const { receive } = await PushNotifications.requestPermissions()
  if (receive !== "granted") return receive === "denied" ? "denied" : "off"

  const token = await requestToken()
  await saveNativeToken(token)
  localStorage.setItem(TOKEN_KEY, token)
  return "on"
}

export async function disableNativePush() {
  const token = storedToken()
  if (token) {
    await removeNativeToken(token).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
  }
  await PushNotifications.unregister().catch(() => {})
  return "off"
}

// Re-link this device to whoever is logged in now (tokens can also rotate)
export async function syncNativePush() {
  if (!fcmAvailable || !storedToken()) return
  const { receive } = await PushNotifications.checkPermissions()
  if (receive !== "granted") return
  const token = await requestToken()
  await saveNativeToken(token)
  localStorage.setItem(TOKEN_KEY, token)
}
