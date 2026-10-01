import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { useSocket } from "../context/SocketContext.jsx"
import { useIsMobile } from "../hooks/useIsMobile.js"
import { getRoomById, getUserById } from "../utils/api.js"
import Sidebar from "../components/Sidebar.jsx"
import ChatWindow from "../components/ChatWindow.jsx"

function Chat() {
  const { user, logout } = useAuth()
  const { socket } = useSocket()
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeDM, setActiveDM] = useState(null)
  const [notice, setNotice] = useState(null)
  const noticeTimer = useRef(null)

  const hasChat = Boolean(activeRoom || activeDM)

  // Keep the current chat readable from socket/service-worker callbacks
  const activeChatRef = useRef(null)
  useEffect(() => {
    activeChatRef.current = activeRoom
      ? { type: "room", id: activeRoom._id }
      : activeDM ? { type: "dm", id: activeDM._id } : null
  }, [activeRoom, activeDM])

  function selectRoom(room) {
    setActiveRoom(room)
    setActiveDM(null)
  }

  function selectDM(dmUser) {
    setActiveDM(dmUser)
    setActiveRoom(null)
  }

  function closeChat() {
    setActiveRoom(null)
    setActiveDM(null)
  }

  // Open a chat from a notification (system or in-app) or a /chat?room=… link
  const openChat = useCallback(async (chat) => {
    if (!chat?.id) return
    try {
      if (chat.type === "room") {
        const { data } = await getRoomById(chat.id)
        selectRoom(data)
      } else if (chat.type === "dm") {
        const { data } = await getUserById(chat.id)
        selectDM(data)
      }
      setNotice(null)
    } catch (err) {
      console.error("Failed to open chat:", err)
    }
  }, [])

  // Deep links from notification taps when the app wasn't open
  useEffect(() => {
    const room = searchParams.get("room")
    const dm = searchParams.get("dm")
    if (room || dm) {
      openChat(room ? { type: "room", id: room } : { type: "dm", id: dm })
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, openChat])

  // Notification taps while the app is already open
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    const onMessage = (e) => {
      if (e.data?.type === "open-chat") openChat(e.data.chat)
    }
    navigator.serviceWorker.addEventListener("message", onMessage)
    return () => navigator.serviceWorker.removeEventListener("message", onMessage)
  }, [openChat])

  // In-app notice for messages in chats you're not looking at
  useEffect(() => {
    if (!socket) return
    const onNotify = (payload) => {
      const current = activeChatRef.current
      if (current && current.type === payload.chat?.type && current.id === payload.chat?.id) return
      setNotice(payload)
      clearTimeout(noticeTimer.current)
      noticeTimer.current = setTimeout(() => setNotice(null), 5000)
    }
    socket.on("notify", onNotify)
    return () => socket.off("notify", onNotify)
  }, [socket])

  // Opening a chat clears its system notifications
  useEffect(() => {
    const tag = activeRoom ? `room-${activeRoom._id}` : activeDM ? `dm-${activeDM._id}` : null
    if (!tag || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.getRegistration().then((reg) =>
      reg?.getNotifications({ tag }).then((list) => list.forEach((n) => n.close()))
    )
  }, [activeRoom?._id, activeDM?._id])

  // On phones, the back button/gesture closes the chat instead of leaving the app
  useEffect(() => {
    if (!isMobile || !hasChat) return
    window.history.pushState({ chatOpen: true }, "")
    const onPop = () => closeChat()
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [isMobile, hasChat])

  function handleBack() {
    if (window.history.state?.chatOpen) window.history.back()
    else closeChat()
  }

  const showSidebar = !isMobile || !hasChat
  const showMain = !isMobile || hasChat

  return (
    <div style={styles.layout}>

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          user={user}
          activeRoom={activeRoom}
          activeDM={activeDM}
          onSelectRoom={selectRoom}
          onSelectDM={selectDM}
          onLogout={logout}
        />
      )}

      {/* Chat Window */}
      {showMain && (
        <div style={styles.main} className="cyber-grid">
          {hasChat ? (
            <ChatWindow
              activeRoom={activeRoom}
              activeDM={activeDM}
              user={user}
              onBack={isMobile ? handleBack : undefined}
            />
          ) : (
            <div style={styles.empty}>
              <div style={styles.emptyGlow} />
              <div style={styles.emptyBox}>
                <span style={{ ...styles.corner, top: -1, left: -1, borderWidth: "2px 0 0 2px" }} />
                <span style={{ ...styles.corner, top: -1, right: -1, borderWidth: "2px 2px 0 0" }} />
                <span style={{ ...styles.corner, bottom: -1, left: -1, borderWidth: "0 0 2px 2px" }} />
                <span style={{ ...styles.corner, bottom: -1, right: -1, borderWidth: "0 2px 2px 0" }} />

                <p style={styles.emptyIcon} className="cyber-pulse">◈</p>
                <p style={styles.emptyTag}>// NO_ACTIVE_CHANNEL</p>
                <h2 style={styles.emptyTitle} className="cyber-flicker">
                  WELCOME TO CONNECT<span style={styles.emptyAccent}>HUB</span>
                </h2>
                <p style={styles.emptySub}>
                  &gt; SELECT A ROOM OR USER TO OPEN A UPLINK
                  <span className="cyber-blink">_</span>
                </p>
                <div style={styles.emptyLine} />
                <p style={styles.emptyMeta}>
                  CONNECTED AS: <span style={{ color: "#ff2d78" }}>{user?.name?.toUpperCase()}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-app notification */}
      {notice && (
        <button
          type="button"
          onClick={() => openChat(notice.chat)}
          style={styles.toast}
          className="cyber-toast"
        >
          <span style={styles.toastBar} />
          <span style={styles.toastTag}>// INCOMING_TRANSMISSION</span>
          <span style={styles.toastTitle}>{notice.title}</span>
          <span style={styles.toastBody}>{notice.body}</span>
        </button>
      )}

    </div>
  )
}

const mono = "'Share Tech Mono', monospace"

const styles = {
  layout: {
    display: "flex",
    height: "100dvh",
    backgroundColor: "#0d0d0d",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#0d0d0d",
    minWidth: 0,
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "16px",
  },
  emptyGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    maxWidth: "100%",
    background: "radial-gradient(circle, rgba(191,0,255,0.12) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  emptyBox: {
    position: "relative",
    textAlign: "center",
    padding: "40px 48px",
    border: "1px solid #1f1f1f",
    backgroundColor: "rgba(17,17,17,0.85)",
    maxWidth: "520px",
    width: "100%",
  },
  corner: {
    position: "absolute",
    width: "14px",
    height: "14px",
    borderStyle: "solid",
    borderColor: "#00f5ff",
    boxShadow: "0 0 8px rgba(0,245,255,0.4)",
  },
  emptyIcon: {
    fontSize: "56px",
    color: "#bf00ff",
    textShadow: "0 0 16px #bf00ff, 0 0 40px rgba(191,0,255,0.5)",
    lineHeight: 1,
    marginBottom: "16px",
  },
  emptyTag: {
    fontFamily: mono,
    fontSize: "12px",
    color: "#00f5ff",
    letterSpacing: "2px",
    marginBottom: "10px",
  },
  emptyTitle: {
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "4px",
    color: "#ff2d78",
    textShadow: "0 0 10px rgba(255,45,120,0.7), 0 0 28px rgba(255,45,120,0.35)",
    marginBottom: "12px",
  },
  emptyAccent: {
    color: "#00f5ff",
    textShadow: "0 0 10px rgba(0,245,255,0.7), 0 0 28px rgba(0,245,255,0.35)",
  },
  emptySub: {
    fontFamily: mono,
    fontSize: "13px",
    color: "#6b6b7b",
  },
  emptyLine: {
    height: "1px",
    margin: "24px auto 16px",
    width: "60%",
    background: "linear-gradient(90deg, transparent, #ff2d78, #bf00ff, #00f5ff, transparent)",
  },
  emptyMeta: {
    fontFamily: mono,
    fontSize: "11px",
    color: "#3d3d4a",
    letterSpacing: "1px",
  },
  toast: {
    position: "fixed",
    top: "calc(16px + env(safe-area-inset-top))",
    right: "16px",
    zIndex: 50,
    width: "min(360px, calc(100vw - 32px))",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "3px",
    textAlign: "left",
    padding: "12px 16px 12px 18px",
    backgroundColor: "rgba(17,17,17,0.96)",
    border: "1px solid #1f1f1f",
    boxShadow: "0 0 24px rgba(255,45,120,0.25), 0 12px 40px rgba(0,0,0,0.7)",
    cursor: "pointer",
    overflow: "hidden",
    color: "#e6e6e6",
  },
  toastBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "2px",
    background: "linear-gradient(180deg, #ff2d78, #bf00ff, #00f5ff)",
    boxShadow: "0 0 10px #ff2d78",
  },
  toastTag: {
    fontFamily: mono,
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#bf00ff",
  },
  toastTitle: {
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#ff2d78",
    textShadow: "0 0 8px rgba(255,45,120,0.6)",
  },
  toastBody: {
    fontFamily: mono,
    fontSize: "13px",
    color: "#c8c8d0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
}

export default Chat
