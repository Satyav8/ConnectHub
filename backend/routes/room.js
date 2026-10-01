const express = require("express")
const router = express.Router()
const {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  getMyRooms,
} = require("../controllers/roomController")
const protect = require("../middleware/authMiddleware")

// All room routes are protected
router.use(protect)

router.post("/", createRoom)
router.get("/", getRooms)
router.get("/myrooms", getMyRooms)
router.get("/:id", getRoomById)
router.post("/:id/join", joinRoom)
router.post("/:id/leave", leaveRoom)

module.exports = router