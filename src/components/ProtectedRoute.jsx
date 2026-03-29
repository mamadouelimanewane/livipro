import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontSize: 18 }}>⟳ Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
