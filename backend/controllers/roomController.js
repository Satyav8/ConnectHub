const Room = require("../models/Room")

// @route  POST /api/rooms
// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: "Room name is required" })
    }

    // Check if room name already exists
    const roomExists = await Room.findOne({ name })
    if (roomExists) {
      return res.status(400).json({ message: "Room name already taken" })
    }

    // Create room — creator is automatically a member
    const room = await Room.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    })

    // Populate creator details
    await room.populate("createdBy", "name email avatar")

    res.status(201).json(room)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  GET /api/rooms
// Get all public rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate("createdBy", "name avatar")
      .populate("members", "name avatar status")
      .sort({ createdAt: -1 })

    res.json(rooms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  GET /api/rooms/:id
// Get single room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .populate("members", "name avatar status")

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.json(room)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  POST /api/rooms/:id/join
// Join a room
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Check if already a member
    const isMember = room.members.includes(req.user._id)
    if (isMember) {
      return res.status(400).json({ message: "Already a member of this room" })
    }

    // Add user to members
    room.members.push(req.user._id)
    await room.save()

    await room.populate("createdBy", "name avatar")
    await room.populate("members", "name avatar status")

    res.json(room)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  POST /api/rooms/:id/leave
// Leave a room
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Check if member
    const isMember = room.members.includes(req.user._id)
    if (!isMember) {
      return res.status(400).json({ message: "You are not a member of this room" })
    }

    // Remove user from members
    room.members = room.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    )
    await room.save()

    res.json({ message: "Left room successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/rooms/myrooms
// Get rooms the logged in user is a member of
const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate("createdBy", "name avatar")
      .populate("members", "name avatar status")
      .sort({ createdAt: -1 })

    res.json(rooms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createRoom, getRooms, getRoomById, joinRoom, leaveRoom, getMyRooms }