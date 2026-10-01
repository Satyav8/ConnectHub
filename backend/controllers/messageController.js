const Message = require("../models/Message")
const DirectMessage = require("../models/DirectMessage")
const Room = require("../models/Room")

// @route  GET /api/messages/:roomId
// Get all messages for a room
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    // Check room exists
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Check user is a member
    const isMember = room.members.includes(req.user._id)
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" })
    }

    const messages = await Message.find({ room: roomId })
      .populate("sender", "name avatar status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Return in chronological order
    const total = await Message.countDocuments({ room: roomId })

    res.json({
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  POST /api/messages/:roomId
// Send a message to a room
const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ message: "Message content is required" })
    }

    // Check room exists and user is a member
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    const isMember = room.members.includes(req.user._id)
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" })
    }

    // Create message
    const message = await Message.create({
      content,
      sender: req.user._id,
      room: roomId,
      readBy: [req.user._id],
    })

    // Populate sender details
    await message.populate("sender", "name avatar status")

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  DELETE /api/messages/:messageId
// Delete a message (only sender can delete)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)

    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" })
    }

    await message.deleteOne()
    res.json({ message: "Message deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  GET /api/messages/direct/:userId
// Get direct messages between logged in user and another user
const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const messages = await DirectMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "name avatar status")
      .populate("receiver", "name avatar status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await DirectMessage.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })

    res.json({
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  POST /api/messages/direct/:userId
// Send a direct message to a user
const sendDirectMessage = async (req, res) => {
  try {
    const { userId } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ message: "Message content is required" })
    }

    const message = await DirectMessage.create({
      content,
      sender: req.user._id,
      receiver: userId,
    })

    await message.populate("sender", "name avatar status")
    await message.populate("receiver", "name avatar status")

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route PATCH /api/messages/direct/:userId/read
// Mark all direct messages from a user as read
const markDirectMessagesRead = async (req, res) => {
  try {
    const { userId } = req.params

    await DirectMessage.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true }
    )

    res.json({ message: "Messages marked as read" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getRoomMessages,
  sendMessage,
  deleteMessage,
  getDirectMessages,
  sendDirectMessage,
  markDirectMessagesRead,
}