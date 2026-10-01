import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Chat from "./pages/Chat.jsx"
import NotFound from "./pages/NotFound.jsx"
import Landing from "./pages/Landing.jsx"
import { isNative } from "./utils/nativePush.js"

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Website: download/landing page. Android app: straight into the app */}
      <Route
        path="/"
        element={
          isNative
            ? (user ? <Navigate to="/chat" /> : <Navigate to="/login" />)
            : <Landing />
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/chat" /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/chat" /> : <Register />}
      />
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App