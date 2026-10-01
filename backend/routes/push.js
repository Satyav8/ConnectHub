const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const PushSubscription = require("../models/PushSubscription")
const DeviceToken = require("../models/DeviceToken")
const { pushEnabled, VAPID_PUBLIC_KEY } = require("../utils/push")

// Public key the browser needs to create a subscription
router.get("/vapid-public-key", (req, res) => {
  if (!pushEnabled) {
    return res.status(503).json({ message: "Push notifications are not configured" })
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY })
})

router.use(protect)

// Save (or re-assign) this device's subscription to the logged-in user
router.post("/subscribe", async (req, res) => {
  try {
    const { endpoint, keys } = req.body
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Invalid subscription" })
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { user: req.user._id, endpoint, keys },
      { upsert: true }
    )
    res.status(201).json({ message: "Subscribed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body
    if (endpoint) {
      await PushSubscription.deleteOne({ endpoint, user: req.user._id })
    }
    res.json({ message: "Unsubscribed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Android app (Firebase Cloud Messaging tokens) ───────────────
router.post("/native-subscribe", async (req, res) => {
  try {
    const { token, platform = "android" } = req.body
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid device token" })
    }

    await DeviceToken.findOneAndUpdate(
      { token },
      { user: req.user._id, token, platform },
      { upsert: true }
    )
    res.status(201).json({ message: "Subscribed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post("/native-unsubscribe", async (req, res) => {
  try {
    const { token } = req.body
    if (token) {
      await DeviceToken.deleteOne({ token, user: req.user._id })
    }
    res.json({ message: "Unsubscribed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
