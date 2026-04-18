import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'
import useThemeStore from '../store/themeStore'
import Loader from '../components/ui/Loader'

export default function PaymentVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [status, setStatus] = useState('verifying')
  const [order, setOrder] = useState(null)

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
  }

  useEffect(() => {
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  console.log('Reference found:', reference)
  if (!reference) {
    setStatus('failed')
    return
  }
  api.get(`/orders/verify-payment/${reference}/`)
    .then(res => {
      setOrder(res.data.order)
      setStatus('success')
    })
    .catch((err) => {
      console.log('Verify error:', err.response?.data)
      setStatus('failed')
    })
  }, [searchParams])

  if (status === 'verifying') return <Loader />

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: colors.card, borderRadius: '24px',
          border: `1px solid ${colors.border}`,
          padding: '48px', maxWidth: '480px', width: '100%',
          textAlign: 'center'
        }}
      >
        {status === 'success' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <CheckCircle style={{ width: '72px', height: '72px', color: '#10b981', margin: '0 auto 24px' }} />
            </motion.div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: colors.text, marginBottom: '12px' }}>
              Payment Successful! 🎉
            </h2>
            <p style={{ color: colors.subtext, fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
              Your order has been confirmed. Check your email for details.
            </p>
            {order && (
              <div style={{
                background: isDark ? '#0a0a1a' : '#f8fafc',
                borderRadius: '14px', padding: '20px', marginBottom: '28px',
                border: `1px solid ${colors.border}`
              }}>
                <p style={{ fontSize: '13px', color: colors.subtext, marginBottom: '6px', fontWeight: 600, letterSpacing: '1px' }}>TRACKING CODE</p>
                <p style={{ fontSize: '24px', fontWeight: 900, color: '#E8541A', letterSpacing: '2px' }}>{order.tracking_code}</p>
                <p style={{ fontSize: '13px', color: colors.subtext, marginTop: '8px' }}>Save this code to track your parcel</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: '#2D2D7F', color: 'white',
                  fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer'
                }}
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate(`/track?code=${order?.tracking_code}`)}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: 'transparent', color: '#E8541A',
                  fontWeight: 700, fontSize: '15px',
                  border: '2px solid #E8541A', cursor: 'pointer'
                }}
              >
                Track This Order
              </button>
            </div>
          </>
        ) : (
          <>
            <XCircle style={{ width: '72px', height: '72px', color: '#ef4444', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: colors.text, marginBottom: '12px' }}>
              Payment Failed
            </h2>
            <p style={{ color: colors.subtext, fontSize: '15px', marginBottom: '28px', lineHeight: 1.6 }}>
              Something went wrong with your payment. Please try again.
            </p>
            <button
              onClick={() => navigate('/products')}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: '#E8541A', color: 'white',
                fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer'
              }}
            >
              Back to Products
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}



