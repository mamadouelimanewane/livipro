import { createContext, useContext, useState, useEffect } from 'react'

// Comptes démo LiviPro
export const DEMO_ACCOUNTS = [
  {
    id: 'b1000001-0000-0000-0000-000000000001',
    email: 'admin@livipro.sn',
    password: 'Admin@2026',
    role: 'admin',
    name: 'Moussa Diallo',
    title: 'Administrateur Plateforme',
    avatar: 'MD',
    karma: 9999,
    redirectTo: '/admin'
  },
  {
    id: 'b2000001-0000-0000-0000-000000000001',
    email: 'alamine@livipro.sn',
    password: 'Grossiste@2026',
    role: 'grossiste',
    name: 'Grossiste Al-Amine',
    title: 'Grossiste Certifié Platinum',
    avatar: 'AL',
    karma: 980,
    redirectTo: '/sales'
  },
  {
    id: 'b3000001-0000-0000-0000-000000000001',
    email: 'boutique@livipro.sn',
    password: 'Boutique@2026',
    role: 'boutiquier',
    name: 'Supermarché Médina',
    title: 'Boutiquier Certifié',
    avatar: 'SM',
    karma: 942,
    redirectTo: '/boutique'
  },
  {
    id: 'b4000001-0000-0000-0000-000000000001',
    email: 'livreur@livipro.sn',
    password: 'Livreur@2026',
    role: 'livreur',
    name: 'Ousmane Diallo',
    title: 'Livreur Professionnel',
    avatar: 'OD',
    karma: 920,
    redirectTo: '/driver'
  },
  {
    id: 'b2000001-0000-0000-0000-000000000005',
    email: 'banque@livipro.sn',
    password: 'Banque@2026',
    role: 'banque',
    name: 'Touba Distri.',
    title: 'Partenaire Financier',
    avatar: 'TD',
    karma: 890,
    redirectTo: '/bank'
  }
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer session stockée
    const saved = localStorage.getItem('livipro_session')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch(e) {}
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password)
    if (account) {
      const session = { ...account, loginAt: new Date().toISOString() }
      setUser(session)
      localStorage.setItem('livipro_session', JSON.stringify(session))
      return { success: true, user: session }
    }
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('livipro_session')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
