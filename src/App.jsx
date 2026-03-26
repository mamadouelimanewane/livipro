import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import DriverApp from './DriverApp'
import ClientPortal from './ClientPortal'
import AssociatesBank from './AssociatesBank'
import CommModule from './CommModule'
import AdminPlatform from './AdminPlatform'
import SalesPortal from './SalesPortal'
import LiviWallet from './LiviWallet'
import './index.css'

function DemoHome() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>LiviPro B2B</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 40 }}>Écosystème Fintech & Logistique :</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Link to="/wallet" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#f59e0b', padding: 24, borderRadius: 24, boxShadow: '0 15px 40px rgba(0,0,0,0.15)', fontWeight: 900, fontSize: 18, border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            💳 LiviWallet (Wave / OM)
          </div>
        </Link>
        <Link to="/driver" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#f97316', color: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)', fontWeight: 800, fontSize: 18 }}>
            🚛 Livreur (LiviPro Distri)
          </div>
        </Link>
        <Link to="/boutique" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f172a', color: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)', fontWeight: 800, fontSize: 18 }}>
            🏪 Boutique (LiviDash)
          </div>
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
           <Link to="/sales" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#6366f1', color: '#fff', padding: 20, borderRadius: 20, fontWeight: 800, fontSize: 14 }}>
              📦 Ventes
            </div>
          </Link>
          <Link to="/bank" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1e293b', color: '#f59e0b', padding: 20, borderRadius: 20, fontWeight: 800, fontSize: 14 }}>
              🏦 Banque
            </div>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link to="/comm" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#25D366', color: '#fff', padding: 18, borderRadius: 20, fontWeight: 800, fontSize: 13 }}>
              💬 Comm
            </div>
          </Link>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#64748b', color: '#fff', padding: 18, borderRadius: 20, fontWeight: 800, fontSize: 13 }}>
              ⚙️ Admin
            </div>
          </Link>
        </div>
      </div>
      
      <div style={{ marginTop: 40, fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: 6 }}>ALPHA v3.0</span>
        <span>• Wallet (Wave / OM) Intégré</span>
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
    </BrowserRouter>
  )
}
