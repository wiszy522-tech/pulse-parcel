import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Package, Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import Loader from '../components/ui/Loader'

export default function Products() {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [lightboxImg, setLightboxImg] = useState(null)
  const [expandedDesc, setExpandedDesc] = useState({})

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#080816' : '#f8fafc',
    card: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    inputBg: isDark ? '#111827' : '#f1f5f9',
    inputBorder: isDark ? '#374151' : '#e2e8f0',
  }

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products/').then(r => r.data)
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories/').then(r => r.data)
  })

  const likeMutation = useMutation({
    mutationFn: (id) => api.post(`/products/${id}/like/`),
    onSuccess: () => queryClient.invalidateQueries(['products'])
  })

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'all' || p.category?.id === selectedCategory
    return matchSearch && matchCat
  })

  const getStockBadge = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    if (stock <= 5) return { label: `Low Stock (${stock})`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
    return { label: `In Stock (${stock})`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: isDark ? '#0d0d1f' : '#ffffff', borderBottom: `1px solid ${colors.border}`, padding: window.innerWidth < 768 ? '24px 16px' : '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '24px' : '32px', fontWeight: 900, color: colors.text, marginBottom: '6px' }}>
            Our Products
          </h1>
          <p style={{ color: colors.subtext, fontSize: window.innerWidth < 768 ? '13px' : '15px' }}>
            Browse and order from our collection
          </p>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '8px' : '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: window.innerWidth < 768 ? '100%' : '200px' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '16px', height: '16px' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '42px', paddingRight: '16px',
                  paddingTop: window.innerWidth < 768 ? '10px' : '11px', paddingBottom: window.innerWidth < 768 ? '10px' : '11px',
                  borderRadius: '10px', border: `1.5px solid ${colors.inputBorder}`,
                  background: colors.inputBg, color: colors.text,
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: window.innerWidth < 768 ? '10px 12px' : '11px 16px', borderRadius: '10px',
                border: `1.5px solid ${colors.inputBorder}`,
                background: colors.inputBg, color: colors.text,
                fontSize: '14px', outline: 'none', cursor: 'pointer',
                minWidth: window.innerWidth < 768 ? '120px' : 'auto'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: window.innerWidth < 768 ? '24px 16px' : '32px 24px' }}>
        {isLoading ? (
          <Loader fullscreen={false} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: colors.subtext }}>
            <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: '18px', fontWeight: 600 }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 640 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: window.innerWidth < 768 ? '16px' : '24px'
          }}>
            {filtered.map((product, i) => {
              const stock = getStockBadge(product.stock)
              const isExpanded = expandedDesc[product.id]
              const longDesc = product.description?.length > 100
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: colors.card,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                >
                  {/* Product Image */}
                  <div
                    style={{ position: 'relative', height: '200px', background: isDark ? '#1a1a2e' : '#f1f5f9', overflow: 'hidden', cursor: 'zoom-in' }}
                    onClick={() => product.image && setLightboxImg(product.image)}
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Package style={{ width: '48px', height: '48px', color: colors.subtext, opacity: 0.4 }} />
                      </div>
                    )}
                    {/* Stock badge */}
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      padding: '4px 10px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: 700,
                      color: stock.color, background: stock.bg,
                      backdropFilter: 'blur(4px)'
                    }}>
                      {stock.label}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: window.innerWidth < 768 ? '16px' : '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: window.innerWidth < 768 ? '15px' : '16px', fontWeight: 800, color: colors.text, margin: 0, flex: 1, paddingRight: '8px' }}>
                        {product.name}
                      </h3>
                      <span style={{ fontSize: window.innerWidth < 768 ? '16px' : '18px', fontWeight: 900, color: '#E8541A', whiteSpace: 'nowrap' }}>
                        ₦{Number(product.price).toLocaleString()}
                      </span>
                    </div>

                    {/* Description with Read More */}
                    <p style={{ fontSize: window.innerWidth < 768 ? '12px' : '13px', color: colors.subtext, lineHeight: 1.6, marginBottom: '4px' }}>
                      {longDesc && !isExpanded
                        ? product.description.slice(0, 100) + '...'
                        : product.description}
                    </p>
                    {longDesc && (
                      <button
                        onClick={() => setExpandedDesc(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D2D7F', fontSize: '11px', fontWeight: 700, padding: 0, marginBottom: '12px' }}
                      >
                        {isExpanded ? 'Read less ↑' : 'Read more ↓'}
                      </button>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '6px' : '10px', marginTop: '12px', flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap' }}>
                      {/* Like button */}
                      <button
                        onClick={() => likeMutation.mutate(product.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: window.innerWidth < 768 ? '7px 10px' : '9px 14px', borderRadius: '10px',
                          border: `1.5px solid ${product.is_liked ? '#ef4444' : colors.border}`,
                          background: product.is_liked ? 'rgba(239,68,68,0.08)' : 'transparent',
                          color: product.is_liked ? '#ef4444' : colors.subtext,
                          cursor: 'pointer', fontSize: window.innerWidth < 768 ? '12px' : '13px', fontWeight: 600,
                          transition: 'all 0.2s',
                          minWidth: window.innerWidth < 768 ? 'auto' : 'fit-content'
                        }}
                      >
                        <Heart style={{ width: '14px', height: '14px', fill: product.is_liked ? '#ef4444' : 'none' }} />
                        {window.innerWidth < 640 ? '' : product.likes_count}
                      </button>

                      {/* Order button */}
                      <button
                        onClick={() => {
                          if (product.stock === 0) return toast.error('Out of stock')
                          navigate(`/order/${product.id}`)
                        }}
                        disabled={product.stock === 0}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          padding: window.innerWidth < 768 ? '7px 10px' : '9px 14px', borderRadius: '10px',
                          border: 'none',
                          background: product.stock === 0 ? '#374151' : '#2D2D7F',
                          color: 'white',
                          cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          fontSize: window.innerWidth < 768 ? '12px' : '13px', fontWeight: 700,
                          transition: 'all 0.2s',
                          minWidth: 0
                        }}
                      >
                        <ShoppingCart style={{ width: '14px', height: '14px' }} />
                        {window.innerWidth < 640 ? 'Order' : 'Order Now'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out', padding: '24px'
            }}
          >
            <button
              onClick={() => setLightboxImg(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '50%', width: '40px', height: '40px',
                cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={lightboxImg}
              alt="Product"
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain' }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}





