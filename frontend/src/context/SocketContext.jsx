import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext.jsx"
import { SERVER_URL } from "../utils/api.js"

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!user?.token) return

    // Connect to socket with JWT token
    const newSocket = io(SERVER_URL || undefined, {
      auth: { token: user.token },
    })

    // Tell the server whether the app is on screen, so it knows when to push
    const reportAppState = () =>
      newSocket.emit("app-state", { active: document.visibilityState === "visible" })

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
      reportAppState()
    })
    document.addEventListener("visibilitychange", reportAppState)

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
    })

    // Track online users
    newSocket.on("online-users", (users) => {
      setOnlineUsers(users)
    })

    newSocket.on("user-online", ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      )
    })

    newSocket.on("user-offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    })

    setSocket(newSocket)

    // Cleanup on logout or token change
    return () => {
      document.removeEventListener("visibilitychange", reportAppState)
      newSocket.disconnect()
    }
  }, [user?.token])

  function isUserOnline(userId) {
    return onlineUsers.includes(userId)
  }

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}