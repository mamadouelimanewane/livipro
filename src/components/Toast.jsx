import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
const COLORS = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const toast = {
    success: (msg) => show(msg, 'success'),
    error:   (msg) => show(msg, 'error'),
    warning: (msg) => show(msg, 'warning'),
    info:    (msg) => show(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380 }}>
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, color: c.text,
              borderRadius: 14, padding: '14px 18px', fontSize: 13, fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'flex-start', gap: 10,
              animation: 'slideInRight 0.3s ease',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{ICONS[t.type]}</span>
              <span style={{ lineHeight: 1.5 }}>{t.message}</span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
