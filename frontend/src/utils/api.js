import axios from "axios"

// In dev the API runs on its own port; in production it serves this app, so use the same origin
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "")

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
})

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("connecthub_user")
  if (user) {
    const parsed = JSON.parse(user)
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("connecthub_user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export const registerUser = (data) => api.post("/auth/register", data)
export const loginUser = (data) => api.post("/auth/login", data)
export const getMe = () => api.get("/auth/me")

export const getRooms = () => api.get("/rooms")
export const getMyRooms = () => api.get("/rooms/myrooms")
export const getRoomById = (id) => api.get(`/rooms/${id}`)
export const createRoom = (data) => api.post("/rooms", data)
export const joinRoom = (id) => api.post(`/rooms/${id}/join`)
export const leaveRoom = (id) => api.post(`/rooms/${id}/leave`)

export const getRoomMessages = (roomId, page = 1) =>
  api.get(`/messages/${roomId}?page=${page}`)
export const sendMessage = (roomId, content) =>
  api.post(`/messages/${roomId}`, { content })
export const deleteMessage = (messageId) =>
  api.delete(`/messages/${messageId}`)

export const getDirectMessages = (userId, page = 1) =>
  api.get(`/messages/direct/${userId}?page=${page}`)
export const sendDirectMessage = (userId, content) =>
  api.post(`/messages/direct/${userId}`, { content })
export const markDirectMessagesRead = (userId) =>
  api.patch(`/messages/direct/${userId}/read`)

export const getUsers = () => api.get("/users")
export const getUserById = (id) => api.get(`/users/${id}`)

export const getVapidPublicKey = () => api.get("/push/vapid-public-key")
export const savePushSubscription = (subscription) =>
  api.post("/push/subscribe", subscription)
export const removePushSubscription = (endpoint) =>
  api.post("/push/unsubscribe", { endpoint })

export default api