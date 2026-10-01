const express = require("express")
const router = express.Router()
const {
  getRoomMessages,
  sendMessage,
  deleteMessage,
  getDirectMessages,
  sendDirectMessage,
  markDirectMessagesRead,
} = require("../controllers/messageController")
const protect = require("../middleware/authMiddleware")

router.use(protect)

// Room messages
router.get("/:roomId", getRoomMessages)
router.post("/:roomId", sendMessage)
router.delete("/:messageId", deleteMessage)

// Direct messages
router.get("/direct/:userId", getDirectMessages)
router.post("/direct/:userId", sendDirectMessage)
router.patch("/direct/:userId/read", markDirectMessagesRead)

module.exports = router