import { useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import Sidebar from "../components/Sidebar.jsx"
import ChatWindow from "../components/ChatWindow.jsx"

function Chat() {
  const { user, logout } = useAuth()
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeDM, setActiveDM] = useState(null)

  return (
    <div style={styles.layout}>

      {/* Sidebar */}
      <Sidebar
        user={user}
        activeRoom={activeRoom}
        activeDM={activeDM}
        onSelectRoom={(room) => {
          setActiveRoom(room)
          setActiveDM(null)
        }}
        onSelectDM={(dmUser) => {
          setActiveDM(dmUser)
          setActiveRoom(null)
        }}
        onLogout={logout}
      />

      {/* Chat Window */}
      <div style={styles.main} className="cyber-grid">
        {activeRoom || activeDM ? (
          <ChatWindow
            activeRoom={activeRoom}
            activeDM={activeDM}
            user={user}
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

    </div>
  )
}

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
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
    fontFamily: "'Share Tech Mono', monospace",
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
    fontFamily: "'Share Tech Mono', monospace",
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
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "11px",
    color: "#3d3d4a",
    letterSpacing: "1px",
  },
}

export default Chat
