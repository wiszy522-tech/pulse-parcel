import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Package, Search, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/ui/Loader'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import useIsMobile from '../hooks/useIsMobile'

export default function Products() {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
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
    <div style={{ minHeight: '100vh', background: colors.bg, paddingBottom: isMobile ? '100px' : '40px' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: isDark ? '#0d0d1f' : '#ffffff', borderBottom: `1px solid ${colors.border}`, padding: isMobile ? '20px 16px' : '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 900, color: colors.text, marginBottom: '4px' }}>
            Our Products
          </h1>
          <p style={{ color: colors.subtext, fontSize: '14px', marginBottom: '16px' }}>Browse and order from our collection</p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', width: '15px', height: '15px' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '38px', paddingRight: '16px',
                  paddingTop: '10px', paddingBottom: '10px',
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
                padding: '10px 14px', borderRadius: '10px',
                border: `1.5px solid ${colors.inputBorder}`,
                background: colors.inputBg, color: colors.text,
                fontSize: '14px', outline: 'none', cursor: 'pointer',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>
        {isLoading ? (
          <Loader fullscreen={false} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: colors.subtext }}>
            <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '12px' : '24px'
          }}>
            {filtered.map((product, i) => {
              const stock = getStockBadge(product.stock)
              const isExpanded = expandedDesc[product.id]
              const longDesc = product.description?.length > 80
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={!isMobile ? { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' } : {}}
                  style={{
                    background: colors.card, borderRadius: '14px',
                    border: `1px solid ${colors.border}`, overflow: 'hidden'
                  }}
                >
                  {/* Image */}
                  <div
                    style={{ position: 'relative', height: isMobile ? '140px' : '200px', background: isDark ? '#1a1a2e' : '#f1f5f9', overflow: 'hidden', cursor: 'zoom-in' }}
                    onClick={() => product.image && setLightboxImg(product.image)}
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Package style={{ width: '36px', height: '36px', color: colors.subtext, opacity: 0.4 }} />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      padding: '3px 8px', borderRadius: '999px',
                      fontSize: '10px', fontWeight: 700,
                      color: stock.color, background: stock.bg,
                      backdropFilter: 'blur(4px)'
                    }}>
                      {stock.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: isMobile ? '12px' : '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '6px' }}>
                      <h3 style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 800, color: colors.text, margin: 0, flex: 1 }}>
                        {product.name}
                      </h3>
                      <span style={{ fontSize: isMobile ? '13px' : '18px', fontWeight: 900, color: '#E8541A', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        ₦{Number(product.price).toLocaleString()}
                      </span>
                    </div>

                    {!isMobile && (
                      <>
                        <p style={{ fontSize: '13px', color: colors.subtext, lineHeight: 1.5, marginBottom: '4px' }}>
                          {longDesc && !isExpanded ? product.description.slice(0, 80) + '...' : product.description}
                        </p>
                        {longDesc && (
                          <button
                            onClick={() => setExpandedDesc(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D2D7F', fontSize: '12px', fontWeight: 700, padding: 0, marginBottom: '10px' }}
                          >
                            {isExpanded ? 'Read less ↑' : 'Read more ↓'}
                          </button>
                        )}
                      </>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: isMobile ? '8px' : '12px' }}>
                      <button
                        onClick={() => likeMutation.mutate(product.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: isMobile ? '7px 10px' : '9px 14px', borderRadius: '10px',
                          border: `1.5px solid ${product.is_liked ? '#ef4444' : colors.border}`,
                          background: product.is_liked ? 'rgba(239,68,68,0.08)' : 'transparent',
                          color: product.is_liked ? '#ef4444' : colors.subtext,
                          cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        }}
                      >
                        <Heart style={{ width: '13px', height: '13px', fill: product.is_liked ? '#ef4444' : 'none' }} />
                        {product.likes_count}
                      </button>

                      <button
                        onClick={() => {
                          if (product.stock === 0) return toast.error('Out of stock')
                          navigate(`/order/${product.id}`)
                        }}
                        disabled={product.stock === 0}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          padding: isMobile ? '7px 8px' : '9px 14px', borderRadius: '10px',
                          border: 'none',
                          background: product.stock === 0 ? '#374151' : '#2D2D7F',
                          color: 'white', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          fontSize: isMobile ? '11px' : '13px', fontWeight: 700,
                        }}
                      >
                        <ShoppingCart style={{ width: '13px', height: '13px' }} />
                        {isMobile ? 'Order' : 'Order Now'}
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
            <button onClick={() => setLightboxImg(null)} style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: '40px', height: '40px',
              cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
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





