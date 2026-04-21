import { Link, useLocation } from 'react-router-dom'
import { Home, MapPin, LayoutDashboard, ShieldCheck, Package } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

export default function MobileNav() {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const location = useLocation()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#0d0d1f' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#6b7280' : '#94a3b8',
  }

  const navItems = [
    { to: '/products', label: 'Products', icon: Home },
    { to: '/track', label: 'Track', icon: MapPin },
    { to: '/dashboard', label: 'My Orders', icon: LayoutDashboard },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: colors.bg,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 0 16px',
      zIndex: 100,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.1)'
    }}
      className="md:hidden"
    >
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to
        return (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '5px',
              textDecoration: 'none', padding: '6px 20px',
              borderRadius: '14px', position: 'relative',
              background: isActive
                ? (isDark ? 'rgba(45,45,127,0.25)' : 'rgba(45,45,127,0.08)')
                : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            {/* Active dot indicator */}
            {isActive && (
              <div style={{
                position: 'absolute', top: '-1px',
                width: '20px', height: '3px',
                borderRadius: '0 0 4px 4px',
                background: '#2D2D7F'
              }} />
            )}
            <Icon style={{
              width: '22px', height: '22px',
              color: isActive ? '#2D2D7F' : colors.subtext,
              transition: 'all 0.2s'
            }} />
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#2D2D7F' : colors.subtext,
              whiteSpace: 'nowrap'
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}


