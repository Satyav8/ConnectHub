const mongoose = require("mongoose")

// Firebase Cloud Messaging token for one installed copy of the Android app
const deviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["android"],
      default: "android",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("DeviceToken", deviceTokenSchema)
