import { useState, useEffect } from 'react'
import LiviSearch from './LiviSearch'
import LiviDirectory from './LiviDirectory'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users } from 'lucide-react'

// Simulation des données client (Boutiquier)
const BOUTIQUE = {
  name: "Supermarché Al-Amine",
  balance: "2.450.000 FCFA",
  creditLimit: "5.000.000 FCFA",
  karma: 942,
  tontineStatus: "Actif (Prélèvement 1.2%)",
}

export default function ClientPortal() {
  const [view, setView] = useState("dashboard"); // dashboard | search | directory
  const [isOrdering, setIsOrdering] = useState(false)

  const handleOrder = () => {
    setIsOrdering(true)
    setTimeout(() => {
      setIsOrdering(false)
      alert("Demande de réassort transmise au grossiste ! Livraison prévue à 14h30.")
    }, 1500)
  }

  if (view === "search") return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <button onClick={() => setView("dashboard")} style={{ position: "absolute", top: 20, left: 20, zIndex: 10, background: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "pointer" }}>
        <ArrowLeft size={20} />
      </button>
      <LiviSearch />
    </div>
  if (view === "directory") return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <button onClick={() => setView("dashboard")} style={{ position: "absolute", top: 20, left: 20, zIndex: 10, background: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "pointer" }}>
        <ArrowLeft size={20} />
      </button>
      <LiviDirectory />
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', padding: '20px', paddingBottom: 100, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Flash Ads / Promotions du Jour (Revenue for Platform Owner) */}
      <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)', borderRadius: 16, padding: '12px 20px', marginBottom: 20, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.2)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={20} fill="#fff" />
            <div style={{ fontSize: 13, fontWeight: 800 }}>FLASH PROMO : -20% sur l'Huile Dinor (Port de Dakar)</div>
         </div>
         <div style={{ fontSize: 9, background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>SPONSORISÉ</div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Bienvenue chez LiviDash</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{BOUTIQUE.name}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <BellRing size={24} color="#0f172a" />
          <div style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></div>
        </div>
      </div>
      
      {/* LiviSearch AI Entry Point */}
      <div onClick={() => setView("search")} style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
         <Search size={20} color="#f59e0b" />
         <div style={{ flex: 1, color: '#94a3b8', fontSize: 14, fontWeight: 700 }}>Chercher & Comparer les Prix (IA)</div>
         <div style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: 8, fontSize: 10, color: '#b45309', fontWeight: 900 }}>SCAN B2B</div>
      </div>

      <div onClick={() => setView("directory")} style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
         <Users size={20} color={VISION_GREEN} />
         <div style={{ flex: 1, color: '#94a3b8', fontSize: 14, fontWeight: 700 }}>Annuaire du Réseau (Networking)</div>
         <div style={{ background: '#ecfdf5', padding: '4px 8px', borderRadius: 8, fontSize: 10, color: '#065f46', fontWeight: 900 }}>MEMBRES</div>
      </div>

      {/* Karma Score Card */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: 12, display: 'inline-block' }}>KARMA LOGISTIQUE</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', margin: '8px 0' }}>{BOUTIQUE.karma} <span style={{ fontSize: 16, color: '#94a3b8' }}>/ 1000</span></div>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', border: '5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#10b981' }}>
              A+
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 12, lineHeight: 1.4 }}>
            Excellent ! Votre ponctualité vous octroie un taux préférentiel de <b>1.8%</b> sur vos prochains crédits.
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#6366f1', marginBottom: 12 }}><BatteryCharging size={24} /></div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Limite de Crédit</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{BOUTIQUE.creditLimit}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9' }}>
          <div style={{ color: '#10b981', marginBottom: 12 }}><Zap size={24} /></div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Flash Réappro</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>J+1 Garanti</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Action Button */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>📦 Commandes & Réassort</h3>
            <button 
              onClick={handleOrder}
              disabled={isOrdering}
              style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: 16, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: isOrdering ? 'not-allowed' : 'pointer', opacity: isOrdering ? 0.7 : 1 }}>
              {isOrdering ? (
                <><div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }}></div> Traitement IA...</>
              ) : (
                <><ShoppingCart size={18} /> Renouveler à l'Identique (1 Clic)</>
              )}
            </button>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 20, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.1 }}><PackageSearch size={140} /></div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Cagnotte Banque Associés (J+7)</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{BOUTIQUE.balance} <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>disponibles</span></div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} /> Score IA: A+
              </div>
              <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{BOUTIQUE.tontineStatus}</div>
            </div>
          </div>

          {/* Section de Paiement Multi-Canal */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>💳 Paiement des Factures</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Réglez via LiviWallet ou Mobile Money.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <button style={{ background: '#0f172a', color: '#f59e0b', border: 'none', padding: 18, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 800 }}>
                 <Wallet size={20} /> LiviWallet - 0 F Frais
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button style={{ background: '#4c6ef5', color: '#fff', border: 'none', padding: 14, borderRadius: 16, fontWeight: 800 }}>Wave</button>
                <button style={{ background: '#ff9900', color: '#fff', border: 'none', padding: 14, borderRadius: 16, fontWeight: 800 }}>Orange Money</button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
