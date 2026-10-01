import { useState, useEffect } from "react"
import {
  getPushState, enablePush, disablePush,
  canPromptInstall, onInstallAvailable, promptInstall,
  isIOS, isStandalone,
} from "../utils/push.js"

// Notification toggle + "install app" button shown under the sidebar header
function AppControls() {
  const [pushState, setPushState] = useState("unsupported")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [installReady, setInstallReady] = useState(canPromptInstall)
  const [showIosHelp, setShowIosHelp] = useState(false)

  const iosBrowser = isIOS() && !isStandalone()

  useEffect(() => {
    getPushState().then(setPushState).catch(() => setPushState("unsupported"))
    return onInstallAvailable(setInstallReady)
  }, [])

  async function toggleAlerts() {
    if (pushState === "needs-install") {
      setShowIosHelp(true)
      return
    }
    try {
      setBusy(true)
      setError("")
      setPushState(pushState === "on" ? await disablePush() : await enablePush())
    } catch (err) {
      console.error("Notification toggle failed:", err)
      setError("ALERTS UNAVAILABLE — TRY AGAIN LATER")
    } finally {
      setBusy(false)
    }
  }

  async function handleInstall() {
    if (installReady) await promptInstall()
    else setShowIosHelp((v) => !v)
  }

  const showAlerts = pushState !== "unsupported"
  const showInstall = !isStandalone() && (installReady || iosBrowser)
  if (!showAlerts && !showInstall) return null

  const on = pushState === "on"
  const denied = pushState === "denied"

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        {showAlerts && (
          <button
            type="button"
            onClick={toggleAlerts}
            disabled={busy || denied}
            className="cyber-ghost"
            title={denied ? "Notifications are blocked — allow them in your browser's site settings" : undefined}
            style={{
              ...styles.btn,
              color: on ? "#00f5ff" : denied ? "#4a4a58" : "#c8c8d0",
              borderColor: on ? "#00f5ff" : "#1f1f1f",
              boxShadow: on ? "0 0 10px rgba(0,245,255,0.25)" : "none",
              cursor: busy || denied ? "not-allowed" : "pointer",
            }}
          >
            <span
              style={{
                ...styles.dot,
                backgroundColor: on ? "#00f5ff" : "transparent",
                borderColor: on ? "#00f5ff" : denied ? "#4a4a58" : "#6b6b7b",
                boxShadow: on ? "0 0 6px #00f5ff" : "none",
              }}
            />
            {busy ? "SYNCING..." : denied ? "ALERTS BLOCKED" : on ? "ALERTS: ON" : "ALERTS: OFF"}
          </button>
        )}

        {showInstall && (
          <button
            type="button"
            onClick={handleInstall}
            className="cyber-btn"
            style={styles.installBtn}
          >
            ⬇ INSTALL APP
          </button>
        )}
      </div>

      {error && <p style={styles.error}>[ ERR ] {error}</p>}

      {showIosHelp && (
        <div style={styles.help}>
          <p style={styles.helpTag}>// INSTALL_ON_IPHONE</p>
          <p>1. Tap <b style={styles.hl}>Share</b> (the square with ↑) in Safari</p>
          <p>2. Choose <b style={styles.hl}>Add to Home Screen</b></p>
          <p>3. Open ConnectHub from your home screen and turn <b style={styles.hl}>ALERTS</b> on</p>
          <button type="button" onClick={() => setShowIosHelp(false)} style={styles.helpClose}>
            [ GOT IT ]
          </button>
        </div>
      )}
    </div>
  )
}

const mono = "'Share Tech Mono', monospace"

const styles = {
  wrap: {
    padding: "10px 14px 10px 18px",
    borderBottom: "1px solid #1f1f1f",
  },
  row: {
    display: "flex",
    gap: "8px",
  },
  btn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "8px 10px",
    backgroundColor: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "1px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    flexShrink: 0,
  },
  installBtn: {
    flex: 1,
    padding: "8px 10px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff)",
    color: "#ffffff",
    border: "none",
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "1px",
    cursor: "pointer",
  },
  error: {
    fontFamily: mono,
    fontSize: "10px",
    color: "#ff2d78",
    marginTop: "8px",
  },
  help: {
    marginTop: "10px",
    padding: "10px 12px",
    backgroundColor: "#0d0d0d",
    border: "1px solid #1f1f1f",
    borderLeft: "2px solid #00f5ff",
    fontFamily: mono,
    fontSize: "12px",
    lineHeight: 1.7,
    color: "#c8c8d0",
  },
  helpTag: {
    color: "#bf00ff",
    fontSize: "10px",
    letterSpacing: "2px",
    marginBottom: "4px",
  },
  hl: {
    color: "#00f5ff",
    fontWeight: "normal",
  },
  helpClose: {
    marginTop: "8px",
    background: "transparent",
    border: "none",
    color: "#ff2d78",
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "1px",
    cursor: "pointer",
    padding: 0,
  },
}

export default AppControls
