import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) {
      setError("All fields are required")
      return
    }
    try {
      setLoading(true)
      setError("")
      await login(email, password)
      navigate("/chat")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.")
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
          <p style={styles.sysTag}>SYS://AUTH_GATEWAY v2.077</p>
          <h1 style={styles.logoText} className="cyber-flicker">
            CONNECT<span style={styles.logoAccent}>HUB</span>
          </h1>
          <p style={styles.logoSub}>
            &gt; IDENTIFY YOURSELF, RUNNER<span className="cyber-blink">_</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span style={styles.errorTag}>[ ERR ]</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
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
            {loading ? "AUTHENTICATING..." : "[ ENTER SYSTEM ]"}
          </button>
        </form>

        {/* Switch to register */}
        <p style={styles.switch}>
          NO ACCESS CREDENTIALS?{" "}
          <Link to="/register" style={styles.link} className="cyber-link">
            &gt; REGISTER_NEW_ID
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
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(191,0,255,0.15) 0%, rgba(255,45,120,0.06) 40%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    backgroundColor: "#111111",
    border: "1px solid #1f1f1f",
    padding: "40px 36px 24px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 0 40px rgba(255,45,120,0.08), 0 20px 60px rgba(0,0,0,0.7)",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff, #00f5ff)",
    boxShadow: "0 0 12px rgba(255,45,120,0.7)",
  },
  logo: {
    textAlign: "center",
    marginBottom: "32px",
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
    marginBottom: "18px",
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

export default Login
