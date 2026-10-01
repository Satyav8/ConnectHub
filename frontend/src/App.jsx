import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Chat from "./pages/Chat.jsx"
import NotFound from "./pages/NotFound.jsx"

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />}
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