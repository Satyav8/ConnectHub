import { getVapidPublicKey, savePushSubscription, removePushSubscription } from "./api.js"
import {
  isNative, getNativePushState, enableNativePush, disableNativePush, syncNativePush,
} from "./nativePush.js"

// In the Android app every function below hands off to the Firebase version in nativePush.js

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true

const pushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window

export function registerServiceWorker() {
  if (isNative || !("serviceWorker" in navigator)) return
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) =>
      console.error("Service worker registration failed:", err)
    )
  })
}

// "on" | "off" | "denied" | "needs-install" (iOS only allows push from the home-screen app) | "unsupported"
export async function getPushState() {
  if (isNative) return getNativePushState()
  if (isIOS() && !isStandalone()) return "needs-install"
  if (!pushSupported()) return "unsupported"
  if (Notification.permission === "denied") return "denied"
  if (Notification.permission !== "granted") return "off"

  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return sub ? "on" : "off"
}

function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

// Must be called from a click/tap — browsers block permission prompts otherwise
export async function enablePush() {
  if (isNative) return enableNativePush()
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return permission === "denied" ? "denied" : "off"

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    const { data } = await getVapidPublicKey()
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    })
  }
  await savePushSubscription(sub.toJSON())
  return "on"
}

export async function disablePush() {
  if (isNative) return disableNativePush()
  if (!pushSupported()) return "off"
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    await removePushSubscription(sub.endpoint).catch(() => {})
    await sub.unsubscribe()
  }
  return "off"
}

// Re-link this device to whoever is logged in now (e.g. after switching accounts)
export async function syncPushSubscription() {
  if (isNative) return syncNativePush().catch(() => {})
  if (!pushSupported() || Notification.permission !== "granted") return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) await savePushSubscription(sub.toJSON()).catch(() => {})
}

// ─── Install prompt (Android / desktop Chrome) ───────────────────
let deferredInstall = null
const installListeners = new Set()

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  deferredInstall = e
  installListeners.forEach((fn) => fn(true))
})

window.addEventListener("appinstalled", () => {
  deferredInstall = null
  installListeners.forEach((fn) => fn(false))
})

export const canPromptInstall = () => Boolean(deferredInstall)

export function onInstallAvailable(fn) {
  installListeners.add(fn)
  return () => installListeners.delete(fn)
}

export async function promptInstall() {
  if (!deferredInstall) return false
  deferredInstall.prompt()
  const { outcome } = await deferredInstall.userChoice
  deferredInstall = null
  installListeners.forEach((fn) => fn(false))
  return outcome === "accepted"
}
