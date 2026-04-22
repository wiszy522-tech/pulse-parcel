import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Truck, CheckCircle, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import useIsMobile from '../hooks/useIsMobile'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: '#F5A623' },
  { key: 'processing', label: 'Processing', icon: Package, color: '#2D2D7F' },
  { key: 'out_for_delivery', label: 'On the Move', icon: Truck, color: '#E8541A' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#10b981' },
]

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { theme } = useThemeStore()
  const isMobile = useIsMobile()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    inputBg: isDark ? '#111827' : '#f1f5f9',
  }

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!trackingCode.trim()) return toast.error('Enter a tracking code')
    setLoading(true)
    try {
      const res = await api.get(`/orders/track/${trackingCode.trim()}/`)
      setOrder(res.data)
    } catch {
      toast.error('Order not found. Check your tracking code.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStep = (status) => STATUS_STEPS.findIndex(s => s.key === status)

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: isMobile ? '100px' : '0' }}>
      {isAuthenticated && <Navbar />}

      {/* Hero */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #0d0d2f 0%, #1a0a1f 100%)'
          : 'linear-gradient(135deg, #2D2D7F 0%, #E8541A 100%)',
        padding: isMobile ? '40px 16px' : '80px 24px',
        textAlign: 'center'
      }}>
        {!isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '32px' }}>
            <img src="/p_logo.png" alt="Logo" style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: isMobile ? '18px' : '24px', color: 'white' }}>PULSE PARCEL</div>
              <div style={{ fontSize: '11px', color: '#F5A623', letterSpacing: '3px', fontWeight: 700 }}>LIMITED</div>
            </div>
          </div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: 900, color: 'white', marginBottom: '10px' }}
        >
          Track Your Parcel
        </motion.h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '14px' : '16px', marginBottom: '32px' }}>
          Enter your tracking code to see your delivery status
        </p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleTrack}
          style={{ display: 'flex', gap: '10px', maxWidth: '540px', margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
            <input
              type="text"
              value={trackingCode}
              onChange={e => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="e.g. TRK-A3F9K2M1"
              style={{
                width: '100%', paddingLeft: '44px', paddingRight: '16px',
                paddingTop: '14px', paddingBottom: '14px',
                borderRadius: '12px', border: 'none',
                background: 'white', color: '#0f172a',
                fontSize: '15px', outline: 'none',
                boxSizing: 'border-box', fontWeight: 600, letterSpacing: '1px'
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '14px 24px', borderRadius: '12px',
            background: '#E8541A', color: 'white',
            fontWeight: 800, fontSize: '15px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            whiteSpace: 'nowrap'
          }}>
            {loading
              ? <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
              : <><Search style={{ width: '16px', height: '16px' }} /> Track</>
            }
          </button>
        </motion.form>
      </div>

      {/* Result */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: isMobile ? '20px 16px' : '48px 24px' }}>
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Status Card */}
              <div style={{
                background: colors.card, borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                padding: isMobile ? '20px 16px' : '32px', marginBottom: '20px'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <p style={{ color: colors.subtext, fontSize: '11px', fontWeight: 600, marginBottom: '4px', letterSpacing: '1px' }}>TRACKING CODE</p>
                    <h2 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: colors.text, letterSpacing: '2px', margin: 0 }}>{order.tracking_code}</h2>
                  </div>
                  <div style={{
                    padding: '6px 16px', borderRadius: '999px',
                    background: order.status === 'delivered' ? 'rgba(16,185,129,0.12)' :
                      order.status === 'out_for_delivery' ? 'rgba(232,84,26,0.12)' :
                      order.status === 'processing' ? 'rgba(45,45,127,0.12)' : 'rgba(245,166,35,0.12)',
                    color: order.status === 'delivered' ? '#10b981' :
                      order.status === 'out_for_delivery' ? '#E8541A' :
                      order.status === 'processing' ? '#2D2D7F' : '#F5A623',
                    fontWeight: 800, fontSize: '13px'
                  }}>
                    {order.status === 'out_for_delivery' ? '🚚 On the Move' :
                     order.status === 'delivered' ? '✅ Delivered' :
                     order.status === 'processing' ? '⚙️ Processing' : '⏳ Pending'}
                  </div>
                </div>

                {/* Progress steps */}
                <div style={{ position: 'relative', marginBottom: '32px' }}>
                  <div style={{
                    position: 'absolute', top: '21px', left: '20px', right: '20px',
                    height: '3px', background: colors.border, borderRadius: '999px'
                  }} />
                  <div style={{
                    position: 'absolute', top: '21px', left: '20px',
                    height: '3px', borderRadius: '999px',
                    background: 'linear-gradient(90deg, #2D2D7F, #E8541A)',
                    width: `${(getCurrentStep(order.status) / (STATUS_STEPS.length - 1)) * 100}%`,
                    transition: 'width 0.8s ease'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {STATUS_STEPS.map((step, i) => {
                      const currentStep = getCurrentStep(order.status)
                      const isCompleted = i <= currentStep
                      const isActive = i === currentStep && order.status !== 'delivered'
                      const Icon = step.icon

                      return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isActive && (
                              <>
                                <motion.div
                                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  style={{ position: 'absolute', width: '42px', height: '42px', borderRadius: '50%', background: step.color, zIndex: 0 }}
                                />
                                <motion.div
                                  animate={{ scale: [1, 2.3, 1], opacity: [0.3, 0, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                                  style={{ position: 'absolute', width: '42px', height: '42px', borderRadius: '50%', background: step.color, zIndex: 0 }}
                                />
                              </>
                            )}
                            <motion.div
                              animate={{ scale: isActive ? [1, 1.15, 1] : isCompleted ? 1.1 : 1 }}
                              transition={isActive ? { repeat: Infinity, duration: 1.5 } : { duration: 0.4 }}
                              style={{
                                width: isMobile ? '36px' : '42px',
                                height: isMobile ? '36px' : '42px',
                                borderRadius: '50%',
                                background: isCompleted ? step.color : colors.inputBg,
                                border: `3px solid ${isCompleted ? step.color : colors.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isActive ? `0 0 20px ${step.color}88` : isCompleted ? `0 0 12px ${step.color}44` : 'none',
                                position: 'relative', zIndex: 1
                              }}
                            >
                              <Icon style={{ width: isMobile ? '14px' : '18px', height: isMobile ? '14px' : '18px', color: isCompleted ? 'white' : colors.subtext }} />
                            </motion.div>
                          </div>
                          <span style={{
                            fontSize: isMobile ? '9px' : '11px',
                            fontWeight: isCompleted ? 700 : 500,
                            color: isActive ? step.color : isCompleted ? colors.text : colors.subtext,
                            textAlign: 'center', lineHeight: 1.3
                          }}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Order details */}
                <div style={{
                  background: isDark ? '#0a0a1a' : '#f8fafc',
                  borderRadius: '14px', padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px'
                }}>
                  {[
                    { label: 'RECIPIENT', value: order.full_name },
                    { label: 'TOTAL', value: `₦${Number(order.total_amount).toLocaleString()}`, highlight: true },
                    { label: 'DELIVERY ADDRESS', value: `${order.address}, ${order.city}` },
                    { label: 'ORDER DATE', value: new Date(order.created_at).toLocaleDateString() },
                  ].map(({ label, value, highlight }) => (
                    <div key={label}>
                      <p style={{ fontSize: '11px', color: colors.subtext, fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: highlight ? '#E8541A' : colors.text, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <div style={{
                background: colors.card, borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                padding: isMobile ? '20px 16px' : '32px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: colors.text, marginBottom: '20px' }}>Status History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {order.status_history.map((h, i) => (
                    <div key={h.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: i === 0 ? '#E8541A' : colors.border,
                        marginTop: '4px', flexShrink: 0
                      }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: colors.text, textTransform: 'capitalize', margin: 0 }}>
                          {h.status.replace(/_/g, ' ')}
                        </p>
                        <p style={{ fontSize: '12px', color: colors.subtext, margin: '2px 0 0' }}>{h.note}</p>
                        <p style={{ fontSize: '11px', color: colors.subtext, margin: '2px 0 0' }}>
                          {new Date(h.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!order && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.subtext }}>
            <Package style={{ width: '56px', height: '56px', margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>Enter a tracking code above to track your parcel</p>
          </div>
        )}
      </div>
    </div>
  )
}



