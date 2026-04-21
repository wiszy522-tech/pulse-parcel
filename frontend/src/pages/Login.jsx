import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2, Sun, Moon, Monitor } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#0a0a1a' : '#f8fafc',
    card: isDark ? '#0a0a1a' : '#ffffff',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#6b7280' : '#64748b',
    label: isDark ? '#d1d5db' : '#374151',
    inputBg: isDark ? '#111827' : '#f1f5f9',
    inputBorder: isDark ? '#374151' : '#e2e8f0',
    inputText: isDark ? '#ffffff' : '#0f172a',
    divider: isDark ? '#1f2937' : '#e2e8f0',
    themeBtnBg: isDark ? '#1f2937' : '#e2e8f0',
    themeBtnText: isDark ? '#9ca3af' : '#64748b',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login/', { email, password })
      setAuth(res.data.user, res.data.tokens)
      toast.success('Welcome back!')
      navigate(res.data.user.role === 'admin' ? '/admin' : '/products')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      try {
        const res = await api.post('/auth/google/', { token: tokenResponse.access_token })
        setAuth(res.data.user, res.data.tokens)
        toast.success(res.data.message)
        navigate(res.data.user.role === 'admin' ? '/admin' : '/products')
      } catch {
        toast.error('Google login failed')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => toast.error('Google login failed')
  })

  const themeOptions = [
    { key: 'light', icon: <Sun style={{ width: '13px', height: '13px' }} />, label: 'Light' },
    { key: 'dark', icon: <Moon style={{ width: '13px', height: '13px' }} />, label: 'Dark' },
    { key: 'system', icon: <Monitor style={{ width: '13px', height: '13px' }} />, label: 'System' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>

      {/* Left side - Logistics Image */}
      <div style={{ width: '50%', position: 'relative', overflow: 'hidden' }}
        className="hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop"
          alt="Logistics"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(45,45,127,0.85) 0%, rgba(45,45,127,0.65) 50%, rgba(232,84,26,0.55) 100%)'
        }} />
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '56px', color: 'white', height: '100%'
        }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}
          >
            Fast. Reliable.<br />
            <span style={{ color: '#F5A623' }}>Trackable.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', lineHeight: 1.7 }}
          >
            Your parcels, delivered with precision<br />and tracked in real time.
          </motion.p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: colors.card, padding: window.innerWidth < 768 ? '24px' : '48px 24px',
        position: 'relative', minHeight: '100vh',
      }}>

        {/* Theme toggle */}
        <div style={{ position: 'absolute', top: window.innerWidth < 768 ? '16px' : '24px', right: window.innerWidth < 768 ? '12px' : '24px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {themeOptions.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              style={{
                padding: window.innerWidth < 768 ? '5px 10px' : '6px 12px', borderRadius: '999px',
                fontSize: window.innerWidth < 768 ? '11px' : '12px', fontWeight: 600, border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '3px' : '5px',
                background: theme === key ? '#2D2D7F' : colors.themeBtnBg,
                color: theme === key ? 'white' : colors.themeBtnText,
                transition: 'all 0.2s'
              }}
            >
              {icon} {window.innerWidth < 768 ? '' : label}
            </button>
          ))}
        </div>

        {/* Form container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: window.innerWidth < 768 ? '100%' : '440px' }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '12px' : '16px', marginBottom: window.innerWidth < 768 ? '32px' : '48px' }}>
            <img src="/p_logo.png" alt="Logo" style={{
              width: window.innerWidth < 768 ? '60px' : '80px', height: window.innerWidth < 768 ? '60px' : '80px', borderRadius: '18px',
              objectFit: 'contain', background: 'transparent',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: window.innerWidth < 768 ? '18px' : '24px', color: colors.text, letterSpacing: '-0.5px' }}>PULSE PARCEL</div>
              <div style={{ fontSize: window.innerWidth < 768 ? '10px' : '12px', color: '#E8541A', letterSpacing: '2px', fontWeight: 700 }}>LIMITED</div>
            </div>
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: window.innerWidth < 768 ? '28px' : '38px', fontWeight: 900, color: colors.text, marginBottom: '8px', lineHeight: 1.1 }}>
            Welcome back
          </h2>
          <p style={{ color: colors.subtext, fontSize: window.innerWidth < 768 ? '14px' : '16px', marginBottom: window.innerWidth < 768 ? '28px' : '40px' }}>
            Sign in to track your parcels
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: window.innerWidth < 768 ? '13px' : '14px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', paddingLeft: '46px', paddingRight: '16px',
                    paddingTop: window.innerWidth < 768 ? '12px' : '15px', paddingBottom: window.innerWidth < 768 ? '12px' : '15px',
                    borderRadius: '12px', border: `1.5px solid ${colors.inputBorder}`,
                    background: colors.inputBg, color: colors.inputText,
                    fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: window.innerWidth < 768 ? '24px' : '32px' }}>
              <label style={{ display: 'block', fontSize: window.innerWidth < 768 ? '13px' : '14px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', paddingLeft: '46px', paddingRight: '50px',
                    paddingTop: window.innerWidth < 768 ? '12px' : '15px', paddingBottom: window.innerWidth < 768 ? '12px' : '15px',
                    borderRadius: '12px', border: `1.5px solid ${colors.inputBorder}`,
                    background: colors.inputBg, color: colors.inputText,
                    fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '16px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', padding: 0
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: window.innerWidth < 768 ? '14px' : '16px', borderRadius: '12px',
                background: '#2D2D7F', color: 'white',
                fontWeight: 800, fontSize: window.innerWidth < 768 ? '15px' : '16px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginBottom: '14px',
                transition: 'background 0.2s', boxSizing: 'border-box'
              }}
            >
              {loading ? <Loader2 style={{ width: '20px', height: '20px' }} className="animate-spin" /> : 'Sign In'}
            </button>

            {/* Google Login */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={googleLoading}
              style={{
                width: '100%', padding: window.innerWidth < 768 ? '12px' : '15px', borderRadius: '12px',
                border: `1.5px solid ${colors.inputBorder}`,
                background: colors.inputBg, color: colors.inputText,
                fontWeight: 700, fontSize: window.innerWidth < 768 ? '14px' : '15px',
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                opacity: googleLoading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', marginBottom: '16px',
                transition: 'all 0.2s', boxSizing: 'border-box'
              }}
            >
              {googleLoading ? (
                <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {window.innerWidth < 768 ? 'Google' : 'Continue with Google'}
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: colors.divider }} />
              <span style={{ color: colors.subtext, fontSize: window.innerWidth < 768 ? '12px' : '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: colors.divider }} />
            </div>

            {/* Track without login */}
            <Link
              to="/track"
              style={{
                display: 'block', width: '100%', padding: window.innerWidth < 768 ? '12px' : '15px',
                borderRadius: '12px', border: '2px solid #E8541A',
                color: '#E8541A', fontWeight: 700, fontSize: window.innerWidth < 768 ? '14px' : '15px',
                textAlign: 'center', textDecoration: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s'
              }}
            >
              Track a Parcel Without Login
            </Link>
          </form>

          {/* Register link */}
          <p style={{ textAlign: 'center', color: colors.subtext, marginTop: window.innerWidth < 768 ? '20px' : '32px', fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#E8541A', fontWeight: 700, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}






