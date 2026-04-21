import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Loader from '../components/ui/Loader'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

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
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: '90px' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              alt="avatar"
              style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid #E8541A' }}
            />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: colors.text, margin: 0 }}>
                My Orders
              </h1>
              <p style={{ color: colors.subtext, fontSize: '14px', margin: 0 }}>
                {user?.full_name || user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px' }}>
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
                background: colors.card,
                borderRadius: '16px',
                border: `1px solid ${colors.border}`,
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: colors.subtext, fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <Loader fullscreen={false} />
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: colors.subtext }}>
            <Package style={{ width: '56px', height: '56px', margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No orders yet</p>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>Browse our products and place your first order</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '12px 28px', borderRadius: '12px',
                background: '#2D2D7F', color: 'white',
                fontWeight: 700, fontSize: '15px',
                border: 'none', cursor: 'pointer'
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order, i) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              const isExpanded = expandedOrder === order.id

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: colors.card,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden'
                  }}
                >
                  {/* Order header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    style={{
                      padding: '20px 24px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer', flexWrap: 'wrap', gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: statusCfg.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <StatusIcon style={{ width: '20px', height: '20px', color: statusCfg.color }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '1px' }}>
                          {order.tracking_code}
                        </p>
                        <p style={{ fontSize: '12px', color: colors.subtext, margin: 0 }}>
                          {new Date(order.created_at).toLocaleDateString()} · {order.items?.length} item(s)
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        padding: '5px 14px', borderRadius: '999px',
                        background: statusCfg.bg, color: statusCfg.color,
                        fontSize: '12px', fontWeight: 700
                      }}>
                        {statusCfg.label}
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#E8541A' }}>
                        ₦{Number(order.total_amount).toLocaleString()}
                      </span>
                      {isExpanded
                        ? <ChevronUp style={{ width: '18px', height: '18px', color: colors.subtext }} />
                        : <ChevronDown style={{ width: '18px', height: '18px', color: colors.subtext }} />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '0 24px 24px',
                          borderTop: `1px solid ${colors.border}`
                        }}>
                          <div style={{ paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                            {/* Items */}
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 700, color: colors.subtext, marginBottom: '12px', letterSpacing: '1px' }}>ITEMS ORDERED</p>
                              {order.items?.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '14px', color: colors.text }}>{item.quantity}x {item.product_name}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>₦{Number(item.subtotal).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            {/* Delivery info */}
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 700, color: colors.subtext, marginBottom: '12px', letterSpacing: '1px' }}>DELIVERY INFO</p>
                              <p style={{ fontSize: '14px', color: colors.text, marginBottom: '4px', fontWeight: 600 }}>{order.full_name}</p>
                              <p style={{ fontSize: '13px', color: colors.subtext, marginBottom: '4px' }}>{order.phone}</p>
                              <p style={{ fontSize: '13px', color: colors.subtext }}>{order.address}, {order.city}, {order.state}</p>
                            </div>
                          </div>

                          {/* Track button */}
                          <button
                            onClick={() => navigate(`/track?code=${order.tracking_code}`)}
                            style={{
                              marginTop: '20px', padding: '10px 20px',
                              borderRadius: '10px', border: `1.5px solid #2D2D7F`,
                              background: 'transparent', color: '#2D2D7F',
                              fontWeight: 700, fontSize: '13px',
                              cursor: 'pointer', transition: 'all 0.2s'
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



