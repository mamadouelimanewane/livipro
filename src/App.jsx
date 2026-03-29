import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import { initIdleDiscovery } from './services/DiscoveryService'
import LiviVoiceAssistant from './components/LiviVoiceAssistant'
import LoginPage from './LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DriverApp from './DriverApp'
import ClientPortal from './ClientPortal'
import AssociatesBank from './AssociatesBank'
import CommModule from './CommModule'
import AdminPlatform from './AdminPlatform'
import SalesPortal from './SalesPortal'
import LiviWallet from './LiviWallet'
import LiviAI from './LiviAI'
import LandingPage from './LandingPage'
import LiviMarketPage from './LiviMarketPage'
import './index.css'

const DARK_NAVY = "#0f172a"
const GOLD = "#f59e0b"

function DemoHome() {
  const { user, logout } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  return (
    <div style={{
      maxWidth: "100%", margin: '0 auto', 
      background: 'radial-gradient(circle at top, #1e1b4b 0%, #0f172a 100%)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center',
      color: '#fff', fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Mini Profile Header */}
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: "#6366f1", display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{user?.name?.[0]}</div>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</span>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 800 }}>DÉCONNEXION</button>
      </div>

      <div style={{ marginBottom: 48 }}>
        <img src="livipro_trinity_logo_rings_1774774068598.png" alt="Logo" style={{ width: 64, height: 64, marginBottom: 16 }} />
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 950, marginBottom: 8, letterSpacing: '-1.5px' }}>
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', fontWeight: 500 }}>Choisis ton portail d'accès LiviPro</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, width: '100%', maxWidth: 1000 }}>
        {[
          { to: '/sales', bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', icon: '🏭', label: 'Portail Grossiste', sub: 'Gestion des hubs & stocks' },
          { to: '/boutique', bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '🏪', label: 'Boutique Partenaire', sub: 'Commandes B2B & Crédit' },
          { to: '/driver', bg: 'linear-gradient(135deg, #f97316, #ea580c)', icon: '🚛', label: 'Application Livreur', sub: 'Tournées & Encaissement' },
        ].map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: card.bg, color: '#fff', padding: '32px 24px', borderRadius: 28,
              fontWeight: 800, textAlign: 'left',
              boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
              display: 'flex', flexDirection: 'column',
              gap: 12, transition: 'transform 0.2s', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: 180
            }}>
              <div style={{ fontSize: 40 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{card.label}</div>
                <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 400, marginTop: 4 }}>{card.sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, width: '100%', maxWidth: 1000, marginTop: 24 }}>
        {[
          { to: '/wallet', icon: '💳', label: 'LiviWallet' },
          { to: '/bank', icon: '🏦', label: 'Banque' },
          { to: '/comm', icon: '🗨️', label: 'LiviCommunity' },
          { to: '/admin', icon: '⚙️', label: 'Console Admin' },
        ].map(btn => (
          <Link key={btn.to} to={btn.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 12px', borderRadius: 18,
              fontWeight: 800, fontSize: 13, textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{btn.icon}</span>
              {btn.label}
            </div>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: 60, color: '#475569', fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>
        LIVIPRO ECOSYSTEM · ALPHA v3.0 · DAKAR HUB
      </p>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={isAuthenticated ? <DemoHome /> : <LandingPage />} />
      <Route path="/driver" element={<ProtectedRoute allowedRoles={['livreur','admin']}><DriverApp /></ProtectedRoute>} />
      <Route path="/boutique" element={<ProtectedRoute allowedRoles={['boutiquier','admin']}><ClientPortal /></ProtectedRoute>} />
      <Route path="/bank" element={<ProtectedRoute allowedRoles={['banque','admin']}><AssociatesBank /></ProtectedRoute>} />
      <Route path="/comm" element={<ProtectedRoute><CommModule /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPlatform /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute allowedRoles={['grossiste','admin']}><SalesPortal /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><LiviWallet /></ProtectedRoute>} />
      <Route path="/market" element={<LiviMarketPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    initIdleDiscovery();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <LiviVoiceAssistant />
        <AppRoutes />
        <LiviAI />
      </AuthProvider>
    </BrowserRouter>
  )
}
