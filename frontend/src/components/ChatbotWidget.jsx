import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2 } from 'lucide-react'
import api from '../services/api'
import useThemeStore from '../store/themeStore'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m the Pulse Parcel assistant 👋 How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { theme } = useThemeStore()

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

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: '100px', right: '24px',
              width: '360px', height: '480px',
              background: colors.bg,
              borderRadius: '20px',
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
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/p_logo.png" alt="Logo" style={{
                  width: '32px', height: '32px',
                  borderRadius: '8px', objectFit: 'contain',
                  background: 'transparent', padding: '0'
                }} />
                <div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '14px', margin: 0 }}>Pulse Assistant</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>● Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  borderRadius: '8px', width: '30px', height: '30px',
                  cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <img src="/p_logo.png" alt="bot" style={{
                      width: '28px', height: '28px',
                      borderRadius: '8px', objectFit: 'contain',
                      background: 'transparent', padding: '0',
                      marginRight: '8px', alignSelf: 'flex-end', flexShrink: 0
                    }} />
                  )}
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? colors.userBubble : colors.aiBubble,
                    color: msg.role === 'user' ? 'white' : colors.text,
                    fontSize: '13px', lineHeight: 1.6
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/p_logo.png" alt="bot" style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px', objectFit: 'contain',
                    background: 'transparent', padding: '0'
                  }} />
                  <div style={{
                    background: colors.aiBubble, borderRadius: '16px',
                    padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center'
                  }}>
                    {[0, 1, 2].map(j => (
                      <motion.div
                        key={j}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.15 }}
                        style={{
                          width: '6px', height: '6px',
                          borderRadius: '50%', background: colors.subtext
                        }}
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
              display: 'flex', gap: '8px', alignItems: 'center'
            }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1, padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1.5px solid ${colors.inputBorder}`,
                  background: colors.inputBg, color: colors.text,
                  fontSize: '13px', outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: '#2D2D7F', border: 'none',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}
              >
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
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '2px solid #2D2D7F',
            pointerEvents: 'none'
          }}
        />
        <img
          src="/p_logo.png"
          alt="Chat"
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain', borderRadius: '50%'
          }}
        />
      </motion.button>
    </>
  )
}



