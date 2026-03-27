import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import DriverApp from './DriverApp'
import ClientPortal from './ClientPortal'
import AssociatesBank from './AssociatesBank'
import CommModule from './CommModule'
import AdminPlatform from './AdminPlatform'
import SalesPortal from './SalesPortal'
import LiviWallet from './LiviWallet'
import LiviAI from './LiviAI'
import './index.css'

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";

function DemoHome() {
  const hour = new Date().getHours()
  const greeting = hour < 18 ? "Bonjour" : "Bonsoir"

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: "40px 20px", textAlign: 'center' }}>
      <h1 style={{ fontSize: window.innerWidth > 768 ? 48 : 32, fontWeight: 900, color: '#0f172a', marginBottom: 12, letterSpacing: "-1px" }}>{greeting}, LiviPro B2B</h1>
      <p style={{ fontSize: 18, color: '#64748b', marginBottom: 60, fontWeight: 500 }}>Écosystème Fintech & Logistique Alpha v3.0</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr', gap: 24, width: '100%', maxWidth: 900 }}>
        <Link to="/sales" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#6366f1', color: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)', fontWeight: 800, fontSize: 18, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏭</div>
            Grossiste (LiviHub)
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8, fontWeight: 400 }}>Stocks, Flotte & Prix</div>
          </div>
        </Link>
        <Link to="/driver" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#f97316', color: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.2)', fontWeight: 800, fontSize: 18, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🚛</div>
            Livreur (App Mobile)
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8, fontWeight: 400 }}>Tournées & LiviCash</div>
          </div>
        </Link>
        <Link to="/boutique" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f172a', color: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)', fontWeight: 800, fontSize: 18, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏪</div>
            Boutique (LiviDash)
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8, fontWeight: 400 }}>Ravitaillement & Crédit</div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(4, 1fr)' : '1fr 1fr', gap: 16, width: '100%', maxWidth: 900, marginTop: 24 }}>
          <Link to="/wallet" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', color: DARK_NAVY, padding: 20, borderRadius: 20, fontWeight: 900, fontSize: 14, border: '2px solid #e2e8f0', textAlign: 'center' }}>
              💳 LiviWallet
            </div>
          </Link>
          <Link to="/bank" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', color: DARK_NAVY, padding: 20, borderRadius: 20, fontWeight: 800, fontSize: 14, border: '2px solid #e2e8f0', textAlign: 'center' }}>
              🏦 Banque
            </div>
          </Link>
          <Link to="/comm" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', color: DARK_NAVY, padding: 20, borderRadius: 20, fontWeight: 800, fontSize: 14, border: '2px solid #e2e8f0', textAlign: 'center' }}>
              💬 Comm
            </div>
          </Link>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <div style={{ background: DARK_NAVY, color: GOLD, padding: 20, borderRadius: 20, fontWeight: 900, fontSize: 14, border: '1px solid #f59e0b', textAlign: 'center' }}>
              ⚙️ Admin
            </div>
          </Link>
      </div>
      
      <div style={{ marginTop: 60, fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ padding: '6px 12px', background: '#e2e8f0', borderRadius: 8, color: '#475569' }}>PROTOCOLE SÉNÉGAL POSITIF</span>
        <span>•</span>
        <span>Système de Gouvernance Décentralisée LiviPro</span>
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
        <Route path="/sales" element={<SalesPortal />} />
        <Route path="/wallet" element={<LiviWallet />} />
      </Routes>
      <LiviAI />
    </BrowserRouter>
  )
}
