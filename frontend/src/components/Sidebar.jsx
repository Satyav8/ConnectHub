import { useState, useEffect } from "react"
import { useSocket } from "../context/SocketContext.jsx"
import { getRooms, getMyRooms, createRoom, joinRoom, getUsers } from "../utils/api.js"
import { useIsMobile } from "../hooks/useIsMobile.js"
import AppControls from "./AppControls.jsx"

function Sidebar({ user, activeRoom, activeDM, onSelectRoom, onSelectDM, onLogout }) {
  const { isUserOnline } = useSocket()
  const isMobile = useIsMobile()

  const [rooms, setRooms] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState("rooms")
  const [showCreate, setShowCreate] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomDesc, setNewRoomDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRooms()
    fetchUsers()
  }, [])

  async function fetchRooms() {
    try {
      const [allRes, myRes] = await Promise.all([getRooms(), getMyRooms()])
      setRooms(allRes.data)
      setMyRooms(myRes.data)
    } catch (err) {
      console.error("Failed to fetch rooms:", err)
    }
  }

  async function fetchUsers() {
    try {
      const { data } = await getUsers()
      setUsers(data)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }

  async function handleJoinRoom(roomId) {
    try {
      await joinRoom(roomId)
      fetchRooms()
    } catch (err) {
      console.error("Failed to join room:", err)
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault()
    if (!newRoomName.trim()) return
    try {
      setLoading(true)
      setError("")
      await createRoom({ name: newRoomName, description: newRoomDesc })
      setNewRoomName("")
      setNewRoomDesc("")
      setShowCreate(false)
      fetchRooms()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room")
    } finally {
      setLoading(false)
    }
  }

  const isMember = (roomId) =>
    myRooms.some((r) => r._id === roomId)

  return (
    <div style={{ ...styles.sidebar, width: isMobile ? "100%" : "280px" }}>
      <div style={styles.edge} />

      {/* Header */}
      <div style={styles.header}>
        <div style={{ minWidth: 0 }}>
          <h2 style={styles.appName}>
            CONNECT<span style={styles.appAccent}>HUB</span>
          </h2>
          <p style={styles.userName}>
            <span style={styles.userDot} /> {user?.name}
          </p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn} className="cyber-ghost">
          [ EXIT ]
        </button>
      </div>

      {/* Notifications + install */}
      <AppControls />

      {/* Tabs */}
      <div style={styles.tabs}>
        {["rooms", "people"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              borderBottom: tab === t ? "2px solid #ff2d78" : "2px solid transparent",
              color: tab === t ? "#ff2d78" : "#6b6b7b",
              textShadow: tab === t ? "0 0 8px rgba(255,45,120,0.8)" : "none",
              backgroundColor: tab === t ? "rgba(255,45,120,0.06)" : "transparent",
            }}
          >
            {t === "rooms" ? "// ROOMS" : "// USERS"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* Rooms Tab */}
        {tab === "rooms" && (
          <>
            {/* Create Room Button */}
            <button
              onClick={() => setShowCreate(!showCreate)}
              style={showCreate ? styles.cancelBtn : styles.createBtn}
              className={showCreate ? "cyber-ghost" : "cyber-btn"}
            >
              {showCreate ? "[ ABORT ]" : "+ INIT_NEW_ROOM"}
            </button>

            {/* Create Room Form */}
            {showCreate && (
              <form onSubmit={handleCreateRoom} style={styles.createForm}>
                {error && <p style={styles.formError}>[ ERR ] {error}</p>}
                <label style={styles.formLabel}>// ROOM_NAME</label>
                <input
                  type="text"
                  placeholder="night_city"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  style={styles.formInput}
                  className="cyber-input"
                />
                <label style={styles.formLabel}>// DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="optional"
                  value={newRoomDesc}
                  onChange={e => setNewRoomDesc(e.target.value)}
                  style={styles.formInput}
                  className="cyber-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.formBtn}
                  className="cyber-btn"
                >
                  {loading ? "COMPILING..." : "[ DEPLOY ]"}
                </button>
              </form>
            )}

            {/* My Rooms */}
            {myRooms.length > 0 && (
              <>
                <p style={styles.sectionLabel}>
                  MY_ROOMS <span style={styles.sectionCount}>[{myRooms.length}]</span>
                </p>
                {myRooms.map((room) => {
                  const active = activeRoom?._id === room._id
                  return (
                    <div
                      key={room._id}
                      onClick={() => onSelectRoom(room)}
                      className="cyber-item"
                      style={{
                        ...styles.roomItem,
                        borderLeft: active ? "2px solid #ff2d78" : "2px solid transparent",
                        background: active
                          ? "linear-gradient(90deg, rgba(255,45,120,0.15), rgba(191,0,255,0.04))"
                          : undefined,
                        boxShadow: active ? "inset 4px 0 12px -4px rgba(255,45,120,0.6)" : "none",
                      }}
                    >
                      <span
                        style={{
                          ...styles.roomHash,
                          color: active ? "#ff2d78" : "#3d3d4a",
                          textShadow: active ? "0 0 8px #ff2d78" : "none",
                        }}
                      >
                        #
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ ...styles.roomName, color: active ? "#ffffff" : "#c8c8d0" }}>
                          {room.name}
                        </p>
                        <p style={styles.roomMeta}>
                          {room.members?.length} members
                        </p>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* All Rooms */}
            <p style={styles.sectionLabel}>
              ALL_ROOMS <span style={styles.sectionCount}>[{rooms.length}]</span>
            </p>
            {rooms.map((room) => (
              <div key={room._id} style={styles.roomItem} className="cyber-item">
                <span style={styles.roomHash}>#</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.roomName}>{room.name}</p>
                  <p style={styles.roomMeta}>{room.members?.length} members</p>
                </div>
                {isMember(room._id) ? (
                  <button
                    onClick={() => onSelectRoom(room)}
                    style={styles.joinedBtn}
                    className="cyber-ghost"
                  >
                    OPEN
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(room._id)}
                    style={styles.joinBtn}
                    className="cyber-btn"
                  >
                    JOIN
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* People Tab */}
        {tab === "people" && (
          <>
            <p style={styles.sectionLabel}>
              ALL_USERS <span style={styles.sectionCount}>[{users.length}]</span>
            </p>
            {users.map((u) => {
              const active = activeDM?._id === u._id
              const online = isUserOnline(u._id)
              return (
                <div
                  key={u._id}
                  onClick={() => onSelectDM(u)}
                  className="cyber-item"
                  style={{
                    ...styles.userItem,
                    borderLeft: active ? "2px solid #00f5ff" : "2px solid transparent",
                    background: active
                      ? "linear-gradient(90deg, rgba(0,245,255,0.12), rgba(191,0,255,0.04))"
                      : undefined,
                    boxShadow: active ? "inset 4px 0 12px -4px rgba(0,245,255,0.6)" : "none",
                  }}
                >
                  <div style={styles.avatarWrap}>
                    <div
                      style={{
                        ...styles.avatar,
                        borderColor: active ? "#00f5ff" : "#bf00ff",
                        color: active ? "#00f5ff" : "#bf00ff",
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={online ? "cyber-pulse" : undefined}
                      style={{
                        ...styles.onlineDot,
                        backgroundColor: online ? "#00f5ff" : "#3d3d4a",
                        boxShadow: online
                          ? "0 0 6px #00f5ff, 0 0 12px #00f5ff"
                          : "none",
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ ...styles.userName2, color: active ? "#ffffff" : "#c8c8d0" }}>
                      {u.name}
                    </p>
                    <p
                      style={{
                        ...styles.userStatus,
                        color: online ? "#00f5ff" : "#3d3d4a",
                      }}
                    >
                      {online ? "● ONLINE" : "○ OFFLINE"}
                    </p>
                  </div>
                </div>
              )
            })}
          </>
        )}

      </div>
    </div>
  )
}

const mono = "'Share Tech Mono', monospace"

const styles = {
  sidebar: {
    position: "relative",
    width: "280px",
    flexShrink: 0,
    backgroundColor: "#111111",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1f1f1f",
    height: "100%",
    overflow: "hidden",
  },
  edge: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "2px",
    background: "linear-gradient(180deg, #ff2d78, #bf00ff 50%, #00f5ff)",
    boxShadow: "0 0 10px rgba(255,45,120,0.6), 0 0 20px rgba(191,0,255,0.3)",
    zIndex: 1,
  },
  header: {
    padding: "calc(18px + env(safe-area-inset-top)) 16px 16px 20px",
    borderBottom: "1px solid #1f1f1f",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  appName: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "3px",
    color: "#ff2d78",
    textShadow: "0 0 8px rgba(255,45,120,0.7)",
    lineHeight: 1,
  },
  appAccent: {
    color: "#00f5ff",
    textShadow: "0 0 8px rgba(0,245,255,0.7)",
  },
  userName: {
    fontFamily: mono,
    fontSize: "12px",
    color: "#6b6b7b",
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userDot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#00f5ff",
    boxShadow: "0 0 6px #00f5ff",
    flexShrink: 0,
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid #ff2d78",
    color: "#ff2d78",
    padding: "6px 10px",
    cursor: "pointer",
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #1f1f1f",
  },
  tab: {
    flex: 1,
    padding: "12px",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    cursor: "pointer",
    fontFamily: mono,
    fontSize: "13px",
    letterSpacing: "2px",
    transition: "all 0.2s",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 12px calc(12px + env(safe-area-inset-bottom)) 14px",
  },
  createBtn: {
    width: "100%",
    padding: "10px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff)",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "2px",
    marginBottom: "12px",
  },
  cancelBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "transparent",
    color: "#ff2d78",
    border: "1px solid #ff2d78",
    cursor: "pointer",
    fontFamily: mono,
    fontSize: "13px",
    letterSpacing: "2px",
    marginBottom: "12px",
  },
  createForm: {
    backgroundColor: "#0d0d0d",
    border: "1px solid #1f1f1f",
    borderTop: "1px solid #bf00ff",
    padding: "12px",
    marginBottom: "12px",
  },
  formError: {
    fontFamily: mono,
    color: "#ff2d78",
    fontSize: "11px",
    marginBottom: "8px",
  },
  formLabel: {
    display: "block",
    fontFamily: mono,
    fontSize: "10px",
    color: "#00f5ff",
    letterSpacing: "1px",
    marginBottom: "4px",
  },
  formInput: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #1f1f1f",
    backgroundColor: "#111111",
    color: "#e6e6e6",
    fontFamily: mono,
    fontSize: "13px",
    marginBottom: "10px",
    boxSizing: "border-box",
    outline: "none",
  },
  formBtn: {
    width: "100%",
    padding: "8px",
    background: "linear-gradient(90deg, #bf00ff, #00f5ff)",
    color: "#0d0d0d",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    letterSpacing: "2px",
  },
  sectionLabel: {
    fontFamily: mono,
    fontSize: "11px",
    color: "#bf00ff",
    letterSpacing: "2px",
    marginBottom: "6px",
    marginTop: "14px",
    textShadow: "0 0 6px rgba(191,0,255,0.5)",
  },
  sectionCount: {
    color: "#3d3d4a",
    textShadow: "none",
  },
  roomItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 8px",
    borderLeft: "2px solid transparent",
    cursor: "pointer",
    marginBottom: "2px",
  },
  roomHash: {
    fontFamily: mono,
    fontSize: "18px",
    color: "#3d3d4a",
  },
  roomName: {
    fontSize: "15px",
    color: "#c8c8d0",
    fontWeight: 600,
    letterSpacing: "0.5px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  roomMeta: {
    fontFamily: mono,
    fontSize: "10px",
    color: "#4a4a58",
    marginTop: "2px",
  },
  joinBtn: {
    background: "linear-gradient(90deg, #ff2d78, #bf00ff)",
    color: "#ffffff",
    border: "none",
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: mono,
    fontSize: "10px",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  joinedBtn: {
    backgroundColor: "transparent",
    color: "#00f5ff",
    border: "1px solid #00f5ff",
    padding: "3px 9px",
    cursor: "pointer",
    fontFamily: mono,
    fontSize: "10px",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "9px 8px",
    cursor: "pointer",
    marginBottom: "2px",
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#bf00ff",
    backgroundColor: "#0d0d0d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: mono,
    fontSize: "16px",
    color: "#bf00ff",
  },
  onlineDot: {
    width: "8px",
    height: "8px",
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    border: "1px solid #111111",
  },
  userName2: {
    fontSize: "15px",
    color: "#c8c8d0",
    fontWeight: 600,
    letterSpacing: "0.5px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userStatus: {
    fontFamily: mono,
    fontSize: "10px",
    letterSpacing: "1px",
    marginTop: "2px",
  },
}

export default Sidebar
