import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'

const glowingLineStyles = `
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(232, 84, 26, 0.6), 0 0 40px rgba(232, 84, 26, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(232, 84, 26, 0.8), 0 0 60px rgba(232, 84, 26, 0.5);
    }
  }
  .glowing-line {
    animation: glow 2s ease-in-out infinite;
  }
`

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
      <style>{glowingLineStyles}</style>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: isDark ? 'rgba(8,8,22,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/p_logo.png" alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '16px', color: colors.text, letterSpacing: '-0.3px', lineHeight: 1.1 }}>PULSE PARCEL</div>
              <div style={{ fontSize: '10px', color: '#E8541A', letterSpacing: '2px', fontWeight: 700 }}>LIMITED</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/track')}
              style={{ padding: '9px 20px', borderRadius: '10px', border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.text, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Track Parcel
            </button>
            <button onClick={() => navigate(isAuthenticated ? '/products' : '/login')}
              style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#2D2D7F', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              {isAuthenticated ? 'Go to App' : 'Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: window.innerWidth < 768 ? '60px 16px' : '100px 24px',
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
              borderRadius: '999px', padding: window.innerWidth < 768 ? '5px 10px' : '6px 16px',
              marginBottom: window.innerWidth < 768 ? '16px' : '28px',
              fontSize: window.innerWidth < 768 ? '10px' : '12px'
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: window.innerWidth < 768 ? '0px' : '1px' }}>
              🚀 FAST · RELIABLE · TRACKABLE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: window.innerWidth < 640 ? '32px' : window.innerWidth < 1024 ? '48px' : '64px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: window.innerWidth < 768 ? '16px' : '24px' }}
          >
            Delivering More<br />Than Parcels.<br />
            <span style={{ color: '#F5A623' }}>Delivering Trust.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: window.innerWidth < 768 ? '14px' : '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: window.innerWidth < 768 ? '24px' : '40px', maxWidth: '560px', margin: `0 auto ${window.innerWidth < 768 ? '24px' : '40px'}` }}
          >
            Order products, track parcels in real time, and get email notifications at every step of your delivery journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: window.innerWidth < 768 ? '10px' : '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              onClick={() => navigate(isAuthenticated ? '/products' : '/register')}
              style={{
                padding: window.innerWidth < 768 ? '14px 24px' : '16px 36px', borderRadius: '14px',
                background: '#E8541A', color: 'white',
                fontWeight: 800, fontSize: window.innerWidth < 768 ? '14px' : '16px', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 24px rgba(232,84,26,0.4)'
              }}
            >
              {isAuthenticated ? 'Browse Products' : 'Get Started'} <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => navigate('/track')}
              style={{
                padding: window.innerWidth < 768 ? '14px 24px' : '16px 36px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                fontWeight: 700, fontSize: window.innerWidth < 768 ? '14px' : '16px',
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
      <div style={{ padding: window.innerWidth < 768 ? '50px 16px' : '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: window.innerWidth < 768 ? '32px' : '56px' }}>
          <h2 style={{ fontSize: window.innerWidth < 768 ? '26px' : '40px', fontWeight: 900, color: colors.text, marginBottom: '12px' }}>
            Why Choose Pulse Parcel?
          </h2>
          <p style={{ color: colors.subtext, fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>Built for speed, reliability and complete transparency</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: window.innerWidth < 768 ? '16px' : '24px' }}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: colors.card, borderRadius: '16px',
                  border: `1px solid ${colors.border}`, padding: window.innerWidth < 768 ? '20px' : '32px',
                }}
                whileHover={{ y: -4 }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${f.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Icon style={{ width: '24px', height: '24px', color: f.color }} />
                </div>
                <h3 style={{ fontSize: window.innerWidth < 768 ? '17px' : '20px', fontWeight: 800, color: colors.text, marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: colors.subtext, fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        padding: window.innerWidth < 768 ? '50px 16px' : '80px 24px',
        background: isDark ? '#0d0d1f' : '#ffffff',
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: window.innerWidth < 768 ? '32px' : '56px' }}>
            <h2 style={{ fontSize: window.innerWidth < 768 ? '26px' : '40px', fontWeight: 900, color: colors.text, marginBottom: '12px' }}>
              How It Works
            </h2>
            <p style={{ color: colors.subtext, fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>Three simple steps from order to delivery</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: window.innerWidth < 768 ? '24px' : '32px', position: 'relative' }}>
            {window.innerWidth >= 768 && (
              <div className="glowing-line" style={{
                position: 'absolute', top: '40px', left: '20%', right: '20%',
                height: '2px', background: 'linear-gradient(90deg, #F5A623, #E8541A, #10b981)',
                zIndex: 0,
                boxShadow: '0 0 20px rgba(232, 84, 26, 0.6), 0 0 40px rgba(232, 84, 26, 0.3)'
              }} />
            )}

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
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: `${step.color}18`,
                    border: `3px solid ${step.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: `0 0 20px ${step.color}33, 0 0 40px ${step.color}22`
                  }}>
                    <Icon style={{ width: '32px', height: '32px', color: step.color }} />
                  </div>
                  <h3 style={{ fontSize: window.innerWidth < 768 ? '16px' : '18px', fontWeight: 800, color: colors.text, marginBottom: '8px' }}>{step.label}</h3>
                  <p style={{ color: colors.subtext, fontSize: '14px', lineHeight: 1.6 }}>{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: window.innerWidth < 768 ? '50px 16px' : '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img src="/p_logo.png" alt="Logo" style={{ width: window.innerWidth < 768 ? '200px' : '280px', height: window.innerWidth < 768 ? '200px' : '280px', objectFit: 'contain', margin: '0 auto 32px', display: 'block' }} />
            <h2 style={{ fontSize: window.innerWidth < 768 ? '26px' : '40px', fontWeight: 900, color: colors.text, marginBottom: '16px' }}>
              Ready to Get Started?
            </h2>
            <p style={{ color: colors.subtext, fontSize: window.innerWidth < 768 ? '14px' : '16px', marginBottom: window.innerWidth < 768 ? '24px' : '36px', lineHeight: 1.7 }}>
              Join thousands of customers who trust Pulse Parcel Limited for fast, reliable and trackable deliveries.
            </p>
            <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '10px' : '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(isAuthenticated ? '/products' : '/register')}
                style={{
                  padding: window.innerWidth < 768 ? '14px 24px' : '16px 40px', borderRadius: '14px',
                  background: '#2D2D7F', color: 'white',
                  fontWeight: 800, fontSize: window.innerWidth < 768 ? '14px' : '16px', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isAuthenticated ? 'Browse Products' : 'Create Account'} <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
              <button
                onClick={() => navigate('/track')}
                style={{
                  padding: window.innerWidth < 768 ? '14px 24px' : '16px 40px', borderRadius: '14px',
                  background: 'transparent', color: colors.text,
                  fontWeight: 700, fontSize: window.innerWidth < 768 ? '14px' : '16px',
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
        padding: window.innerWidth < 768 ? '40px 16px 24px' : '48px 24px 32px',
        background: isDark ? '#0d0d1f' : '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: window.innerWidth < 768 ? '24px' : '40px', marginBottom: window.innerWidth < 768 ? '24px' : '40px' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <img src="/p_logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: '15px', color: colors.text }}>PULSE PARCEL</div>
                  <div style={{ fontSize: '10px', color: '#E8541A', letterSpacing: '2px', fontWeight: 700 }}>LIMITED</div>
                </div>
              </div>
              <p style={{ color: colors.subtext, fontSize: '13px', lineHeight: 1.7 }}>
                Fast, reliable and trackable deliveries — right to your doorstep.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: colors.text, marginBottom: '14px', letterSpacing: '0.5px' }}>QUICK LINKS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Browse Products', path: '/products' },
                  { label: 'Track a Parcel', path: '/track' },
                  { label: 'Create Account', path: '/register' },
                  { label: 'Sign In', path: '/login' },
                ].map(link => (
                  <a key={link.path} href={link.path} style={{ color: colors.subtext, fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: colors.text, marginBottom: '14px', letterSpacing: '0.5px' }}>CONTACT US</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="mailto:pulseparcelltd@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.subtext, textDecoration: 'none', fontSize: '13px' }}>
                  <span style={{ fontSize: '16px' }}>✉️</span> <span style={{ wordBreak: 'break-word' }}>pulseparcelltd@gmail.com</span>
                </a>
                <a href="tel:+2348050501440" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.subtext, textDecoration: 'none', fontSize: '13px' }}>
                  <span style={{ fontSize: '16px' }}>📞</span> +234 805 050 1440
                </a>
                <a href="https://wa.me/2348050501440" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#25D366', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ fontSize: '16px' }}>💬</span> WhatsApp Us
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: '20px',
            display: 'flex', justifyContent: window.innerWidth < 768 ? 'center' : 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '12px', flexDirection: window.innerWidth < 768 ? 'column' : 'row', textAlign: window.innerWidth < 768 ? 'center' : 'left'
          }}>
            <p style={{ color: colors.subtext, fontSize: '12px' }}>
              © {new Date().getFullYear()} Pulse Parcel Limited. All rights reserved.
            </p>
            <p style={{ color: colors.subtext, fontSize: '12px' }}>
              Powered by <span style={{ color: '#E8541A', fontWeight: 700 }}>Pulse Parcel Ltd</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}






