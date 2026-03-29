import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Zap, Globe, Users, ShoppingBag, Truck } from 'lucide-react'
import LiviLogo from './components/LiviLogo'

// Utilisation du logo généré
const TRINITY_LOGO = "livipro_trinity_logo_rings_1774774068598.png";

const COLORS = {
  purple: "#6366f1", // Indigo/Purple
  green: "#10b981",  // Vision Green
  orange: "#f59e0b", // Sunset Orange
  deepSub: "#0f172a" // Dark Navy
}

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% -20%, #312e81 0%, #1e1b4b 45%, #0f172a 100%)',
      color: '#fff',
      fontFamily: "'Outfit', sans-serif",
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Glow Effects */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: 'rgba(99,102,241,0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, background: 'rgba(245,158,11,0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

      {/* Navigation & Centered Logo */}
      <nav style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '60px 5% 40px', position: 'relative', zIndex: 10, gap: 24
      }}>
        <LiviLogo size={160} style={{ filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.6))' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 1200, alignItems: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: '-2px', color: '#fff' }}>LIVIPRO <span style={{ fontWeight: 400, opacity: 0.7 }}>B2B</span></div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: 0.7 }}>SOLUTIONS</span>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', padding: '12px 24px', borderRadius: 14,
                fontWeight: 800, fontSize: 14, cursor: 'pointer', backdropFilter: 'blur(10px)'
              }}>Connexion</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 5% 120px', textAlign: 'center', position: 'relative', zIndex: 10
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
          padding: '8px 20px', borderRadius: 100, fontSize: 11, fontWeight: 900,
          color: COLORS.orange, marginBottom: 32, letterSpacing: 2, textTransform: 'uppercase'
        }}>
          ✨ Protocole Sénégal Positif · Alpha v3.0
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 84px)', fontWeight: 950, lineHeight: 0.95,
          letterSpacing: '-3px', marginBottom: 32, maxWidth: 900
        }}>
          L'Écosystème qui <span style={{ color: COLORS.purple }}>Unit</span> le Marché.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', color: '#94a3b8', 
          maxWidth: 640, lineHeight: 1.6, marginBottom: 48, fontWeight: 500
        }}>
          La première plateforme B2B unifiant **Grossistes**, **Boutiquiers** et **Livreurs** dans un réseau intelligent de confiance et de croissance.
        </p>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: COLORS.purple, color: '#fff', padding: '20px 40px',
              borderRadius: 20, border: 'none', fontWeight: 900, fontSize: 18,
              cursor: 'pointer', boxShadow: '0 20px 40px rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.2s'
            }}>
              Entrer dans l'Écosystème <ArrowRight size={20} />
            </button>
          </Link>
        </div>

        {/* Triple Rings Visualization */}
        <div style={{ marginTop: 100, textAlign: 'center' }}>
          <div style={{ 
            fontSize: 12, fontWeight: 900, color: '#475569', letterSpacing: 3, 
            textTransform: 'uppercase', marginBottom: 40 
          }}>LA TRINITÉ LIVIPRO</div>
          
          <div style={{ 
            display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 10vw, 80px)', 
            flexWrap: 'wrap' 
          }}>
            {[
              { label: 'Grossistes', color: COLORS.purple, icon: <Building2 />, desc: 'LiviHub Management' },
              { label: 'Boutiquiers', color: COLORS.green, icon: <ShoppingBag />, desc: 'Proximité & Crédit' },
              { label: 'Livreurs', color: COLORS.orange, icon: <Truck />, desc: 'Logistique du Dernier Km' }
            ].map(ring => (
              <div key={ring.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', 
                  border: `4px solid ${ring.color}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.02)', boxShadow: `0 0 20px ${ring.color}20`
                }}>
                  <span style={{ color: ring.color }}>{ring.label.slice(0,1)}</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{ring.label}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{ring.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer / Trust Bar */}
      <footer style={{ 
        padding: '60px 5%', borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(0,0,0,0.2)', textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', opacity: 0.5 }}>
           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ShieldCheck size={18} /> LiviShield™ Certifié</div>
           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Zap size={18} /> Transactions Instantanées</div>
           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Globe size={18} /> Réseau National Sénégal</div>
        </div>
      </footer>
    </div>
  )
}

function Building2() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
}
