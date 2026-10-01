import { useState, useEffect, useRef } from "react"
import { useSocket } from "../context/SocketContext.jsx"
import { getRoomMessages, getDirectMessages } from "../utils/api.js"
import MessageBubble from "./MessageBubble.jsx"

function ChatWindow({ activeRoom, activeDM, user }) {
  const { socket } = useSocket()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState("")
  const [typing, setTyping] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  // Load messages when room or DM changes
  useEffect(() => {
    if (activeRoom) {
      loadRoomMessages()
      socket?.emit("join-room", activeRoom._id)
    } else if (activeDM) {
      loadDirectMessages()
    }

    return () => {
      if (activeRoom) {
        socket?.emit("leave-room", activeRoom._id)
      }
      setMessages([])
      setTyping([])
    }
  }, [activeRoom?._id, activeDM?._id])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("receive-direct-message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("user-typing", ({ name, roomId }) => {
      if (activeRoom && roomId === activeRoom._id) {
        setTyping((prev) =>
          prev.includes(name) ? prev : [...prev, name]
        )
      }
    })

    socket.on("user-stop-typing", ({ roomId }) => {
      if (activeRoom && roomId === activeRoom._id) {
        setTyping([])
      }
    })

    return () => {
      socket.off("receive-message")
      socket.off("receive-direct-message")
      socket.off("user-typing")
      socket.off("user-stop-typing")
    }
  }, [socket, activeRoom?._id])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadRoomMessages() {
    try {
      setLoading(true)
      const { data } = await getRoomMessages(activeRoom._id)
      setMessages(data.messages)
    } catch (err) {
      console.error("Failed to load messages:", err)
    } finally {
      setLoading(false)
    }
  }

  async function loadDirectMessages() {
    try {
      setLoading(true)
      const { data } = await getDirectMessages(activeDM._id)
      setMessages(data.messages)
    } catch (err) {
      console.error("Failed to load DMs:", err)
    } finally {
      setLoading(false)
    }
  }

  function handleTyping() {
    if (activeRoom) {
      socket?.emit("typing", { roomId: activeRoom._id })
      clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        socket?.emit("stop-typing", { roomId: activeRoom._id })
      }, 1500)
    }
  }

  function handleSend(e) {
    e.preventDefault()
    if (!content.trim()) return

    if (activeRoom) {
      socket?.emit("send-message", {
        roomId: activeRoom._id,
        content: content.trim(),
      })
    } else if (activeDM) {
      socket?.emit("send-direct-message", {
        receiverId: activeDM._id,
        content: content.trim(),
      })
    }

    setContent("")
    socket?.emit("stop-typing", { roomId: activeRoom?._id })
  }

  const title = activeRoom
    ? `# ${activeRoom.name}`
    : `@ ${activeDM?.name}`

  const subtitle = activeRoom
    ? `${activeRoom.members?.length || 0} MEMBERS // CHANNEL_SECURE`
    : activeDM?.status === "online" ? "● ONLINE // DIRECT_LINK" : "○ OFFLINE // DIRECT_LINK"

  const accent = activeRoom ? "#ff2d78" : "#00f5ff"

  return (
    <div style={styles.window}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              ...styles.title,
              color: accent,
              textShadow: `0 0 8px ${accent}, 0 0 20px ${accent}66`,
            }}
          >
            {title}
          </h2>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
        <div style={styles.headerStatus}>
          <span style={styles.statusDot} className="cyber-pulse" />
          LINK_ACTIVE
        </div>
        <div style={styles.headerLine} />
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {loading ? (
          <div style={styles.loading}>
            &gt; DECRYPTING MESSAGE LOG<span className="cyber-blink">_</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyTag}>// CHANNEL_EMPTY</p>
            <p>NO TRANSMISSIONS DETECTED. BREAK THE SILENCE.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id === user._id ||
                     msg.sender === user._id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typing.length > 0 && (
        <div style={styles.typing}>
          <span style={{ color: "#bf00ff" }}>&gt;</span>{" "}
          {typing.join(", ")} {typing.length === 1 ? "is" : "are"} TRANSMITTING
          <span className="cyber-blink">...</span>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} style={styles.inputRow}>
        <div style={styles.terminal} className="cyber-terminal">
          <span style={styles.prompt}>&gt;_</span>
          <input
            type="text"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              handleTyping()
            }}
            placeholder={`Message ${title}`}
            style={styles.input}
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="cyber-btn"
          style={{
            ...styles.sendBtn,
            opacity: content.trim() ? 1 : 0.4,
            cursor: content.trim() ? "pointer" : "not-allowed",
          }}
        >
          SEND ▸
        </button>
      </form>

    </div>
  )
}

const mono = "'Share Tech Mono', monospace"

const styles = {
  window: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  header: {
    position: "relative",
    padding: "14px 20px",
    backgroundColor: "#111111",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  headerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "1px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff 50%, #00f5ff)",
    boxShadow: "0 0 8px rgba(255,45,120,0.6), 0 0 16px rgba(0,245,255,0.3)",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  subtitle: {
    fontFamily: mono,
    fontSize: "11px",
    color: "#6b6b7b",
    letterSpacing: "1px",
    marginTop: "2px",
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: mono,
    fontSize: "11px",
    color: "#00f5ff",
    letterSpacing: "1px",
    border: "1px solid #1f1f1f",
    padding: "4px 10px",
    flexShrink: 0,
  },
  statusDot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#00f5ff",
    boxShadow: "0 0 6px #00f5ff, 0 0 12px #00f5ff",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  loading: {
    textAlign: "center",
    fontFamily: mono,
    color: "#00f5ff",
    fontSize: "13px",
    letterSpacing: "1px",
    marginTop: "40px",
  },
  empty: {
    textAlign: "center",
    fontFamily: mono,
    color: "#6b6b7b",
    marginTop: "40px",
    fontSize: "13px",
    letterSpacing: "1px",
  },
  emptyTag: {
    color: "#bf00ff",
    marginBottom: "6px",
    textShadow: "0 0 6px rgba(191,0,255,0.5)",
  },
  typing: {
    padding: "6px 20px",
    fontFamily: mono,
    fontSize: "12px",
    color: "#00f5ff",
    letterSpacing: "1px",
    textShadow: "0 0 6px rgba(0,245,255,0.4)",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    padding: "14px 20px",
    borderTop: "1px solid #1f1f1f",
    backgroundColor: "#111111",
  },
  terminal: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    border: "1px solid #1f1f1f",
    backgroundColor: "#0d0d0d",
    minWidth: 0,
  },
  prompt: {
    fontFamily: mono,
    color: "#ff2d78",
    textShadow: "0 0 8px #ff2d78",
    padding: "0 4px 0 14px",
    fontSize: "15px",
    userSelect: "none",
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "12px 14px 12px 6px",
    border: "none",
    backgroundColor: "transparent",
    color: "#e6e6e6",
    caretColor: "#00f5ff",
    fontFamily: mono,
    fontSize: "14px",
    outline: "none",
  },
  sendBtn: {
    padding: "0 26px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff)",
    color: "#ffffff",
    border: "none",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "3px",
    boxShadow: "0 0 14px rgba(255,45,120,0.35)",
    flexShrink: 0,
  },
}

export default ChatWindow
