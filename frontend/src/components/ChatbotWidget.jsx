import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, TrendingUp, Package, Truck, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: null, isWelcome: true }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { theme } = useThemeStore()
  const { user } = useAuthStore()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const colors = {
    bg: isDark ? '#0f0f23' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#0f172a',
    subtext: isDark ? '#9ca3af' : '#64748b',
    inputBg: isDark ? '#111827' : '#f1f5f9',
    inputBorder: isDark ? '#374151' : '#e2e8f0',
    userBubble: '#2D2D7F',
    aiBubble: isDark ? '#1a1a2e' : '#f1f5f9',
    statBg: isDark ? '#0a0a1a' : '#f8fafc',
  }

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/').then(r => r.data),
    enabled: open
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    onMove: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/chatbot/', { message: userMsg.content })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickReplies = [
    'What are my recent orders?',
    'How do I track my parcel?',
    'How much have I spent?',
    'How do I place an order?',
  ]

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: '100px', right: '24px',
              width: '380px', height: '560px',
              background: colors.bg, borderRadius: '20px',
              border: `1px solid ${colors.border}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column',
              zIndex: 999, overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #2D2D7F 0%, #E8541A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/p_logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} />
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '14px', margin: 0 }}>Pulse Assistant</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>
                    Hi {user?.full_name?.split(' ')[0] || 'there'} 👋
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Account Stats Bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px', padding: '12px 16px',
              background: colors.statBg,
              borderBottom: `1px solid ${colors.border}`,
              flexShrink: 0
            }}>
              {[
                { label: 'Orders', value: stats.total, color: '#2D2D7F', icon: TrendingUp },
                { label: 'Pending', value: stats.pending, color: '#F5A623', icon: Package },
                { label: 'Moving', value: stats.onMove, color: '#E8541A', icon: Truck },
                { label: 'Done', value: stats.delivered, color: '#10b981', icon: CheckCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: '8px', background: `${color}10` }}>
                  <Icon style={{ width: '14px', height: '14px', color, margin: '0 auto 2px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '10px', color: colors.subtext, fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.isWelcome ? (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <img src="/p_logo.png" alt="bot" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'contain', flexShrink: 0 }} />
                        <div style={{
                          background: colors.aiBubble, borderRadius: '16px 16px 16px 4px',
                          padding: '10px 14px', fontSize: '13px', color: colors.text, lineHeight: 1.6
                        }}>
                          Hi {user?.full_name?.split(' ')[0] || 'there'}! I'm your Pulse Parcel account assistant. I can help you with your orders, tracking and more. What can I do for you?
                        </div>
                      </div>

                      {/* Quick reply buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '36px' }}>
                        {quickReplies.map(reply => (
                          <button
                            key={reply}
                            onClick={() => {
                              setInput(reply)
                              setTimeout(() => {
                                document.getElementById('chat-input')?.focus()
                              }, 100)
                            }}
                            style={{
                              padding: '5px 10px', borderRadius: '999px',
                              border: `1px solid ${colors.border}`,
                              background: 'transparent', color: colors.subtext,
                              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.role === 'assistant' && (
                        <img src="/p_logo.png" alt="bot" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'contain', marginRight: '8px', alignSelf: 'flex-end', flexShrink: 0 }} />
                      )}
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.role === 'user' ? colors.userBubble : colors.aiBubble,
                        color: msg.role === 'user' ? 'white' : colors.text,
                        fontSize: '13px', lineHeight: 1.6
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/p_logo.png" alt="bot" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'contain' }} />
                  <div style={{ background: colors.aiBubble, borderRadius: '16px', padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(j => (
                      <motion.div key={j}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.15 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.subtext }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{
              padding: '12px 16px',
              borderTop: `1px solid ${colors.border}`,
              display: 'flex', gap: '8px', alignItems: 'center',
              flexShrink: 0
            }}>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px',
                  border: `1.5px solid ${colors.inputBorder}`,
                  background: colors.inputBg, color: colors.text,
                  fontSize: '13px', outline: 'none'
                }}
              />
              <button type="submit" disabled={loading || !input.trim()}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: '#2D2D7F', border: 'none',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                <Send style={{ width: '15px', height: '15px', color: 'white' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        animate={{ scale: open ? 0.9 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '64px', height: '64px',
          borderRadius: '50%', border: 'none',
          cursor: 'pointer', zIndex: 1000,
          background: 'transparent',
          boxShadow: '0 8px 32px rgba(45,45,127,0.35)',
          padding: '0', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid #2D2D7F', pointerEvents: 'none'
          }}
        />
        <img src="/p_logo.png" alt="Chat" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
      </motion.button>
    </>
  )
}





