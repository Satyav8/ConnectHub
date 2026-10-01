import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const REPO = "Satyav8/ConnectHub"
const APK_URL = `https://github.com/${REPO}/releases/latest/download/ConnectHub.apk`
const YEAR = new Date().getFullYear()

const FEATURES = [
  { tag: "01", title: "LIVE ROOMS", text: "Spin up a room, invite the crew, and talk in real time." },
  { tag: "02", title: "DIRECT LINKS", text: "Private one-to-one messages with anyone on the network." },
  { tag: "03", title: "PUSH ALERTS", text: "Get pinged the moment someone messages you — even with the app closed." },
  { tag: "04", title: "ANY DEVICE", text: "Android app, plus a web app for iPhone, tablet and desktop." },
]

const STEPS = [
  { n: "1", title: "DOWNLOAD", text: "Tap the download button and open ConnectHub.apk when it finishes." },
  { n: "2", title: "ALLOW INSTALL", text: "If Android asks, allow your browser to install unknown apps, then tap Install." },
  { n: "3", title: "JACK IN", text: "Open ConnectHub, log in, and switch ALERTS on to get notifications." },
]

function Landing() {
  const { user } = useAuth()
  // undefined = still checking, null = no release yet / unknown
  const [release, setRelease] = useState(undefined)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then((r) => (r.status === 404 ? { none: true } : r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return setRelease(null)
        if (data.none) return setRelease({ none: true })
        const apk = data.assets?.find((a) => a.name === "ConnectHub.apk")
        setRelease(apk
          ? { version: data.tag_name, sizeMb: (apk.size / 1048576).toFixed(1) }
          : { none: true })
      })
      .catch(() => setRelease(null))
  }, [])

  const noBuild = release?.none
  const appLink = user ? "/chat" : "/login"

  return (
    <div style={styles.page} className="cyber-grid">
      <div style={styles.glowPink} />
      <div style={styles.glowCyan} />

      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.logo}>
          CONNECT<span style={styles.logoAccent}>HUB</span>
        </span>
        <Link to={appLink} style={styles.navBtn} className="cyber-ghost">
          {user ? "[ OPEN APP ]" : "[ LOGIN ]"}
        </Link>
      </nav>

      {/* Hero */}
      <section style={styles.hero} className="landing-hero">
        <div style={styles.heroText}>
          <p style={styles.tag}>// SECURE_CHANNEL_ESTABLISHED</p>
          <h1 style={styles.h1} className="landing-h1">
            JACK INTO THE<br />
            <span style={styles.h1Pink}>CONVER</span><span style={styles.h1Cyan}>SATION</span>
          </h1>
          <p style={styles.sub}>
            &gt; Neon-lit chat rooms and direct messages for you and your crew.
            Real-time, everywhere<span className="cyber-blink">_</span>
          </p>

          <div style={styles.ctaRow} className="landing-cta">
            {noBuild ? (
              <span style={{ ...styles.downloadBtn, ...styles.downloadDisabled }}>
                ANDROID BUILD COMPILING...
              </span>
            ) : (
              <a href={APK_URL} style={styles.downloadBtn} className="cyber-btn">
                <span style={styles.downloadIcon}>⬇</span>
                <span>
                  <span style={styles.downloadTitle}>DOWNLOAD FOR ANDROID</span>
                  <span style={styles.downloadMeta}>
                    {release?.version ? `${release.version} · ${release.sizeMb} MB · APK` : "FREE · APK"}
                  </span>
                </span>
              </a>
            )}
            <Link to={appLink} style={styles.webBtn} className="cyber-ghost">
              [ OPEN WEB APP ]
            </Link>
          </div>

          <p style={styles.iosNote}>
            <span style={{ color: "#bf00ff" }}>iPHONE?</span> Open the web app in Safari →
            Share → <span style={{ color: "#00f5ff" }}>Add to Home Screen</span>.
          </p>
        </div>

        {/* Phone mockup */}
        <div style={styles.phoneWrap} className="landing-phone">
          <div style={styles.phone}>
            <div style={styles.phoneNotch} />
            <div style={styles.phoneHeader}>
              <span style={styles.phoneTitle}># night_city</span>
              <span style={styles.phoneSub}>4 MEMBERS // CHANNEL_SECURE</span>
              <div style={styles.phoneLine} />
            </div>
            <div style={styles.phoneBody}>
              <MockBubble name="v" text="anyone up for a run tonight?" />
              <MockBubble own text="always. meet at the afterlife" />
              <MockBubble name="judy" text="bringing the braindance rig 🎧" />
              <MockBubble own text="TRANSMITTING coordinates..." />
              <p style={styles.typing}>&gt; jackie is TRANSMITTING...</p>
            </div>
            <div style={styles.phoneInput}>
              <span style={{ color: "#ff2d78" }}>&gt;_</span>
              <span style={{ color: "#3d3d4a" }}>Message # night_city</span>
            </div>
          </div>
          <div style={styles.notif} className="landing-notif">
            <span style={styles.notifBar} />
            <span style={styles.notifTag}>// INCOMING_TRANSMISSION</span>
            <span style={styles.notifTitle}>judy</span>
            <span style={styles.notifBody}>you coming or what?</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.section}>
        <p style={styles.sectionTag}>// SYSTEM_FEATURES</p>
        <div style={styles.grid} className="landing-grid">
          {FEATURES.map((f) => (
            <div key={f.tag} style={styles.card}>
              <span style={styles.cardNum}>{f.tag}</span>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardText}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Install steps */}
      <section style={styles.section}>
        <p style={styles.sectionTag}>// INSTALL_PROTOCOL :: ANDROID</p>
        <div style={styles.grid3} className="landing-grid">
          {STEPS.map((s) => (
            <div key={s.n} style={styles.step}>
              <span style={styles.stepNum}>{s.n}</span>
              <div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.cardText}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={styles.safeNote}>
          The APK is built automatically from the public source code on{" "}
          <a href={`https://github.com/${REPO}`} style={styles.inlineLink} className="cyber-link">GitHub</a>.
          Android shows the "unknown apps" prompt for any app installed outside the Play Store.
        </p>
      </section>

      <footer style={styles.footer}>
        <span>CONNECTHUB // {YEAR}</span>
        <span>STATUS: <span style={{ color: "#00f5ff" }}>ONLINE</span></span>
      </footer>
    </div>
  )
}

function MockBubble({ own, name, text }) {
  const accent = own ? "#ff2d78" : "#00f5ff"
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: own ? "flex-end" : "flex-start", marginBottom: "10px" }}>
      {!own && <span style={{ ...styles.mockName, color: accent }}>&lt;{name}&gt;</span>}
      <span
        style={{
          ...styles.mockBubble,
          ...(own
            ? { background: "linear-gradient(270deg, rgba(255,45,120,0.2), rgba(191,0,255,0.06))", borderRight: `2px solid ${accent}` }
            : { background: "linear-gradient(90deg, rgba(0,245,255,0.14), rgba(191,0,255,0.05))", borderLeft: `2px solid ${accent}` }),
        }}
      >
        {text}
      </span>
    </div>
  )
}

const mono = "'Share Tech Mono', monospace"

const styles = {
  page: {
    minHeight: "100dvh",
    height: "100dvh",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: "#0d0d0d",
    position: "relative",
    color: "#e6e6e6",
  },
  glowPink: {
    position: "absolute",
    top: "-200px",
    left: "-200px",
    width: "700px",
    height: "700px",
    background: "radial-gradient(circle, rgba(255,45,120,0.14) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  glowCyan: {
    position: "absolute",
    top: "200px",
    right: "-250px",
    width: "700px",
    height: "700px",
    background: "radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  nav: {
    position: "relative",
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "calc(20px + env(safe-area-inset-top)) 16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "4px",
    color: "#ff2d78",
    textShadow: "0 0 10px rgba(255,45,120,0.7)",
  },
  logoAccent: {
    color: "#00f5ff",
    textShadow: "0 0 10px rgba(0,245,255,0.7)",
  },
  navBtn: {
    border: "1px solid #ff2d78",
    color: "#ff2d78",
    padding: "8px 14px",
    fontFamily: mono,
    fontSize: "12px",
    letterSpacing: "1px",
  },
  hero: {
    position: "relative",
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "40px 16px 72px",
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "48px",
    alignItems: "center",
  },
  heroText: {
    minWidth: 0,
  },
  tag: {
    fontFamily: mono,
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#bf00ff",
    textShadow: "0 0 6px rgba(191,0,255,0.5)",
    marginBottom: "16px",
  },
  h1: {
    fontSize: "64px",
    lineHeight: 0.98,
    fontWeight: 700,
    letterSpacing: "3px",
    color: "#ffffff",
    marginBottom: "22px",
  },
  h1Pink: {
    color: "#ff2d78",
    textShadow: "0 0 14px rgba(255,45,120,0.7), 0 0 40px rgba(255,45,120,0.35)",
  },
  h1Cyan: {
    color: "#00f5ff",
    textShadow: "0 0 14px rgba(0,245,255,0.7), 0 0 40px rgba(0,245,255,0.35)",
  },
  sub: {
    fontFamily: mono,
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#8a8a9a",
    maxWidth: "520px",
    marginBottom: "32px",
  },
  ctaRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 22px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff)",
    color: "#ffffff",
    boxShadow: "0 0 20px rgba(255,45,120,0.4)",
  },
  downloadDisabled: {
    background: "#1a1a1a",
    color: "#6b6b7b",
    boxShadow: "none",
    fontFamily: mono,
    fontSize: "13px",
    letterSpacing: "1px",
    cursor: "default",
  },
  downloadIcon: {
    fontSize: "26px",
    lineHeight: 1,
  },
  downloadTitle: {
    display: "block",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "3px",
    lineHeight: 1.1,
  },
  downloadMeta: {
    display: "block",
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "1px",
    opacity: 0.85,
    marginTop: "3px",
  },
  webBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "14px 22px",
    border: "1px solid #00f5ff",
    color: "#00f5ff",
    fontFamily: mono,
    fontSize: "13px",
    letterSpacing: "2px",
  },
  iosNote: {
    fontFamily: mono,
    fontSize: "12px",
    color: "#6b6b7b",
    lineHeight: 1.6,
  },
  phoneWrap: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },
  phone: {
    position: "relative",
    width: "300px",
    maxWidth: "100%",
    height: "580px",
    backgroundColor: "#0d0d0d",
    border: "2px solid #1f1f1f",
    boxShadow: "0 0 0 6px #111111, 0 0 40px rgba(191,0,255,0.25), 0 30px 80px rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  phoneNotch: {
    position: "absolute",
    top: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "70px",
    height: "6px",
    backgroundColor: "#1f1f1f",
  },
  phoneHeader: {
    position: "relative",
    padding: "28px 16px 12px",
    backgroundColor: "#111111",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  phoneTitle: {
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#ff2d78",
    textShadow: "0 0 8px rgba(255,45,120,0.7)",
  },
  phoneSub: {
    fontFamily: mono,
    fontSize: "9px",
    color: "#6b6b7b",
    letterSpacing: "1px",
  },
  phoneLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "1px",
    background: "linear-gradient(90deg, #ff2d78, #bf00ff, #00f5ff)",
    boxShadow: "0 0 8px rgba(255,45,120,0.6)",
  },
  phoneBody: {
    flex: 1,
    padding: "16px 12px",
    backgroundImage:
      "linear-gradient(rgba(255,45,120,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,120,0.05) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
  },
  mockName: {
    fontFamily: mono,
    fontSize: "10px",
    marginBottom: "3px",
  },
  mockBubble: {
    maxWidth: "80%",
    padding: "8px 11px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#e6e6e6",
    borderTop: "1px solid #1f1f1f",
    borderBottom: "1px solid #1f1f1f",
  },
  typing: {
    fontFamily: mono,
    fontSize: "10px",
    color: "#00f5ff",
    marginTop: "6px",
  },
  phoneInput: {
    margin: "10px",
    padding: "10px 12px",
    border: "1px solid #1f1f1f",
    fontFamily: mono,
    fontSize: "12px",
    display: "flex",
    gap: "8px",
  },
  notif: {
    position: "absolute",
    top: "70px",
    right: "-10px",
    width: "220px",
    padding: "10px 12px 10px 14px",
    backgroundColor: "rgba(17,17,17,0.96)",
    border: "1px solid #1f1f1f",
    boxShadow: "0 0 24px rgba(255,45,120,0.3), 0 12px 40px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  },
  notifBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "2px",
    background: "linear-gradient(180deg, #ff2d78, #bf00ff, #00f5ff)",
  },
  notifTag: {
    fontFamily: mono,
    fontSize: "9px",
    letterSpacing: "1px",
    color: "#bf00ff",
  },
  notifTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#ff2d78",
  },
  notifBody: {
    fontFamily: mono,
    fontSize: "11px",
    color: "#c8c8d0",
  },
  section: {
    position: "relative",
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "0 16px 64px",
  },
  sectionTag: {
    fontFamily: mono,
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#00f5ff",
    textShadow: "0 0 6px rgba(0,245,255,0.5)",
    marginBottom: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },
  card: {
    padding: "20px",
    backgroundColor: "rgba(17,17,17,0.85)",
    border: "1px solid #1f1f1f",
    borderTop: "1px solid #bf00ff",
  },
  cardNum: {
    fontFamily: mono,
    fontSize: "11px",
    color: "#3d3d4a",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#ff2d78",
    margin: "6px 0 8px",
  },
  cardText: {
    fontFamily: mono,
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#8a8a9a",
  },
  step: {
    display: "flex",
    gap: "14px",
    padding: "20px",
    backgroundColor: "rgba(17,17,17,0.85)",
    border: "1px solid #1f1f1f",
    borderLeft: "2px solid #00f5ff",
  },
  stepNum: {
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: 1,
    color: "#00f5ff",
    textShadow: "0 0 10px rgba(0,245,255,0.6)",
  },
  stepTitle: {
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#ffffff",
    marginBottom: "6px",
  },
  safeNote: {
    fontFamily: mono,
    fontSize: "11px",
    color: "#4a4a58",
    lineHeight: 1.6,
    marginTop: "16px",
  },
  inlineLink: {
    color: "#00f5ff",
  },
  footer: {
    position: "relative",
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "20px 16px calc(28px + env(safe-area-inset-bottom))",
    borderTop: "1px solid #1f1f1f",
    display: "flex",
    justifyContent: "space-between",
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#3d3d4a",
  },
}

export default Landing
