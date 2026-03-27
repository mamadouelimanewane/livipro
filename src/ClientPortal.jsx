import { useState, useEffect } from 'react'
import LiviSearch from './LiviSearch'
import LiviDirectory from './LiviDirectory'
import LiviVoice from './LiviVoice'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers } from 'lucide-react'
import { useGroupageOffers, useMembers } from './useLiviData'
import DashboardShell from "./components/DashboardShell";

// Simulation des données client (Boutiquier) - À terme via useAuth
const BOUTIQUE = {
  name: "Supermarché Al-Amine",
  balance: "2.450.000 FCFA",
  creditLimit: "5.000.000 FCFA",
  karma: 942,
  tontineStatus: "Actif (Prélèvements Automatisés)",
}

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | shop | orders | wallet
  const [isOrdering, setIsOrdering] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeAction, setActiveAction] = useState(null)
  
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();

  // Liste des produits filtrés pour la démo
  const products = ["Riz Senegalais", "Huile Dinor", "Sucre en Poudre", "Lait Nido", "Oignons Locaux"].filter(p => 
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrder = () => {
    setIsOrdering(true)
    setTimeout(() => {
      setIsOrdering(false)
      alert("Demande de réassort transmise au grossiste ! Livraison prévue à 14h30.")
    }, 1500)
  }

  const handleDummyAction = (actionName) => {
    setActiveAction(actionName)
    setTimeout(() => {
      setActiveAction(null)
      alert(`Fonctionnalité "${actionName}" bientôt disponible dans la version bêta.`);
    }, 600)
  }

  const handleVoiceResult = (result) => {
    setSearchTerm(result);
    alert(`Recherche vocale : "${result}"`);
    setIsVoiceActive(false);
  };

  const HeaderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 12, color: GOLD, fontWeight: 800, marginBottom: 8 }}>Ventes Boutique (7j)</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>1.280.000 F</div>
          <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 8, fontWeight: 700 }}>Marge Estimeé: +14%</div>
       </Card>
       <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>KARMA SCORE</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN }}>{BOUTIQUE.karma}</div>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${VISION_GREEN}` }}>
               <Star size={24} color={VISION_GREEN} fill={VISION_GREEN} />
            </div>
          </div>
       </Card>
       <Card>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8 }}>CAPACITÉ CRÉDIT</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{BOUTIQUE.creditLimit}</div>
          <div style={{ fontSize: 11, color: GOLD, marginTop: 8, fontWeight: 700 }}>Taux préférentiel: 1.5%</div>
       </Card>
    </div>
  );

  return (
    <DashboardShell title="Cockpit Boutique Partenaire" role="boutique">
       <HeaderStats />

       <button 
        onClick={() => setIsVoiceActive(true)}
        style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000, background: VISION_GREEN, color: '#fff', border: 'none', width: 64, height: 64, borderRadius: '50%', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        className="pulse-btn"
      >
        <Mic size={30} />
      </button>

      {isVoiceActive && <LiviVoice onClose={() => setIsVoiceActive(false)} onResult={handleVoiceResult} />}

      <style>{`
        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .pulse-btn { animation: pulse 2s infinite; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1024 ? "2fr 1fr" : "1fr", gap: 32 }}>
         <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <Card style={{ padding: 32, borderRadius: 28 }}>
                <div style={{ display: "flex", flexDirection: window.innerWidth > 600 ? "row" : "column", justifyContent: "space-between", alignItems: window.innerWidth > 600 ? "center" : "flex-start", gap: 16, marginBottom: 24 }}>
                   <h3 style={{ fontSize: 20, fontWeight: 900 }}>Ravitaillement Intelligent (IA)</h3>
                   <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, width: window.innerWidth > 600 ? "auto" : "100%" }}>
                      <Search size={18} color="#94a3b8" />
                      <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Chercher un produit..." 
                        style={{ background: "none", border: "none", outline: "none", fontSize: 14, width: "100%" }} 
                      />
                   </div>
                </div>
                
                <div style={{ background: "#fffbeb", border: "1px dashed #f59e0b", padding: 20, borderRadius: 20, marginBottom: 24, display: "flex", flexDirection: window.innerWidth > 600 ? "row" : "column", alignItems: "center", gap: 20 }}>
                   <Zap color={GOLD} size={32} />
                   <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>Commande Automatisée Suggérée</div>
                      <div style={{ fontSize: 13, color: "#92400e" }}>Basé sur votre historique, nous suggérons un réapprovisionnement de 10 sacs de Riz et 5 bidons d'Huile.</div>
                   </div>
                   <button 
                    onClick={handleOrder} 
                    disabled={isOrdering}
                    style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 900, cursor: isOrdering ? "wait" : "pointer", minWidth: 140 }}
                   >
                     {isOrdering ? "Envoi..." : "Tout Commander"}
                   </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
                   {products.length > 0 ? (
                     products.map((p, idx) => (
                      <div key={idx} style={{ background: "#f8fafc", padding: 16, borderRadius: 16, textAlign: "center", border: "1px solid #f1f5f9" }}>
                         <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShoppingCart size={20} color={GOLD} />
                         </div>
                         <div style={{ fontSize: 13, fontWeight: 800 }}>{p}</div>
                         <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Dernier achat: J-2</div>
                         <button 
                            onClick={() => handleDummyAction(`Commander ${p}`)}
                            style={{ marginTop: 12, width: "100%", background: "#fff", border: "1px solid #e2e8f0", padding: "6px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                         >
                            Commander
                         </button>
                      </div>
                    ))
                   ) : (
                     <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "#64748b" }}>Aucun produit trouvé pour "{searchTerm}"</div>
                   )}
                </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr", gap: 24 }}>
               <Card style={{ borderLeft: `5px solid ${GOLD}` }}>
                  <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Opportunités LiviGroupage</h4>
                  {groupageLoading ? (
                    <div style={{ fontSize: 12 }}>Chargement...</div>
                  ) : (
                    groupageOffers.slice(0, 2).map(offer => (
                      <div key={offer.id} style={{ marginBottom: 16, padding: 12, background: "#fffbeb", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{offer.name} <span style={{ color: "#d97706" }}>-{offer.discount}</span></div>
                            <div style={{ fontSize: 10, color: "#92400e", marginTop: 4 }}>{offer.current_orders}/{offer.min_orders} réservations</div>
                         </div>
                         <button 
                            onClick={() => handleDummyAction(`Réserver Groupage ${offer.name}`)}
                            style={{ background: GOLD, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                         >
                            Réserver
                         </button>
                      </div>
                    ))
                  )}
                  <button 
                    onClick={() => handleDummyAction("LiviGroupage")}
                    style={{ width: "100%", background: "none", border: `2px solid #e2e8f0`, padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                  >
                    Voir toutes les campagnes
                  </button>
               </Card>

               <Card style={{ borderLeft: `5px solid ${VISION_GREEN}` }}>
                  <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Revenus Livi-Relais</h4>
                  <div style={{ fontSize: 24, fontWeight: 900, color: VISION_GREEN }}>+42.500 F</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>Vous servez actuellement de point de dépôt pour 12 clients du quartier.</div>
                  <button 
                    onClick={() => handleDummyAction("Livi-Relais")}
                    style={{ width: "100%", marginTop: 20, background: VISION_GREEN, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                  >
                    Historique Colis
                  </button>
               </Card>
            </div>
         </div>

         <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <Card style={{ background: `linear-gradient(135deg, ${DARK_NAVY} 0%, #1e293b 100%)`, color: "#fff", padding: 24 }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                     <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Portefeuille LiviWallet</div>
                     <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{BOUTIQUE.balance}</div>
                  </div>
                  <Wallet size={32} color={GOLD} />
               </div>
               <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 20 }}>Transactions sécurisées via infrastructure LiviPro Blockchain.</p>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button 
                    onClick={() => handleDummyAction("Approvisionner Wallet")}
                    style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: 12, borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                  >
                    Approvisionner
                  </button>
                  <button 
                    onClick={() => handleDummyAction("Payer Facture")}
                    style={{ background: GOLD, border: "none", color: DARK_NAVY, padding: 12, borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer" }}
                  >
                    Payer Facture
                  </button>
               </div>
            </Card>

            <Card style={{ padding: 24 }}>
               <h4 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20 }}>Statut Livrable</h4>
               <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: "#f8fafc", borderRadius: 16 }}>
                  <div style={{ background: VISION_GREEN, width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                     <Truck size={20} />
                  </div>
                  <div>
                     <div style={{ fontSize: 13, fontWeight: 800 }}>En route</div>
                     <div style={{ fontSize: 11, color: "#64748b" }}>Arrivée prévue: 14:30</div>
                  </div>
               </div>
               <div style={{ marginTop: 24, fontSize: 11, color: "#94a3b8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                     <span>Commandé</span>
                     <span>Expédié</span>
                     <span>Livré</span>
                  </div>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, display: "flex", gap: 4 }}>
                     <div style={{ height: "100%", flex: 1, background: VISION_GREEN }}></div>
                     <div style={{ height: "100%", flex: 1, background: VISION_GREEN }}></div>
                     <div style={{ height: "100%", flex: 1, background: "#e2e8f0" }}></div>
                  </div>
               </div>
            </Card>

            <Card style={{ textAlign: "center", padding: 24 }}>
               <BatteryCharging size={32} color="#6366f1" style={{ margin: "0 auto 12px" }} />
               <div style={{ fontSize: 13, fontWeight: 800 }}>Tontine & Capitalisation</div>
               <p style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>{BOUTIQUE.tontineStatus}</p>
               <button 
                onClick={() => handleDummyAction("Tontine details")}
                style={{ width: "100%", marginTop: 16, background: "#f1f5f9", border: "none", color: DARK_NAVY, padding: 10, borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
               >
                 Détails Cycles
               </button>
            </Card>
         </div>
      </div>
    </DashboardShell>
  );
}
