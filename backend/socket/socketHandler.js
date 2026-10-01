const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Message = require("../models/Message")
const DirectMessage = require("../models/DirectMessage")

// Store online users: { userId: socketId }
const onlineUsers = new Map()

module.exports = (io) => {

  // ─── Auth Middleware for Socket.io ───────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error — no token"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return next(new Error("Authentication error — user not found"))
      }

      // Attach user to socket
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error — invalid token"))
    }
  })

  // ─── On Connection ────────────────────────────────────────────
  io.on("connection", async (socket) => {
    console.log(`✅ ${socket.user.name} connected — socket: ${socket.id}`)

    const userId = socket.user._id.toString()

    // Add to online users map
    onlineUsers.set(userId, socket.id)

    // Update user status in DB
    await User.findByIdAndUpdate(userId, { status: "online" })

    // Broadcast to everyone that this user is online
    io.emit("user-online", {
      userId,
      name: socket.user.name,
      status: "online",
    })

    // Send the full online users list to the newly connected user
    socket.emit("online-users", Array.from(onlineUsers.keys()))

    // ─── Join Room ──────────────────────────────────────────────
    socket.on("join-room", async (roomId) => {
      socket.join(roomId)
      console.log(`${socket.user.name} joined room: ${roomId}`)

      // Send system message to room
      const systemMessage = await Message.create({
        content: `${socket.user.name} joined the room`,
        sender: socket.user._id,
        room: roomId,
        messageType: "system",
      })

      await systemMessage.populate("sender", "name avatar")

      io.to(roomId).emit("receive-message", systemMessage)
    })

    // ─── Leave Room ─────────────────────────────────────────────
    socket.on("leave-room", async (roomId) => {
      socket.leave(roomId)
      console.log(`${socket.user.name} left room: ${roomId}`)

      const systemMessage = await Message.create({
        content: `${socket.user.name} left the room`,
        sender: socket.user._id,
        room: roomId,
        messageType: "system",
      })

      await systemMessage.populate("sender", "name avatar")

      io.to(roomId).emit("receive-message", systemMessage)
    })

    // ─── Send Message ────────────────────────────────────────────
    socket.on("send-message", async ({ roomId, content }) => {
      try {
        if (!content || !content.trim()) return

        // Save to database
        const message = await Message.create({
          content: content.trim(),
          sender: socket.user._id,
          room: roomId,
          readBy: [socket.user._id],
        })

        await message.populate("sender", "name avatar status")

        // Broadcast to everyone in the room including sender
        io.to(roomId).emit("receive-message", message)

      } catch (error) {
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // ─── Typing Indicators ───────────────────────────────────────
    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("user-typing", {
        userId,
        name: socket.user.name,
        roomId,
      })
    })

    socket.on("stop-typing", ({ roomId }) => {
      socket.to(roomId).emit("user-stop-typing", {
        userId,
        roomId,
      })
    })

    // ─── Direct Message ──────────────────────────────────────────
    socket.on("send-direct-message", async ({ receiverId, content }) => {
      try {
        if (!content || !content.trim()) return

        const message = await DirectMessage.create({
          content: content.trim(),
          sender: socket.user._id,
          receiver: receiverId,
        })

        await message.populate("sender", "name avatar status")
        await message.populate("receiver", "name avatar status")

        // Send to sender
        socket.emit("receive-direct-message", message)

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-direct-message", message)
        }

      } catch (error) {
        socket.emit("error", { message: "Failed to send direct message" })
      }
    })

    // ─── Disconnect ──────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`❌ ${socket.user.name} disconnected`)

      onlineUsers.delete(userId)

      await User.findByIdAndUpdate(userId, { status: "offline" })

      io.emit("user-offline", {
        userId,
        name: socket.user.name,
        status: "offline",
      })
    })

  })
}