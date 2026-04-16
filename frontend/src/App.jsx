import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import PlaceOrder from './pages/PlaceOrder'
import TrackOrder from './pages/TrackOrder'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import PaymentVerify from './pages/PaymentVerify'
import ChatbotWidget from './components/ChatbotWidget'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuthStore()
  return user?.role === 'admin' ? children : <Navigate to="/" />
}

export default function App() {
  const { initTheme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/order/:id" element={
          <ProtectedRoute><PlaceOrder /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/payment/verify" element={
          <ProtectedRoute><PaymentVerify /></ProtectedRoute>
        } />
      </Routes>
      {isAuthenticated && <ChatbotWidget />}
    </>
  )
}



