import { createContext, useContext, useState } from "react"
import { loginUser, registerUser } from "../utils/api.js"
import { disablePush, syncPushSubscription } from "../utils/push.js"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("connecthub_user")
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem("connecthub_user")
      return null
    }
  })

  async function login(email, password) {
    const { data } = await loginUser({ email, password })
    setUser(data)
    localStorage.setItem("connecthub_user", JSON.stringify(data))
    syncPushSubscription()
    return data
  }

  async function register(name, email, password) {
    const { data } = await registerUser({ name, email, password })
    setUser(data)
    localStorage.setItem("connecthub_user", JSON.stringify(data))
    syncPushSubscription()
    return data
  }

  async function logout() {
    // Stop this device getting the old account's notifications (needs the token, so before clearing)
    await disablePush().catch(() => {})
    setUser(null)
    localStorage.removeItem("connecthub_user")
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}