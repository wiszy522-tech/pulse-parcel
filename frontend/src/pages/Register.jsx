import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Loader2, Sun, Moon, Monitor } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import useIsMobile from '../hooks/useIsMobile'

export default function Register() {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', confirm_password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register/', form)
      setAuth(res.data.user, res.data.tokens)
      toast.success('Account created successfully!')
      navigate('/products')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        const first = Object.values(errors)[0]
        toast.error(Array.isArray(first) ? first[0] : first)
      } else {
        toast.error('Registration failed')
      }
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
        navigate('/products')
      } catch {
        toast.error('Google sign up failed')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => toast.error('Google sign up failed')
  })

  const themeOptions = [
    { key: 'light', icon: <Sun style={{ width: '13px', height: '13px' }} />, label: 'Light' },
    { key: 'dark', icon: <Moon style={{ width: '13px', height: '13px' }} />, label: 'Dark' },
    { key: 'system', icon: <Monitor style={{ width: '13px', height: '13px' }} />, label: 'System' },
  ]

  const inputStyle = {
    width: '100%', paddingLeft: '44px', paddingRight: '16px',
    paddingTop: '13px', paddingBottom: '13px',
    borderRadius: '12px', border: `1.5px solid ${colors.inputBorder}`,
    background: colors.inputBg, color: colors.inputText,
    fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>

      {/* Left side — desktop only */}
      {!isMobile && (
        <div style={{ width: '50%', position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&auto=format&fit=crop"
            alt="Logistics"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(45,45,127,0.88) 0%, rgba(45,45,127,0.68) 50%, rgba(232,84,26,0.58) 100%)'
          }} />
          <div style={{
            position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end', padding: '56px', color: 'white', height: '100%'
          }}>
            <h1 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
              Join the<br /><span style={{ color: '#F5A623' }}>Network.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', lineHeight: 1.7 }}>
              Create your account and start<br />ordering and tracking parcels today.
            </p>
          </div>
        </div>
      )}

      {/* Right side */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: isMobile ? (isDark ? '#080816' : '#f8fafc') : colors.card,
        padding: isMobile ? '24px 20px' : '48px 24px',
        position: 'relative', minHeight: '100vh',
      }}>

        {/* Mobile background */}
        {isMobile && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&auto=format&fit=crop)',
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.06
          }} />
        )}

        {/* Theme toggle */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '4px', zIndex: 10 }}>
          {themeOptions.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setTheme(key)} style={{
              padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              background: theme === key ? '#2D2D7F' : colors.themeBtnBg,
              color: theme === key ? 'white' : colors.themeBtnText, transition: 'all 0.2s'
            }}>
              {icon} {!isMobile && label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: isMobile ? '28px' : '36px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <img src="/p_logo.png" alt="Logo" style={{
              width: isMobile ? '100px' : '80px',
              height: isMobile ? '100px' : '80px',
              borderRadius: '20px', objectFit: 'contain',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
            }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: isMobile ? '22px' : '24px', color: colors.text, letterSpacing: '-0.5px' }}>PULSE PARCEL</div>
              <div style={{ fontSize: '12px', color: '#E8541A', letterSpacing: '3px', fontWeight: 700 }}>LIMITED</div>
            </div>
          </div>

          <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: 900, color: colors.text, marginBottom: '6px', textAlign: isMobile ? 'center' : 'left' }}>
            Create account
          </h2>
          <p style={{ color: colors.subtext, fontSize: '14px', marginBottom: '24px', textAlign: isMobile ? 'center' : 'left' }}>
            Join Pulse Parcel Limited today
          </p>

          {/* Google */}
          <button type="button" onClick={() => handleGoogleLogin()} disabled={googleLoading} style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            border: `1.5px solid ${colors.inputBorder}`,
            background: colors.inputBg, color: colors.inputText,
            fontWeight: 700, fontSize: '15px',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            opacity: googleLoading ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', marginBottom: '20px', boxSizing: 'border-box'
          }}>
            {googleLoading ? <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" /> : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: colors.divider }} />
            <span style={{ color: colors.subtext, fontSize: '13px' }}>or sign up with email</span>
            <div style={{ flex: 1, height: '1px', background: colors.divider }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
                <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="John Doe" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
                  {showPassword ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
                <input type={showConfirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password} onChange={handleChange} required placeholder="Repeat your password"
                  style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
                  {showConfirm ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px', borderRadius: '12px',
              background: '#E8541A', color: 'white', fontWeight: 800,
              fontSize: '16px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px'
            }}>
              {loading ? <Loader2 style={{ width: '20px', height: '20px' }} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: colors.subtext, marginTop: '20px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2D2D7F', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}



