import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Phone, User, Mail, Loader2, ArrowLeft, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import api from '../services/api'
import useThemeStore from '../store/themeStore'
import useIsMobile from '../hooks/useIsMobile'

export default function PlaceOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isMobile = useIsMobile()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    address: '', city: '', state: '',
    postal_code: '', country: 'Nigeria'
  })

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    label: isDark ? '#d1d5db' : '#374151',
    inputBg: isDark ? '#111827' : '#f1f5f9',
    inputBorder: isDark ? '#374151' : '#e2e8f0',
    inputText: isDark ? '#ffffff' : '#0f172a',
  }

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}/`).then(r => r.data)
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/orders/create/', {
        ...form,
        items: [{ product: id, quantity }]
      })
      toast.success('Order created! Redirecting to payment...')
      window.location.href = res.data.payment_url
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', paddingLeft: '44px', paddingRight: '16px',
    paddingTop: '13px', paddingBottom: '13px',
    borderRadius: '12px', border: `1.5px solid ${colors.inputBorder}`,
    background: colors.inputBg, color: colors.inputText,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  const plainInputStyle = { ...inputStyle, paddingLeft: '16px' }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <Navbar />
      <Loader fullscreen={false} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: isMobile ? '100px' : '40px' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '16px' : '40px 24px' }}>

        {/* Back button */}
        <button onClick={() => navigate('/products')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.subtext, fontSize: '14px', fontWeight: 600,
          marginBottom: '24px', padding: 0
        }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Products
        </button>

        {/* Order Summary — show on top for mobile */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: colors.card, borderRadius: '16px',
              border: `1px solid ${colors.border}`, padding: '16px',
              marginBottom: '16px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: colors.text, marginBottom: '16px' }}>Order Summary</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '10px', background: isDark ? '#1a1a2e' : '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                {product?.image
                  ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Package style={{ width: '28px', height: '28px', color: colors.subtext, opacity: 0.4 }} />
                    </div>
                }
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: '0 0 4px' }}>{product?.name}</h4>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#E8541A', margin: 0 }}>
                  ₦{(Number(product?.price) * quantity).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.label }}>Qty:</span>
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1.5px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.text, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>-</button>
              <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(product?.stock || 1, quantity + 1))}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1.5px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.text, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: '10px', background: isDark ? '#0a2a1a' : '#f0fdf4', border: `1px solid ${isDark ? '#064e3b' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔒</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>Secure Payment</div>
                <div style={{ fontSize: '10px', color: colors.subtext }}>Powered by Paystack</div>
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '32px' }}>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: isMobile ? '20px 16px' : '32px' }}
          >
            <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: colors.text, marginBottom: '6px' }}>Delivery Details</h2>
            <p style={{ color: colors.subtext, fontSize: '13px', marginBottom: '24px' }}>Where should we deliver your parcel?</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '15px', height: '15px' }} />
                  <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="John Doe" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '15px', height: '15px' }} />
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '15px', height: '15px' }} />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+234 800 000 0000" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '15px', height: '15px' }} />
                  <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="123 Main Street" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required placeholder="Lagos" style={plainInputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>State</label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} required placeholder="Lagos State" style={plainInputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Country</label>
                <input type="text" name="country" value={form.country} onChange={handleChange} required style={plainInputStyle} />
              </div>

              {!isMobile && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.label, marginBottom: '8px' }}>Quantity</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1.5px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.text, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>-</button>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: colors.text, minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                    <button type="button" onClick={() => setQuantity(Math.min(product?.stock || 1, quantity + 1))}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1.5px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.text, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px', borderRadius: '12px',
                background: '#E8541A', color: 'white', fontWeight: 800,
                fontSize: '16px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '8px'
              }}>
                {loading ? <Loader2 style={{ width: '20px', height: '20px' }} className="animate-spin" /> : 'Proceed to Payment →'}
              </button>
            </form>
          </motion.div>

          {/* Desktop order summary */}
          {!isMobile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '32px', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: colors.text, marginBottom: '24px' }}>Order Summary</h3>
                <div style={{ height: '180px', borderRadius: '12px', background: isDark ? '#1a1a2e' : '#f1f5f9', overflow: 'hidden', marginBottom: '20px' }}>
                  {product?.image
                    ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Package style={{ width: '40px', height: '40px', color: colors.subtext, opacity: 0.4 }} />
                      </div>
                  }
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: colors.text, marginBottom: '8px' }}>{product?.name}</h4>
                <p style={{ fontSize: '13px', color: colors.subtext, marginBottom: '24px', lineHeight: 1.5 }}>
                  {product?.description?.slice(0, 80)}...
                </p>
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.subtext, fontSize: '14px' }}>Unit Price</span>
                    <span style={{ color: colors.text, fontWeight: 700, fontSize: '14px' }}>₦{Number(product?.price).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.subtext, fontSize: '14px' }}>Quantity</span>
                    <span style={{ color: colors.text, fontWeight: 700, fontSize: '14px' }}>x{quantity}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: colors.text, fontWeight: 800, fontSize: '16px' }}>Total</span>
                    <span style={{ color: '#E8541A', fontWeight: 900, fontSize: '20px' }}>₦{(Number(product?.price) * quantity).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '10px', background: isDark ? '#0a2a1a' : '#f0fdf4', border: `1px solid ${isDark ? '#064e3b' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🔒</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Secure Payment</div>
                    <div style={{ fontSize: '11px', color: colors.subtext }}>Powered by Paystack</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}






