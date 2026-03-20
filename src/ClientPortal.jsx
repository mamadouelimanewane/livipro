import { useState } from 'react'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap } from 'lucide-react'

// Simulation des données client (Boutiquier)
const BOUTIQUE = {
  name: "Supermarché Al-Amine",
  balance: "150 000 FCFA",
  creditLimit: "500 000 FCFA",
  lastRestock: "14 Mars 2026",
  inventory: [
    { id: 1, product: "Lait Nido (Carton de 12)", stock: "Faible (2 restants)", usualOrder: 15, price: 45000 },
    { id: 2, product: "Sucre St Louis (Fardeau)", stock: "Épuisé (Rupture)", usualOrder: 20, price: 21000 },
    { id: 3, product: "Huile Végétale 5L (Carton)", stock: "Normal (8 restants)", usualOrder: 10, price: 35000 }
  ]
}

export default function ClientPortal() {
  const [orderStatus, setOrderStatus] = useState('idle') // idle | processing | confirmed

  const handleSmartRestock = () => {
    setOrderStatus('processing')
    setTimeout(() => {
      setOrderStatus('confirmed')
    }, 1500)
  }

  if (orderStatus === 'confirmed') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
        <CheckCircle2 size={80} color="#10b981" />
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 24, marginBottom: 8 }}>Réassort Confirmé !</h2>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>Vos 15 cartons de Lait Nido et 20 Fardeaux de Sucre ont été ajoutés à la tournée principale de LiviPro.</p>
        
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 32, width: '100%' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Arrivée Estimée</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#b45309' }}>Aujourd'hui, 15h30</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginTop: 12 }}>Payé via LiviKredit (J+7)</div>
        </div>

        <button onClick={() => setOrderStatus('idle')} style={{ marginTop: 32, background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 700, width: '100%' }}>
          Retour au Portail
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <div style={{ background: '#0f172a', padding: '24px 20px 40px', color: '#fff', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
             <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Portail Partenaire</div>
             <div style={{ fontSize: 20, fontWeight: 800 }}>{BOUTIQUE.name}</div>
          </div>
          <div className="animate-pulse" style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> SmartTag
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: -30 }}>
         {/* Alerte Rupture */}
         <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #fee2e2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', marginBottom: 12 }}>
              <BatteryCharging size={24} /> 
              <span style={{ fontSize: 16, fontWeight: 800 }}>Rupture de stock détectée</span>
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>Notre système indique que vos rayons de Sucre et de Lait sont critiques (Dernier réassort le {BOUTIQUE.lastRestock}).</p>
            
            <button 
              onClick={handleSmartRestock}
              disabled={orderStatus === 'processing'}
              style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
            >
              {orderStatus === 'processing' ? 'Traitement par IA...' : (
                <><ShoppingCart size={18} /> Renouveler à l'Identique (1 Clic)</>
              )}
            </button>
         </div>

         {/* LiviKredit Balance */}
         <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 20, padding: 20, marginTop: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.1 }}><PackageSearch size={140} /></div>
           <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>LiviKredit (Paiement à J+7)</div>
           <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{BOUTIQUE.balance} <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>disponibles</span></div>
           <div style={{ marginTop: 12, fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
             <CheckCircle2 size={14} /> Solvabilité Excellente (Score A+)
           </div>
         </div>

         {/* Catalogue Virtuel (Upsell) */}
         <div style={{ marginTop: 24 }}>
           <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Suggestions du Grossiste</div>
           <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Promo: Jus de Fruits 100% (Palette)</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Le camion passe cet après-midi près de chez vous. Vendu à -15%.</div>
              </div>
              <button style={{ background: '#f1f5f9', border: 'none', padding: 10, borderRadius: 12, color: '#0f172a' }}>
                 <ChevronRight size={20} />
              </button>
           </div>
         </div>
      </div>
    </div>
  )
}
