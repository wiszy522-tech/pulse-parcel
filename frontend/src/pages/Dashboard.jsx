import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import useIsMobile from '../hooks/useIsMobile'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F5A623', bg: 'rgba(245,166,35,0.1)', icon: Clock },
  processing: { label: 'Processing', color: '#2D2D7F', bg: 'rgba(45,45,127,0.1)', icon: Package },
  out_for_delivery: { label: 'On the Move 🚚', color: '#E8541A', bg: 'rgba(232,84,26,0.1)', icon: Truck },
  delivered: { label: 'Delivered ✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [expandedOrder, setExpandedOrder] = useState(null)

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    inputBg: isDark ? '#111827' : '#f1f5f9',
  }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/').then(r => r.data)
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    onMove: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: isMobile ? '100px' : '40px' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              alt="avatar"
              style={{ width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px', borderRadius: '50%', border: '3px solid #E8541A' }}
            />
            <div>
              <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 900, color: colors.text, margin: 0 }}>My Orders</h1>
              <p style={{ color: colors.subtext, fontSize: '13px', margin: 0 }}>{user?.full_name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '28px'
        }}>
          {[
            { label: 'Total Orders', value: stats.total, color: '#2D2D7F' },
            { label: 'Pending', value: stats.pending, color: '#F5A623' },
            { label: 'On the Move', value: stats.onMove, color: '#E8541A' },
            { label: 'Delivered', value: stats.delivered, color: '#10b981' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: colors.card, borderRadius: '14px',
                border: `1px solid ${colors.border}`,
                padding: isMobile ? '14px' : '20px', textAlign: 'center'
              }}
            >
              <div style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: isMobile ? '10px' : '12px', color: colors.subtext, fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <Loader fullscreen={false} />
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.subtext }}>
            <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>No orders yet</p>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>Browse our products and place your first order</p>
            <button onClick={() => navigate('/products')} style={{
              padding: '12px 28px', borderRadius: '12px',
              background: '#2D2D7F', color: 'white',
              fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer'
            }}>
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order, i) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              const isExpanded = expandedOrder === order.id

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: colors.card, borderRadius: '14px',
                    border: `1px solid ${colors.border}`, overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    style={{ padding: isMobile ? '14px 16px' : '20px 24px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: statusCfg.bg, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <StatusIcon style={{ width: '18px', height: '18px', color: statusCfg.color }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '0.5px' }}>
                            {order.tracking_code}
                          </p>
                          <p style={{ fontSize: '11px', color: colors.subtext, margin: '2px 0 0' }}>
                            {new Date(order.created_at).toLocaleDateString()} · {order.items?.length} item(s)
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 900, color: '#E8541A' }}>
                            ₦{Number(order.total_amount).toLocaleString()}
                          </div>
                          <div style={{
                            fontSize: '10px', fontWeight: 700,
                            color: statusCfg.color, marginTop: '2px'
                          }}>
                            {statusCfg.label}
                          </div>
                        </div>
                        {isExpanded
                          ? <ChevronUp style={{ width: '16px', height: '16px', color: colors.subtext, flexShrink: 0 }} />
                          : <ChevronDown style={{ width: '16px', height: '16px', color: colors.subtext, flexShrink: 0 }} />
                        }
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: isMobile ? '0 16px 16px' : '0 24px 24px',
                          borderTop: `1px solid ${colors.border}`
                        }}>
                          <div style={{
                            paddingTop: '16px',
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '16px'
                          }}>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: colors.subtext, marginBottom: '8px', letterSpacing: '1px' }}>ITEMS ORDERED</p>
                              {order.items?.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '13px', color: colors.text }}>{item.quantity}x {item.product_name}</span>
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text }}>₦{Number(item.subtotal).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: colors.subtext, marginBottom: '8px', letterSpacing: '1px' }}>DELIVERY INFO</p>
                              <p style={{ fontSize: '13px', color: colors.text, marginBottom: '3px', fontWeight: 600 }}>{order.full_name}</p>
                              <p style={{ fontSize: '12px', color: colors.subtext, marginBottom: '3px' }}>{order.phone}</p>
                              <p style={{ fontSize: '12px', color: colors.subtext }}>{order.address}, {order.city}, {order.state}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/track?code=${order.tracking_code}`)}
                            style={{
                              marginTop: '16px', padding: '10px 20px',
                              borderRadius: '10px', border: `1.5px solid #2D2D7F`,
                              background: 'transparent', color: '#2D2D7F',
                              fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                              width: isMobile ? '100%' : 'auto'
                            }}
                          >
                            Track This Order →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}





