import { motion } from 'framer-motion'
import useThemeStore from '../../store/themeStore'

export default function Loader({ fullscreen = true }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '20px',
      ...(fullscreen ? {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: isDark ? '#080816' : '#f8fafc'
      } : {
        padding: '80px 0'
      })
    }}>
      {/* Outer pulse ring */}
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${isDark ? '#2D2D7F' : '#2D2D7F'}`,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: 0.3, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid #E8541A`,
          }}
        />

        {/* Logo */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: '10px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            filter: isDark ? 'grayscale(100%) brightness(2)' : 'grayscale(100%) brightness(0)',
            opacity: 0.7
          }}
        >
          <img
            src="/p_logo.png"
            alt="Loading"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </motion.div>
      </div>

      {/* Text */}
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{
          fontSize: '13px', fontWeight: 700,
          color: isDark ? '#4b5563' : '#94a3b8',
          letterSpacing: '2px', textTransform: 'uppercase'
        }}
      >
        Loading...
      </motion.p>
    </div>
  )
}



