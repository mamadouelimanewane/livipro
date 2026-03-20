import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import DriverApp from './DriverApp'
import ClientPortal from './ClientPortal'
import './index.css'

function DemoHome() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>LiviPro B2B</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>Choisissez l'expérience de démonstration :</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Link to="/driver" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#f97316', color: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)', fontWeight: 800, fontSize: 18, transition: 'transform 0.2s', ':active': { transform: 'scale(0.98)' } }}>
            🚛 Chauffeur & Livraison (LiviPro Distri)
          </div>
        </Link>
        <Link to="/boutique" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f172a', color: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)', fontWeight: 800, fontSize: 18 }}>
            🏪 Portail Client (Boutiquier LiviDash)
          </div>
        </Link>
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
      </Routes>
    </BrowserRouter>
  )
}
