import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()

    if (!name || !email || !password || !confirm) {
      setError("All fields are required")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      setError("")
      await register(name, email, password)
      navigate("/chat")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page} className="cyber-grid">
      <div style={styles.glow} />

      <div style={styles.card}>
        <div style={styles.topBorder} />

        {/* Logo */}
        <div style={styles.logo}>
          <p style={styles.sysTag}>SYS://NEW_IDENTITY_PROTOCOL</p>
          <h1 style={styles.logoText} className="cyber-flicker">
            CONNECT<span style={styles.logoAccent}>HUB</span>
          </h1>
          <p style={styles.logoSub}>
            &gt; FORGE YOUR NET IDENTITY<span className="cyber-blink">_</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span style={styles.errorTag}>[ ERR ]</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister}>
          <div style={styles.field}>
            <label style={styles.label}>// HANDLE</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="your_alias"
              style={styles.input}
              className="cyber-input"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>// EMAIL_ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@netcity.io"
              style={styles.input}
              className="cyber-input"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>// ACCESS_KEY</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="min 6 chars"
              style={styles.input}
              className="cyber-input"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>// CONFIRM_ACCESS_KEY</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              className="cyber-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn"
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "INITIALIZING..." : "[ CREATE IDENTITY ]"}
          </button>
        </form>

        {/* Switch to login */}
        <p style={styles.switch}>
          ALREADY IN THE NET?{" "}
          <Link to="/login" style={styles.link} className="cyber-link">
            &gt; ENTER_SYSTEM
          </Link>
        </p>

        <div style={styles.footer}>
          <span>STATUS: <span style={{ color: "#00f5ff" }}>ONLINE</span></span>
          <span>ENCRYPTION: AES-256</span>
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d0d0d",
    padding: "16px",
    position: "relative",
    overflow: "auto",
  },
  glow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(0,245,255,0.1) 0%, rgba(191,0,255,0.08) 40%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    backgroundColor: "#111111",
    border: "1px solid #1f1f1f",
    padding: "36px 36px 24px",
    width: "100%",
    maxWidth: "420px",
    margin: "auto",
    boxShadow: "0 0 40px rgba(0,245,255,0.06), 0 20px 60px rgba(0,0,0,0.7)",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, #00f5ff, #bf00ff, #ff2d78)",
    boxShadow: "0 0 12px rgba(0,245,255,0.6)",
  },
  logo: {
    textAlign: "center",
    marginBottom: "28px",
  },
  sysTag: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "11px",
    color: "#bf00ff",
    letterSpacing: "2px",
    marginBottom: "10px",
  },
  logoText: {
    fontSize: "40px",
    fontWeight: 700,
    letterSpacing: "6px",
    color: "#ff2d78",
    textShadow: "0 0 10px rgba(255,45,120,0.8), 0 0 30px rgba(255,45,120,0.4)",
    lineHeight: 1,
  },
  logoAccent: {
    color: "#00f5ff",
    textShadow: "0 0 10px rgba(0,245,255,0.8), 0 0 30px rgba(0,245,255,0.4)",
  },
  logoSub: {
    fontFamily: "'Share Tech Mono', monospace",
    color: "#6b6b7b",
    fontSize: "13px",
    marginTop: "12px",
  },
  error: {
    fontFamily: "'Share Tech Mono', monospace",
    backgroundColor: "rgba(255,45,120,0.08)",
    color: "#ff2d78",
    padding: "10px 14px",
    marginBottom: "20px",
    fontSize: "13px",
    borderLeft: "2px solid #ff2d78",
    boxShadow: "inset 0 0 20px rgba(255,45,120,0.05)",
  },
  errorTag: {
    fontWeight: "bold",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "12px",
    letterSpacing: "1px",
    marginBottom: "8px",
    color: "#00f5ff",
    textShadow: "0 0 6px rgba(0,245,255,0.5)",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #1f1f1f",
    backgroundColor: "#0d0d0d",
    color: "#e6e6e6",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff)",
    color: "#ffffff",
    border: "none",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "4px",
    marginTop: "10px",
    boxShadow: "0 0 16px rgba(255,45,120,0.35)",
  },
  switch: {
    textAlign: "center",
    marginTop: "24px",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "12px",
    color: "#6b6b7b",
  },
  link: {
    color: "#00f5ff",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "28px",
    paddingTop: "12px",
    borderTop: "1px solid #1f1f1f",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "10px",
    color: "#3d3d4a",
    letterSpacing: "1px",
  },
}

export default Register
