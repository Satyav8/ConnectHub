function MessageBubble({ message, isOwn }) {
  const isSystem = message.messageType === "system"

  if (isSystem) {
    return (
      <div style={styles.system}>
        <span style={styles.systemLine} />
        <span style={styles.systemText}>[ SYS ] {message.content}</span>
        <span style={styles.systemLine} />
      </div>
    )
  }

  const accent = isOwn ? "#ff2d78" : "#00f5ff"

  return (
    <div style={{
      ...styles.row,
      flexDirection: isOwn ? "row-reverse" : "row",
    }}>

      {/* Avatar */}
      <div style={{
        ...styles.avatar,
        borderColor: accent,
        color: accent,
        boxShadow: `0 0 8px ${accent}55`,
      }}>
        {message.sender?.name?.charAt(0).toUpperCase()}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "65%", minWidth: 0 }} className="msg-col">
        {!isOwn && (
          <p style={styles.senderName}>
            <span style={{ color: "#3d3d4a" }}>&lt;</span>
            {message.sender?.name}
            <span style={{ color: "#3d3d4a" }}>&gt;</span>
          </p>
        )}
        <div style={{
          ...styles.bubble,
          ...(isOwn
            ? {
                background: "linear-gradient(270deg, rgba(255,45,120,0.18), rgba(191,0,255,0.06))",
                borderRight: "2px solid #ff2d78",
                borderLeft: "1px solid #1f1f1f",
                boxShadow: "4px 0 14px -6px rgba(255,45,120,0.8)",
              }
            : {
                background: "linear-gradient(90deg, rgba(0,245,255,0.12), rgba(191,0,255,0.05))",
                borderLeft: "2px solid #00f5ff",
                borderRight: "1px solid #1f1f1f",
                boxShadow: "-4px 0 14px -6px rgba(0,245,255,0.8)",
              }),
        }}>
          <p style={styles.content}>{message.content}</p>
        </div>
        <p style={{
          ...styles.time,
          textAlign: isOwn ? "right" : "left",
        }}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

    </div>
  )
}

const mono = "'Share Tech Mono', monospace"

const styles = {
  system: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "10px 0",
  },
  systemLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(90deg, transparent, #bf00ff66, transparent)",
  },
  systemText: {
    fontFamily: mono,
    color: "#bf00ff",
    fontSize: "11px",
    letterSpacing: "1px",
    textShadow: "0 0 6px rgba(191,0,255,0.5)",
    whiteSpace: "nowrap",
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "8px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderWidth: "1px",
    borderStyle: "solid",
    backgroundColor: "#0d0d0d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: mono,
    fontSize: "14px",
    flexShrink: 0,
  },
  senderName: {
    fontFamily: mono,
    fontSize: "12px",
    color: "#00f5ff",
    marginBottom: "4px",
    letterSpacing: "0.5px",
  },
  bubble: {
    padding: "10px 14px",
    wordBreak: "break-word",
    borderTop: "1px solid #1f1f1f",
    borderBottom: "1px solid #1f1f1f",
  },
  content: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#e6e6e6",
    lineHeight: "1.4",
  },
  time: {
    fontFamily: mono,
    fontSize: "10px",
    color: "#4a4a58",
    letterSpacing: "1px",
    marginTop: "4px",
  },
}

export default MessageBubble
