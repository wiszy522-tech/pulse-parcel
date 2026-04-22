import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, Menu, X, Sun, Moon, Monitor, ShieldCheck, Package, MapPin, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import useIsMobile from '../../hooks/useIsMobile'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#0d0d1f' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    hover: isDark ? '#1f2937' : '#f1f5f9',
  }

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('/auth/logout/', { refresh })
    } catch {}
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const themeOptions = [
    { key: 'light', icon: <Sun style={{ width: '13px', height: '13px' }} />, label: 'Light' },
    { key: 'dark', icon: <Moon style={{ width: '13px', height: '13px' }} />, label: 'Dark' },
    { key: 'system', icon: <Monitor style={{ width: '13px', height: '13px' }} />, label: 'System' },
  ]

  const navLinks = [
    { to: '/products', label: 'Products', icon: <Package style={{ width: '15px', height: '15px' }} /> },
    { to: '/track', label: 'Track Parcel', icon: <MapPin style={{ width: '15px', height: '15px' }} /> },
    { to: '/dashboard', label: 'My Orders', icon: <LayoutDashboard style={{ width: '15px', height: '15px' }} /> },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck style={{ width: '15px', height: '15px' }} /> }] : []),
  ]

  return (
    <nav style={{
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? '58px' : '68px'
      }}>

        {/* Logo */}
        <Link to="/products" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <img src="/p_logo.png" alt="Logo" style={{
            width: isMobile ? '36px' : '48px',
            height: isMobile ? '36px' : '48px',
            objectFit: 'contain'
          }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: isMobile ? '13px' : '17px', color: colors.text, letterSpacing: '-0.3px', lineHeight: 1.1 }}>PULSE PARCEL</div>
            <div style={{ fontSize: isMobile ? '9px' : '10px', color: '#E8541A', letterSpacing: '2px', fontWeight: 700 }}>LIMITED</div>
          </div>
        </Link>

        {/* Desktop nav links — center */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(({ to, label, icon }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                color: location.pathname === to ? '#2D2D7F' : colors.subtext,
                background: location.pathname === to
                  ? (isDark ? 'rgba(45,45,127,0.2)' : 'rgba(45,45,127,0.08)')
                  : 'transparent',
                transition: 'all 0.2s'
              }}>
                {icon} {label}
              </Link>
            ))}
          </div>
        )}

        {/* Desktop right side */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme toggle */}
            <div style={{ display: 'flex', gap: '3px', background: colors.hover, borderRadius: '8px', padding: '3px' }}>
              {themeOptions.map(({ key, icon }) => (
                <button key={key} onClick={() => setTheme(key)} style={{
                  width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: theme === key ? '#2D2D7F' : 'transparent',
                  color: theme === key ? 'white' : colors.subtext, transition: 'all 0.2s'
                }}>{icon}</button>
              ))}
            </div>

            {/* Avatar + name */}
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              alt="avatar"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8541A' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
              {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
            </span>

            {/* Logout */}
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', border: 'none',
              cursor: 'pointer', background: 'transparent',
              color: '#E8541A', fontWeight: 600, fontSize: '14px'
            }}>
              <LogOut style={{ width: '15px', height: '15px' }} /> Logout
            </button>
          </div>
        )}

        {/* Mobile right */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              alt="avatar"
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #E8541A' }}
            />
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text, padding: 0 }}>
              {menuOpen ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{ background: colors.bg, borderTop: `1px solid ${colors.border}`, padding: '16px' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: `1px solid ${colors.border}`, marginBottom: '12px' }}>
            <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E8541A' }} />
            <div>
              <div style={{ fontWeight: 700, color: colors.text, fontSize: '14px' }}>{user?.full_name || 'User'}</div>
              <div style={{ color: colors.subtext, fontSize: '12px' }}>{user?.email}</div>
            </div>
          </div>

          {/* Theme */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {themeOptions.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTheme(key)} style={{
                flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                background: theme === key ? '#2D2D7F' : colors.hover,
                color: theme === key ? 'white' : colors.subtext, fontSize: '11px', fontWeight: 600
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            background: 'rgba(232,84,26,0.08)', border: 'none', cursor: 'pointer',
            color: '#E8541A', fontWeight: 700, fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <LogOut style={{ width: '16px', height: '16px' }} /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}




