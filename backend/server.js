const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const connectDB = require("./config/db")

// Load env variables
dotenv.config()

// Connect to database
connectDB()

// Create express app
const app = express()

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app)

// Create Socket.io instance
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// Routes (we'll fill these in next steps)
app.use("/api/auth", require("./routes/auth"))
app.use("/api/rooms", require("./routes/room"))
app.use("/api/messages", require("./routes/message"))
app.use("/api/users", require("./routes/user"))

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "ConnectHub API is running" })
})

// Serve the built frontend (production) — React Router handles every non-API path
const clientDist = path.join(__dirname, "../frontend/dist")
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get(/^\/(?!api\/|socket\.io\/).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"))
  })
}

// Socket.io handler
require("./socket/socketHandler")(io)

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})