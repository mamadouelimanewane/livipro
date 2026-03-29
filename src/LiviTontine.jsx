import { useState, useEffect } from 'react'
import { Users, Calendar, TrendingUp, ShieldCheck, ArrowUpRight, Wallet, History, Star } from 'lucide-react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

const DARK_NAVY = "#0f172a"
const GOLD = "#f59e0b"
const VISION_GREEN = "#10b981"

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #f1f5f9",
    boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
    ...style
  }}>
    {children}
  </div>
);

export default function LiviTontine() {
  const { user } = useAuth()
  const [tontines, setTontines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTontines = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase
        .from('tontines')
        .select(`
          *,
          tontine_members(*)
        `)
      if (data) setTontines(data)
      setLoading(false)
    }
    fetchTontines()
  }, [user])

  return (
    <div className="animate-fade-in">
      {/* HEADER SECTION */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 950, color: DARK_NAVY, marginBottom: 8 }}>
          LiviTontine™ <span style={{ color: GOLD }}>Communautaire</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Épargne collaborative sécurisée par LiviShield. Cotisez ensemble, gagnez à tour de rôle.
        </p>
      </div>

      {/* QUICK STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <Card style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff' }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: 'uppercase' }}>Cagnotte Totale Gérée</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>12.4M FCFA</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>+12% ce mois</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Votre Rang de Gain</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: DARK_NAVY, marginTop: 4 }}>
            #3 <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>sur 10</span>
          </div>
          <div style={{ fontSize: 11, color: VISION_GREEN, fontWeight: 700, marginTop: 4 }}>Prochain gain: 15 Avril</div>
        </Card>
      </div>

      {/* ACTIVE TONTINES */}
      <h3 style={{ fontSize: 18, fontWeight: 850, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Users size={20} color={GOLD} /> Vos Groupes d'Épargne
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {tontines.map(t => (
          <Card key={t.id} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              position: 'absolute', top: 0, right: 0, 
              padding: '8px 20px', background: VISION_GREEN, color: '#fff', 
              fontSize: 10, fontWeight: 900, borderBottomLeftRadius: 16 
            }}>
              ACTIF
            </div>
            
            <div style={{ fontWeight: 900, fontSize: 18, color: DARK_NAVY, marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{t.description}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, background: '#f8fafc', padding: 16, borderRadius: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>COTISATION</div>
                <div style={{ fontWeight: 900, color: DARK_NAVY }}>{t.monthly_amount.toLocaleString()} F</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>CYCLE</div>
                <div style={{ fontWeight: 900, color: DARK_NAVY }}>{t.current_round} / {t.total_rounds} MOIS</div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                <span>Remplissage du cycle</span>
                <span>{Math.round((t.current_round/t.total_rounds)*100)}%</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(t.current_round/t.total_rounds)*100}%`, background: GOLD, borderRadius: 4 }} />
              </div>
            </div>

            <button style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: DARK_NAVY, color: '#fff', border: 'none',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <Wallet size={16} /> Cotiser ce mois
            </button>
          </Card>
        ))}
      </div>

      {/* RECENT HISTORY */}
      <Card style={{ marginTop: 32 }}>
        <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={18} /> Historique des Gains & Cotisations
        </h4>
        <div style={{ borderTop: '1px solid #f1f5f9' }}>
          {[
            { label: 'Gain Tontine Médina', date: '15 Fév 2026', amount: '+250,000 F', type: 'gain' },
            { label: 'Cotisation Tontine Médina', date: '15 Jan 2026', amount: '-25,000 F', type: 'pay' },
            { label: 'Cotisation Tontine Médina', date: '15 Déc 2025', amount: '-25,000 F', type: 'pay' },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{h.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{h.date}</div>
              </div>
              <div style={{ fontWeight: 900, color: h.type === 'gain' ? VISION_GREEN : DARK_NAVY }}>
                {h.amount}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
