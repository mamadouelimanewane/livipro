import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import DriverApp from './DriverApp'
import ClientPortal from './ClientPortal'
import AssociatesBank from './AssociatesBank'
import CommModule from './CommModule'
import AdminPlatform from './AdminPlatform'
import './index.css'

function DemoHome() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>LiviPro B2B</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>Choisissez l'expérience de démonstration :</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Link to="/driver" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#f97316', color: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)', fontWeight: 800, fontSize: 18, transition: 'transform 0.2s' }}>
            🚛 Chauffeur & Livraison (LiviPro Distri)
          </div>
        </Link>
        <Link to="/boutique" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f172a', color: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)', fontWeight: 800, fontSize: 18 }}>
            🏪 Portail Client (Boutiquier LiviDash)
          </div>
        </Link>
        <Link to="/bank" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f59e0b', border: '2px solid #f59e0b', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)', fontWeight: 900, fontSize: 18 }}>
            🏦 Banque des Associés (Fintech)
          </div>
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link to="/comm" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#25D366', color: '#fff', padding: 18, borderRadius: 20, boxShadow: '0 10px 30px rgba(37, 211, 102, 0.3)', fontWeight: 800, fontSize: 13 }}>
              💬 Communication
            </div>
          </Link>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#64748b', color: '#fff', padding: 18, borderRadius: 20, boxShadow: '0 10px 30px rgba(100, 116, 139, 0.3)', fontWeight: 800, fontSize: 13 }}>
              ⚙️ Admin Console
            </div>
          </Link>
        </div>
      </div>
      
      <div style={{ marginTop: 40, fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: 6 }}>ALPHA v1.8</span>
        <span>• Console Master Admin</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DemoHome />} />
        <Route path="/driver" element={<DriverApp />} />
        <Route path="/boutique" element={<ClientPortal />} />
        <Route path="/bank" element={<AssociatesBank />} />
        <Route path="/comm" element={<CommModule />} />
        <Route path="/admin" element={<AdminPlatform />} />
      </Routes>
    </BrowserRouter>
  )
}
