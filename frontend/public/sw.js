// ConnectHub service worker — push notifications only (no offline caching,
// so a new deploy is always picked up on the next load)

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

// The server only pushes when the user isn't looking at the app, so always
// show it (Safari revokes push permission for pushes that show nothing)
self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data?.text() }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "ConnectHub", {
      body: data.body || "New transmission",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || "/chat", chat: data.chat },
    })
  )
})

// Focus an open ConnectHub window (and switch chats) or open a new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const { url, chat } = event.notification.data || {}

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin)

      if (existing) {
        await existing.focus()
        existing.postMessage({ type: "open-chat", chat })
        return
      }
      await self.clients.openWindow(url || "/chat")
    })()
  )
})
