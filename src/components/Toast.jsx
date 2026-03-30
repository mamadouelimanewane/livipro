/**
 * LiviPro Toast Notification System
 * Remplace tous les alert() du projet.
 *
 * Usage :
 *   import { useToast } from './Toast'
 *   const { toast } = useToast()
 *   toast.success('Commande confirmée !')
 *   toast.error('Échec du paiement')
 *   toast.warning('Stock faible')
 *   toast.info('Mise à jour disponible')
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
const COLORS = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
}

function ToastItem({ id, type = 'info', message, onClose }) {
  const c = COLORS[type] || COLORS.info

  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(t)
  }, [id, onClose])

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      maxWidth: 360, minWidth: 260,
      animation: 'toastIn 0.25s ease',
      fontFamily: "'Outfit', sans-serif",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[type]}</span>
      <p style={{ flex: 1, margin: 0, fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>
        {message}
      </p>
      <button onClick={() => onClose(id)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.text, fontSize: 16, padding: '0 2px', opacity: 0.6,
        flexShrink: 0, lineHeight: 1
      }}>×</button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, type, message }])
    return id
  }, [])

  const toast = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error',   msg),
    warning: (msg) => add('warning', msg),
    info:    (msg) => add('info',    msg),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem {...t} onClose={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
