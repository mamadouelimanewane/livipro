import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, DEMO_ACCOUNTS } from './AuthContext'

const COLORS = {
  admin: '#0f172a',
  grossiste: '#6366f1',
  boutiquier: '#10b981',
  livreur: '#f97316',
  banque: '#0ea5e9'
}

const ICONS = {
  admin: '⚙️',
  grossiste: '🏭',
  boutiquier: '🏪',
  livreur: '🚛',
  banque: '🏦',
  market: '🏷️'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const isMobile = window.innerWidth < 480;

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // UX delay
    const result = login(email, password)
    setLoading(false)
    if (result.success) {
      navigate(result.user.redirectTo)
    } else {
      setError(result.error)
    }
  }

  const quickLogin = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #312e81 0%, #0f172a 100%)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px 10px' : '20px',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 24 }}>
          <h1 style={{ color: '#fff', fontSize: isMobile ? 28 : 36, fontWeight: 950, margin: 0, letterSpacing: '-2px' }}>LIVIPRO <span style={{ fontWeight: 400, opacity: 0.7 }}>B2B</span></h1>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Écosystème Fintech & Logistique · Sénégal</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: isMobile ? '24px 16px' : '32px 28px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 20, textAlign: 'center' }}>Connexion Rapide</h2>

            {/* Primary Independent Rectangles on 3 Lines */}
            <div style={{ 
              display: 'flex', flexDirection: 'column',
              maxWidth: 400, margin: '0 auto', marginBottom: 20,
              gap: 10
            }}>
              {['grossiste', 'boutiquier', 'livreur'].map((role) => {
                const acc = DEMO_ACCOUNTS.find(a => a.role === role);
                return (
                  <button key={role} onClick={() => quickLogin(acc)} 
                    style={{
                      background: COLORS[role], color: '#fff', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16, width: '100%', padding: isMobile ? '12px 16px' : '14px 20px', 
                      cursor: 'pointer',
                      fontSize: 16, display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: `0 4px 15px rgba(0,0,0,0.25)`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 20 : 24 }}>{ICONS[role]}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 10, fontWeight: 950, textTransform: 'uppercase', letterSpacing: 0.5 }}>{role}</div>
                      <div style={{ fontSize: 9, opacity: 0.9, fontWeight: 500 }}>{acc.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 8 : 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {['admin', 'banque', 'market'].map((role) => {
                const acc = role === 'market' ? null : (role === 'market' ? DEMO_ACCOUNTS.find(a => a.role === 'grossiste') : DEMO_ACCOUNTS.find(a => a.role === role));
                const supportBg = role === 'admin' ? '#000' : role === 'banque' ? '#2563eb' : '#dc2626';

                const IconWrapper = ({ children }) => (
                  <div 
                    style={{
                      background: supportBg, color: '#fff', 
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12, padding: isMobile ? '8px 12px' : '10px 16px', cursor: 'pointer',
                      fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: `0 4px 10px ${supportBg}40`
                    }}
                  >
                    {children}
                  </div>
                );

                if (role === 'market') {
                   return (
                     <Link key={role} to="/market" style={{ textDecoration: 'none' }}>
                        <IconWrapper>
                           {ICONS[role]}
                           <span style={{ fontSize: 8, fontWeight: 900 }}>OFFRES</span>
                        </IconWrapper>
                     </Link>
                   );
                }

                return (
                  <button key={role} onClick={() => quickLogin(acc)} 
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    <IconWrapper>
                       {ICONS[role]}
                       <span style={{ fontSize: 8, fontWeight: 900 }}>{role.toUpperCase().slice(0,4)}</span>
                    </IconWrapper>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="📧 Email partenaire"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 16,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: 16, position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="🔑 Mot de passe"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '14px 48px 14px 16px', color: '#fff', fontSize: 16,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#fca5a5', fontSize: 12 }}>
                  ❌ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  width: '100%', background: loading ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: loading ? '#94a3b8' : '#0f172a', border: 'none', borderRadius: 12, padding: '16px',
                  fontSize: 16, fontWeight: 900, cursor: loading ? 'wait' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(245,158,11,0.3)',
                  transition: 'all 0.2s'
                }}>
                {loading ? 'Connexion...' : '🚀 Se connecter'}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
               <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 100, color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: 1.2 }}>
                 ✨ PROTOCOLE SÉNÉGAL POSITIF
               </span>
            </div>
        </div>

        <p style={{ color: '#334155', fontSize: 11, textAlign: 'center', marginTop: 24 }}>
          LiviPro B2B v3.0 · © 2026 · Écosystème Connecté
        </p>
      </div>
    </div>
  )
}
