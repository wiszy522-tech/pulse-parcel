import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Package, LayoutDashboard, LogOut, Menu, X, Sun, Moon, Monitor, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

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

  const navLinks = [
    { to: '/products', label: 'Products', icon: <Package style={{ width: '16px', height: '16px' }} /> },
    { to: '/track', label: 'Track Parcel', icon: null },
    { to: '/dashboard', label: 'My Orders', icon: <LayoutDashboard style={{ width: '16px', height: '16px' }} /> },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck style={{ width: '16px', height: '16px' }} /> }] : []),
  ]

  const themeOptions = [
    { key: 'light', icon: <Sun style={{ width: '13px', height: '13px' }} /> },
    { key: 'dark', icon: <Moon style={{ width: '13px', height: '13px' }} /> },
    { key: 'system', icon: <Monitor style={{ width: '13px', height: '13px' }} /> },
  ]

  return (
    <nav style={{
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>

        {/* Logo */}
        <Link to="/products" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/p_logo.png" alt="Logo" style={{
            width: '42px', height: '42px',
            borderRadius: '10px', objectFit: 'contain',
            background: 'white', padding: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '16px', color: colors.text, letterSpacing: '-0.3px', lineHeight: 1.1 }}>PULSE PARCEL</div>
            <div style={{ fontSize: '10px', color: '#E8541A', letterSpacing: '2px', fontWeight: 700 }}>LIMITED</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: location.pathname === to ? '#2D2D7F' : colors.subtext,
                background: location.pathname === to ? (isDark ? 'rgba(45,45,127,0.2)' : 'rgba(45,45,127,0.08)') : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {icon} {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Theme toggle */}
          <div style={{ display: 'flex', gap: '4px', background: colors.hover, borderRadius: '10px', padding: '4px' }}>
            {themeOptions.map(({ key, icon }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  width: '28px', height: '28px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme === key ? '#2D2D7F' : 'transparent',
                  color: theme === key ? 'white' : colors.subtext,
                  transition: 'all 0.2s'
                }}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              alt="avatar"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8541A' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
              {user?.full_name || user?.email?.split('@')[0]}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: '#E8541A',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            className="hidden md:flex"
          >
            <LogOut style={{ width: '15px', height: '15px' }} />
            Logout
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text, padding: '4px' }}
            className="md:hidden"
          >
            {menuOpen ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: colors.bg,
          borderTop: `1px solid ${colors.border}`,
          padding: '12px 24px 20px'
        }}>
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 0',
                borderBottom: `1px solid ${colors.border}`,
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
                color: location.pathname === to ? '#2D2D7F' : colors.text,
              }}
            >
              {icon} {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 0',
              background: 'none', border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              color: '#E8541A',
              width: '100%',
              marginTop: '4px'
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}



