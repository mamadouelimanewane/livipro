import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const ROLE_COLORS = {
  admin: '#f59e0b',
  grossiste: '#6366f1',
  boutiquier: '#10b981',
  livreur: '#f97316',
  banque: '#0ea5e9'
}

export default function UserTopBar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 20px', height: 56
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>🌍</button>
        <span style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>{title || 'LiviPro'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: ROLE_COLORS[user.role] || '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 900
          }}>{user.avatar}</div>
          <div style={{ display: 'none' }} className="hide-mobile">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{user.name}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>⭐ {user.karma} karma</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>
    </div>
  )
}
