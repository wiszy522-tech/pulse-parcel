import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'

export default function Landing() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
  }

  const features = [
    { icon: Zap, title: 'Fast Delivery', desc: 'Lightning-fast shipping to your doorstep with real-time updates every step of the way.', color: '#F5A623' },
    { icon: Shield, title: 'Secure Payments', desc: 'All payments are secured and encrypted via Paystack. Your money is always safe.', color: '#2D2D7F' },
    { icon: Globe, title: 'Real-Time Tracking', desc: 'Track your parcel from warehouse to doorstep with live status updates and email notifications.', color: '#E8541A' },
  ]

  const steps = [
    { icon: Package, label: 'Order Placed', desc: 'You place your order and make payment', color: '#F5A623' },
    { icon: Truck, label: 'Out for Delivery', desc: 'Your parcel is picked up and on its way', color: '#E8541A' },
    { icon: CheckCircle, label: 'Delivered', desc: 'Parcel arrives at your doorstep', color: '#10b981' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>

      {/* Animated glow keyframes */}
      <style>{`
        @keyframes glowMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(245,166,35,0.4); }
          33% { box-shadow: 0 0 16px 4px rgba(232,84,26,0.6); }
          66% { box-shadow: 0 0 16px 4px rgba(16,185,129,0.5); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: isDark ? 'rgba(8,8,22,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/p_logo.png" alt="Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '20px', color: colors.text, letterSpacing: '-0.5px', lineHeight: 1.1 }}>PULSE PARCEL</div>
              <div style={{ fontSize: '11px', color: '#E8541A', letterSpacing: '3px', fontWeight: 700 }}>LIMITED</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/track')}
              style={{ padding: '10px 22px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.text, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Track Parcel
            </button>
            <button onClick={() => navigate(isAuthenticated ? '/products' : '/login')}
              style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#2D2D7F', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              {isAuthenticated ? 'Go to App' : 'Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '100px 24px',
        background: isDark
          ? 'linear-gradient(135deg, #0d0d2f 0%, #1a0a0f 100%)'
          : 'linear-gradient(135deg, #2D2D7F 0%, #E8541A 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.15
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px', padding: '6px 16px', marginBottom: '28px'
            }}
          >
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '1px' }}>
              🚀 FAST · RELIABLE · TRACKABLE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '64px', fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: '24px' }}
          >
            Delivering More<br />Than Parcels.<br />
            <span style={{ color: '#F5A623' }}>Delivering Trust.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}
          >
            Order products, track parcels in real time, and get email notifications at every step of your delivery journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={() => navigate(isAuthenticated ? '/products' : '/register')}
              style={{
                padding: '16px 36px', borderRadius: '14px',
                background: '#E8541A', color: 'white',
                fontWeight: 800, fontSize: '16px', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 24px rgba(232,84,26,0.4)'
              }}
            >
              {isAuthenticated ? 'Browse Products' : 'Get Started'} <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => navigate('/track')}
              style={{
                padding: '16px 36px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                fontWeight: 700, fontSize: '16px',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', backdropFilter: 'blur(8px)'
              }}
            >
              Track a Parcel
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: colors.text, marginBottom: '12px' }}>
            Why Choose Pulse Parcel?
          </h2>
          <p style={{ color: colors.subtext, fontSize: '16px' }}>Built for speed, reliability and complete transparency</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                style={{
                  background: colors.card, borderRadius: '20px',
                  border: `1px solid ${colors.border}`, padding: '32px',
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: `${f.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Icon style={{ width: '26px', height: '26px', color: f.color }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: colors.text, marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: colors.subtext, fontSize: '15px', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        padding: '80px 24px',
        background: isDark ? '#0d0d1f' : '#ffffff',
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 900, color: colors.text, marginBottom: '12px' }}>
              How It Works
            </h2>
            <p style={{ color: colors.subtext, fontSize: '16px' }}>Three simple steps from order to delivery</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', position: 'relative' }}>

            {/* Glowing animated connector line */}
            <div style={{
              position: 'absolute', top: '44px', left: '22%', right: '22%',
              height: '4px', borderRadius: '999px',
              background: 'linear-gradient(90deg, #F5A623, #E8541A, #10b981)',
              backgroundSize: '200% 200%',
              animation: 'glowMove 3s ease infinite',
              boxShadow: '0 0 12px rgba(232,84,26,0.6), 0 0 24px rgba(245,166,35,0.3)',
              zIndex: 0
            }} />

            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
                >
                  <motion.div
                    animate={{ boxShadow: ['0 0 8px 2px rgba(245,166,35,0.3)', '0 0 20px 6px rgba(232,84,26,0.5)', '0 0 8px 2px rgba(16,185,129,0.3)', '0 0 8px 2px rgba(245,166,35,0.3)'] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 1 }}
                    style={{
                      width: '88px', height: '88px', borderRadius: '50%',
                      background: `${step.color}18`,
                      border: `3px solid ${step.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}
                  >
                    <Icon style={{ width: '36px', height: '36px', color: step.color }} />
                  </motion.div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: colors.text, marginBottom: '8px' }}>{step.label}</h3>
                  <p style={{ color: colors.subtext, fontSize: '14px', lineHeight: 1.6 }}>{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img src="/p_logo.png" alt="Logo" style={{ width: '180px', height: '180px', objectFit: 'contain', margin: '0 auto 24px', display: 'block' }} />
            <h2 style={{ fontSize: '40px', fontWeight: 900, color: colors.text, marginBottom: '16px' }}>
              Ready to Get Started?
            </h2>
            <p style={{ color: colors.subtext, fontSize: '16px', marginBottom: '36px', lineHeight: 1.7 }}>
              Join thousands of customers who trust Pulse Parcel Limited for fast, reliable and trackable deliveries.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(isAuthenticated ? '/products' : '/register')}
                style={{
                  padding: '16px 40px', borderRadius: '14px',
                  background: '#2D2D7F', color: 'white',
                  fontWeight: 800, fontSize: '16px', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isAuthenticated ? 'Browse Products' : 'Create Account'} <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
              <button
                onClick={() => navigate('/track')}
                style={{
                  padding: '16px 40px', borderRadius: '14px',
                  background: 'transparent', color: colors.text,
                  fontWeight: 700, fontSize: '16px',
                  border: `2px solid ${colors.border}`,
                  cursor: 'pointer'
                }}
              >
                Track a Parcel
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${colors.border}`,
        padding: '48px 24px 32px',
        background: isDark ? '#0d0d1f' : '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src="/p_logo.png" alt="Logo" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: '16px', color: colors.text }}>PULSE PARCEL</div>
                  <div style={{ fontSize: '10px', color: '#E8541A', letterSpacing: '2px', fontWeight: 700 }}>LIMITED</div>
                </div>
              </div>
              <p style={{ color: colors.subtext, fontSize: '14px', lineHeight: 1.7 }}>
                Fast, reliable and trackable deliveries — right to your doorstep.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, marginBottom: '16px', letterSpacing: '1px' }}>QUICK LINKS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Browse Products', path: '/products' },
                  { label: 'Track a Parcel', path: '/track' },
                  { label: 'Create Account', path: '/register' },
                  { label: 'Sign In', path: '/login' },
                ].map(link => (
                  <a key={link.path} href={link.path} style={{ color: colors.subtext, fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: colors.text, marginBottom: '16px', letterSpacing: '1px' }}>CONTACT US</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="mailto:pulseparcelltd@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.subtext, textDecoration: 'none', fontSize: '14px' }}>
                  <span style={{ fontSize: '16px' }}>✉️</span> pulseparcelltd@gmail.com
                </a>
                <a href="tel:+2348050501440" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.subtext, textDecoration: 'none', fontSize: '14px' }}>
                  <span style={{ fontSize: '16px' }}>📞</span> +234 805 050 1440
                </a>
                <a href="https://wa.me/2348050501440" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#25D366', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ fontSize: '16px' }}>💬</span> WhatsApp Us
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: '24px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '12px'
          }}>
            <p style={{ color: colors.subtext, fontSize: '13px' }}>
              © {new Date().getFullYear()} Pulse Parcel Limited. All rights reserved.
            </p>
            <p style={{ color: colors.subtext, fontSize: '13px' }}>
              Powered by <span style={{ color: '#E8541A', fontWeight: 700 }}>Pulse Parcel Ltd</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}







