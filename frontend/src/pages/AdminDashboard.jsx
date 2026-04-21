import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Plus, Scan, Trash2, Loader2,
  ShoppingBag, Truck, CheckCircle, Clock, X, Upload, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'
import useThemeStore from '../store/themeStore'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F5A623', bg: 'rgba(245,166,35,0.1)' },
  processing: { label: 'Processing', color: '#2D2D7F', bg: 'rgba(45,45,127,0.1)' },
  out_for_delivery: { label: 'On the Move', color: '#E8541A', bg: 'rgba(232,84,26,0.1)' },
  delivered: { label: 'Delivered', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

export default function AdminDashboard() {
  const { theme } = useThemeStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('orders')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [scanCode, setScanCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stock: '', category_id: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    inputBg: isDark ? '#111827' : '#f1f5f9',
    inputBorder: isDark ? '#374151' : '#e2e8f0',
    inputText: isDark ? '#ffffff' : '#0f172a',
  }

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/').then(r => r.data)
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products/').then(r => r.data)
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories/').then(r => r.data)
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product deleted')
    }
  })

  const stats = {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    onMove: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(productForm).forEach(([k, v]) => { if (v) formData.append(k, v) })
      if (imageFile) formData.append('image', imageFile)
      await api.post('/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Product added successfully!')
      queryClient.invalidateQueries(['products'])
      setShowAddProduct(false)
      setProductForm({ name: '', description: '', price: '', stock: '', category_id: '' })
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleScan = async (e) => {
    e.preventDefault()
    if (!scanCode.trim()) return toast.error('Enter a tracking code')
    setScanning(true)
    try {
      const res = await api.post(`/orders/scan/${scanCode.trim()}/`)
      toast.success(res.data.message)
      queryClient.invalidateQueries(['admin-orders'])
      setScanCode('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${colors.inputBorder}`,
    background: colors.inputBg, color: colors.inputText,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, color: '#2D2D7F', icon: ShoppingBag, filter: 'all' },
    { label: 'Pending', value: stats.pending, color: '#F5A623', icon: Clock, filter: 'pending' },
    { label: 'Processing', value: stats.processing, color: '#2D2D7F', icon: Package, filter: 'processing' },
    { label: 'On the Move', value: stats.onMove, color: '#E8541A', icon: Truck, filter: 'out_for_delivery' },
    { label: 'Delivered', value: stats.delivered, color: '#10b981', icon: CheckCircle, filter: 'delivered' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: colors.text, marginBottom: '6px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: colors.subtext, fontSize: '15px' }}>
            Manage products, orders and scan parcels
          </p>
        </div>

        {/* Stats — clickable */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            const isActive = statusFilter === stat.filter
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setStatusFilter(stat.filter)
                  setActiveTab('orders')
                }}
                whileHover={{ y: -2 }}
                style={{
                  background: colors.card, borderRadius: '16px',
                  border: `2px solid ${isActive ? stat.color : colors.border}`,
                  padding: '20px', cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? `0 4px 20px ${stat.color}33` : 'none',
                  display: 'flex', alignItems: 'center', gap: '14px'
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${stat.color}18`, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: colors.subtext, fontWeight: 600, marginTop: '3px' }}>{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Scan parcel */}
        <div style={{
          background: colors.card, borderRadius: '16px',
          border: `1px solid ${colors.border}`, padding: '24px',
          marginBottom: '28px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scan style={{ width: '18px', height: '18px', color: '#E8541A' }} /> Scan Parcel
          </h3>
          <form onSubmit={handleScan} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={scanCode}
              onChange={e => setScanCode(e.target.value.toUpperCase())}
              placeholder="Enter tracking code e.g. TRK-A3F9K2M1"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="submit"
              disabled={scanning}
              style={{
                padding: '12px 24px', borderRadius: '10px',
                background: '#E8541A', color: 'white',
                fontWeight: 700, fontSize: '14px',
                border: 'none', cursor: scanning ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap', opacity: scanning ? 0.6 : 1
              }}
            >
              {scanning
                ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                : <><Scan style={{ width: '16px', height: '16px' }} /> Scan</>
              }
            </button>
          </form>
          <p style={{ fontSize: '12px', color: colors.subtext, marginTop: '10px' }}>
            Scan once → marks as "Out for Delivery" · Scan again → marks as "Delivered"
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
          {['orders', 'products'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px',
                background: activeTab === tab ? '#2D2D7F' : colors.card,
                color: activeTab === tab ? 'white' : colors.subtext,
                transition: 'all 0.2s', textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddProduct(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px',
                background: '#E8541A', color: 'white',
                display: 'flex', alignItems: 'center', gap: '6px',
                marginLeft: 'auto'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} /> Add Product
            </button>
          )}

          {/* Active filter badge */}
          {activeTab === 'orders' && statusFilter !== 'all' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginLeft: 'auto', background: STATUS_CONFIG[statusFilter]?.bg,
              padding: '6px 14px', borderRadius: '999px'
            }}>
              <Filter style={{ width: '13px', height: '13px', color: STATUS_CONFIG[statusFilter]?.color }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: STATUS_CONFIG[statusFilter]?.color, textTransform: 'capitalize' }}>
                {statusFilter.replace(/_/g, ' ')}
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: STATUS_CONFIG[statusFilter]?.color, padding: 0, display: 'flex' }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          )}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ordersLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader2 style={{ width: '36px', height: '36px', color: '#2D2D7F' }} className="animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: colors.subtext }}>
                <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', fontWeight: 600 }}>
                  No {statusFilter !== 'all' ? statusFilter.replace(/_/g, ' ') : ''} orders found
                </p>
              </div>
            ) : (
              filteredOrders.map((order, i) => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      background: colors.card, borderRadius: '14px',
                      border: `1px solid ${colors.border}`,
                      padding: '20px 24px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: colors.text, letterSpacing: '1px', margin: 0 }}>
                        {order.tracking_code}
                      </p>
                      <p style={{ fontSize: '13px', color: colors.subtext, margin: '4px 0 0' }}>
                        {order.full_name} · {order.email}
                      </p>
                      <p style={{ fontSize: '12px', color: colors.subtext, margin: '2px 0 0' }}>
                        {new Date(order.created_at).toLocaleDateString()} · {order.items?.length} item(s)
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '5px 14px', borderRadius: '999px',
                        background: statusCfg.bg, color: statusCfg.color,
                        fontSize: '12px', fontWeight: 700
                      }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#E8541A' }}>
                        ₦{Number(order.total_amount).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {productsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gridColumn: '1/-1' }}>
                <Loader2 style={{ width: '36px', height: '36px', color: '#2D2D7F' }} className="animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1/-1', color: colors.subtext }}>
                <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', fontWeight: 600 }}>No products yet</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  style={{
                    marginTop: '16px', padding: '10px 24px', borderRadius: '10px',
                    background: '#2D2D7F', color: 'white', border: 'none',
                    fontWeight: 700, cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  Add First Product
                </button>
              </div>
            ) : (
              products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: colors.card, borderRadius: '14px',
                    border: `1px solid ${colors.border}`, overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '150px', background: isDark ? '#1a1a2e' : '#f1f5f9', overflow: 'hidden' }}>
                    {product.image
                      ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Package style={{ width: '36px', height: '36px', color: colors.subtext, opacity: 0.4 }} />
                        </div>
                    }
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: colors.text, margin: '0 0 4px' }}>{product.name}</h4>
                    <p style={{ fontSize: '13px', color: colors.subtext, margin: '0 0 4px' }}>Stock: {product.stock}</p>
                    <p style={{ fontSize: '12px', color: product.stock <= 5 ? '#ef4444' : '#10b981', fontWeight: 600, margin: '0 0 12px' }}>
                      {product.stock === 0 ? '● Out of Stock' : product.stock <= 5 ? '● Low Stock' : '● In Stock'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#E8541A' }}>
                        ₦{Number(product.price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this product?')) deleteProductMutation.mutate(product.id)
                        }}
                        style={{
                          padding: '7px 12px', borderRadius: '8px',
                          border: 'none', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '13px', fontWeight: 600
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
            onClick={() => setShowAddProduct(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: colors.card, borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                padding: '32px', width: '100%', maxWidth: '520px',
                maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: colors.text, margin: 0 }}>Add New Product</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.subtext, padding: 0 }}
                >
                  <X style={{ width: '22px', height: '22px' }} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Image upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.subtext, marginBottom: '8px' }}>
                    Product Image
                  </label>
                  <div
                    onClick={() => document.getElementById('img-upload').click()}
                    style={{
                      height: '140px', borderRadius: '12px',
                      border: `2px dashed ${colors.inputBorder}`,
                      background: colors.inputBg, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center', color: colors.subtext }}>
                          <Upload style={{ width: '28px', height: '28px', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '13px', fontWeight: 600 }}>Click to upload image</p>
                        </div>
                    }
                  </div>
                  <input id="img-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.subtext, marginBottom: '8px' }}>Product Name</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required placeholder="e.g. Wireless Headphones" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.subtext, marginBottom: '8px' }}>Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required placeholder="Describe the product..." rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.subtext, marginBottom: '8px' }}>Price (₦)</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required placeholder="5000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.subtext, marginBottom: '8px' }}>Stock</label>
                    <input type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required placeholder="10" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.subtext, marginBottom: '8px' }}>Category (optional)</label>
                  <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: '12px', background: '#2D2D7F',
                    color: 'white', fontWeight: 800, fontSize: '15px',
                    border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    marginTop: '8px'
                  }}
                >
                  {submitting
                    ? <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                    : 'Add Product'
                  }
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}















