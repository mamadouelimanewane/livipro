import { useState, useEffect } from 'react'
import LiviSearch from './LiviSearch'
import LiviDirectory from './LiviDirectory'
import LiviVoice from './LiviVoice'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers, History, ShieldCheck, Settings as SettingsIcon } from 'lucide-react'
import { useGroupageOffers, useMembers, useProducts } from './useLiviData'
import DashboardShell from "./components/DashboardShell";
import { useSearchParams } from "react-router-dom";

// Simulation des données client (Boutiquier) - À terme via useAuth
const BOUTIQUE = {
  name: "Supermarché Al-Amine",
  balance: "2.450.000 FCFA",
  creditLimit: "5.000.000 FCFA",
  karma: 942,
  tontineStatus: "Actif (Prélèvements Automatisés)",
  lastOrder: "ORD-9824 (Validé)",
  totalSpend: "14.2M FCFA"
}

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

export default function ClientPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("view") || "dashboard"); 
  const [isOrdering, setIsOrdering] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeAction, setActiveAction] = useState(null)
  
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();
  const { data: productsData, loading: productsLoading } = useProducts();

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== activeTab) {
      setActiveTab(v);
    }
  }, [searchParams]);

  const handleTabChange = (newView) => {
    setActiveTab(newView);
    setSearchParams({ view: newView });
  };

  const handleOrder = (product) => {
    setIsOrdering(true)
    setTimeout(() => {
      setIsOrdering(false)
      alert(`Commande pour "${product}" transmise au grossiste ! Livraison prévue sous 2h.`)
    }, 1500)
  }

  const handleDummyAction = (actionName) => {
    setActiveAction(actionName)
    setTimeout(() => {
      setActiveAction(null)
      alert(`Action "${actionName}" : Opération enregistrée dans votre Ledger LiviPro.`);
    }, 1000)
  }

  const handleVoiceResult = (result) => {
    setSearchTerm(result);
    setIsVoiceActive(false);
  };

  const HeaderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 12, color: GOLD, fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Chiffre d'Affaire (7j)</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>1.280.000 F</div>
          <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 8, fontWeight: 700 }}>↑ +14.2% vs semaine préc.</div>
       </Card>
       <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Karma Logistique</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN }}>{BOUTIQUE.karma} <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>/ 1000</span></div>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${VISION_GREEN}` }}>
               <Star size={24} color={VISION_GREEN} fill={VISION_GREEN} />
            </div>
          </div>
       </Card>
       <Card>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Capacité Crédit IA</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{BOUTIQUE.creditLimit}</div>
          <div style={{ fontSize: 11, color: GOLD, marginTop: 8, fontWeight: 700 }}>Taux Associé: 0.8% / mois</div>
       </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-fade-in">
       <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1024 ? "2fr 1fr" : "1fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
             <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                   <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900 }}>Ravitaillement Rapide</h3>
                      <p style={{ fontSize: 13, color: "#64748b" }}>Commandez vos essentiels en un clic avec livraison garantie.</p>
                   </div>
                   <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, width: 200 }}>
                      <Search size={16} color="#94a3b8" />
                      <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Chercher..." 
                        style={{ background: "none", border: "none", outline: "none", fontSize: 12, width: "100%" }} 
                      />
                   </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                   {productsLoading ? (
                     <div style={{ padding: 40, textAlign: "center" }}>Chargement catalogue...</div>
                   ) : productsData.slice(0, 4).map((p, idx) => (
                      <div key={p.id} style={{ background: "#f8fafc", padding: 16, borderRadius: 16, textAlign: "center", border: "1px solid #f1f5f9" }}>
                         <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} /> : <Box size={20} color={GOLD} />}
                         </div>
                         <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
                         <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{p.price.toLocaleString()} F / unité</div>
                         <button 
                            disabled={isOrdering}
                            onClick={() => handleOrder(p.name)}
                            style={{ marginTop: 12, width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: isOrdering ? "wait" : "pointer" }}
                         >
                            Commander
                         </button>
                      </div>
                   ))}
                </div>
                <button 
                  onClick={() => handleTabChange("orders")}
                  style={{ width: "100%", marginTop: 20, background: "none", border: "none", color: DARK_NAVY, fontSize: 13, fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}
                >
                  Voir tout le catalogue grossiste
                </button>
             </Card>

             <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr", gap: 24 }}>
                <Card style={{ borderLeft: `5px solid ${GOLD}` }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <Layers size={18} color={GOLD} />
                      <h4 style={{ fontSize: 16, fontWeight: 900 }}>Opportunités LiviGroupage</h4>
                   </div>
                   {groupageLoading ? (
                     <div style={{ fontSize: 12 }}>Chargement...</div>
                   ) : (
                     groupageOffers.slice(0, 2).map(offer => (
                       <div key={offer.id} style={{ marginBottom: 16, padding: 12, background: "#fffbeb", borderRadius: 14, border: "1px solid #fde68a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                               <div style={{ fontSize: 13, fontWeight: 800 }}>{offer.name}</div>
                               <div style={{ fontSize: 10, color: "#92400e", marginTop: 4 }}>Réduction: <span style={{ fontWeight: 800 }}>-{offer.discount}</span></div>
                            </div>
                            <button 
                               onClick={() => handleDummyAction(`Réserver Groupage ${offer.name}`)}
                               style={{ background: GOLD, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                            >
                               Participer
                            </button>
                          </div>
                          <div style={{ marginTop: 10 }}>
                             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
                                <span>Progression</span>
                                <span>{offer.current_orders}/{offer.min_orders}</span>
                             </div>
                             <div style={{ height: 4, background: "#fef3c7", borderRadius: 2, border: "1px solid #fde68a" }}>
                                <div style={{ height: "100%", width: `${(offer.current_orders/offer.min_orders)*100}%`, background: GOLD, borderRadius: 2 }}></div>
                             </div>
                          </div>
                       </div>
                     ))
                   )}
                </Card>

                <Card style={{ borderLeft: `5px solid ${VISION_GREEN}` }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <Zap size={18} color={VISION_GREEN} />
                      <h4 style={{ fontSize: 16, fontWeight: 900 }}>Revenus Livi-Relais</h4>
                   </div>
                   <div style={{ background: "#ecfdf5", padding: 16, borderRadius: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: VISION_GREEN }}>+42.500 F <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>(Ce mois)</span></div>
                      <p style={{ fontSize: 11, color: "#065f46", marginTop: 4, lineHeight: 1.4, fontWeight: 600 }}>12 colis en attente de collecte par vos clients.</p>
                   </div>
                   <button 
                     onClick={() => handleDummyAction("Gérer Livi-Relais")}
                     style={{ width: "100%", background: VISION_GREEN, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                   >
                     Gérer les Retraits
                   </button>
                </Card>
             </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
             <Card style={{ background: `linear-gradient(135deg, ${DARK_NAVY} 0%, #1e293b 100%)`, color: "#fff", padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                   <div>
                      <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Solde LiviWallet</div>
                      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{BOUTIQUE.balance}</div>
                   </div>
                   <Wallet size={32} color={GOLD} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                   <button 
                     onClick={() => handleTabChange("wallet")}
                     style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: 12, borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                   >
                     Consulter
                   </button>
                   <button 
                     onClick={() => handleDummyAction("Payer Grossiste")}
                     style={{ background: GOLD, border: "none", color: DARK_NAVY, padding: 12, borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer" }}
                   >
                     Règlement
                   </button>
                </div>
             </Card>

             <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                   <Truck size={18} color={DARK_NAVY} />
                   <h4 style={{ fontSize: 15, fontWeight: 900 }}>Dernière Livraison</h4>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                   <div style={{ background: VISION_GREEN, width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <CheckCircle2 size={24} />
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>Manifeste {BOUTIQUE.lastOrder}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Livré par : Ousmane D. (10:15)</div>
                   </div>
                </div>
                <button 
                  onClick={() => handleDummyAction("Historique BL")}
                  style={{ width: "100%", marginTop: 16, border: "1px solid #e2e8f0", background: "#fff", color: DARK_NAVY, padding: 10, borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  Télécharger le Bon de Livraison
                </button>
             </Card>

             <Card style={{ textAlign: "center", background: "#f0f7ff", border: "1px solid #bfdbfe" }}>
                <div style={{ background: "#fff", width: 50, height: 50, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                  <BatteryCharging size={26} color="#2563eb" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a" }}>Tontine & Épargne</div>
                <p style={{ fontSize: 11, color: "#1e40af", marginTop: 8, opacity: 0.8 }}>Relève : <span style={{ fontWeight: 800 }}>Dans 3 jours</span>. Soyez prêt pour votre cycle d'approvisionnement.</p>
             </Card>
          </div>
       </div>
    </div>
  );

  const renderWallet = () => (
    <div className="animate-fade-in">
       <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900 }}>LiviWallet B2B</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>Gérez vos flux financiers, règlements fournisseurs et dépôts LiviCash.</p>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
          <Card style={{ background: DARK_NAVY, color: "#fff", padding: 32 }}>
             <div style={{ fontSize: 12, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>SOLDE DISPONIBLE</div>
             <div style={{ fontSize: 42, fontWeight: 900, marginTop: 12 }}>{BOUTIQUE.balance}</div>
             <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <button onClick={() => handleDummyAction("Charger Wallet")} style={{ flex: 1, background: GOLD, color: DARK_NAVY, border: "none", padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: "pointer" }}>Dépôt</button>
                <button onClick={() => handleDummyAction("Transférer")} style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Transférer</button>
             </div>
          </Card>
          <Card>
             <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Dernières Transactions</h4>
             {[
               { name: "Grossiste DLH", type: "Paiement Facture", amount: "-450.000 F", date: "Aujourd'hui", color: "#ef4444" },
               { name: "LiviCash Dépôt", type: "Vente Boutique", amount: "+85.000 F", date: "Hier", color: VISION_GREEN },
               { name: "Tontine LiviPro", type: "Cotisation", amount: "-25.000 F", date: "24 Mars", color: "#6366f1" }
             ].map((tx, i) => (
               <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{tx.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{tx.type} • {tx.date}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: tx.color }}>{tx.amount}</div>
               </div>
             ))}
          </Card>
       </div>
    </div>
  );

  const renderOrders = () => (
    <div className="animate-fade-in">
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>Historique & Ravitaillement</h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>Suivi de vos commandes et accès au catalogue grossiste complet.</p>
          </div>
          <button onClick={() => handleDummyAction("Nouvel Inventaire")} style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}>Faire un Inventaire</button>
       </div>

       <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
                <tr style={{ borderBottom: "2px solid #f8fafc", textAlign: "left" }}>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>ID COMMANDE</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>DATE</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>ARTICLE PRINCIPAL</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>STATUT</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800, textAlign: "right" }}>MONTANT</th>
                </tr>
             </thead>
             <tbody>
                {[
                  { id: "ORD-9824", date: "27/03/2026", product: "Riz Parfumé (x10)", status: "Livré", statusColor: VISION_GREEN, amount: "215.000 F" },
                  { id: "ORD-9820", date: "25/03/2026", product: "Huile Dinor (x5)", status: "Validé", statusColor: GOLD, amount: "192.500 F" },
                  { id: "ORD-9781", date: "20/03/2026", product: "Savon Diama (x20)", status: "Clôturé", statusColor: "#94a3b8", amount: "42.000 F" }
                ].map((order, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                     <td style={{ padding: "16px", fontSize: 13, fontWeight: 800 }}>{order.id}</td>
                     <td style={{ padding: "16px", fontSize: 13, color: "#64748b" }}>{order.date}</td>
                     <td style={{ padding: "16px", fontSize: 13, fontWeight: 700 }}>{order.product}</td>
                     <td style={{ padding: "16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: order.statusColor, background: `${order.statusColor}15`, padding: "4px 10px", borderRadius: 10, textTransform: "uppercase" }}>{order.status}</span>
                     </td>
                     <td style={{ padding: "16px", fontSize: 14, fontWeight: 900, textAlign: "right" }}>{order.amount}</td>
                  </tr>
                ))}
             </tbody>
          </table>
       </Card>
    </div>
  );

  const renderCredit = () => (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
       <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900 }}>Score de Crédit & Karma</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>Analyse IA de votre fiabilité financière et logistique.</p>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
          <Card style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff" }}>
             <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.9 }}>SCORE KARMA ACTUALISÉ</div>
             <div style={{ fontSize: 64, fontWeight: 900, margin: "16px 0" }}>942</div>
             <div style={{ display: "flex", gap: 20 }}>
                <div><div style={{ fontSize: 10, opacity: 0.7 }}>RANK</div><div style={{ fontWeight: 800 }}>PLATINUM</div></div>
                <div><div style={{ fontSize: 10, opacity: 0.7 }}>FIABILITÉ</div><div style={{ fontWeight: 800 }}>98.4%</div></div>
             </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
             <Card>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>LIMITÉ DE CRÉDIT IA</div>
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>5.000.000 F</div>
                <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 10, fontWeight: 700 }}>Eligible : Prêt immédiat</div>
             </Card>
             <button onClick={() => handleDummyAction("Demande de Crédit")} style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: 16, borderRadius: 16, fontWeight: 900, cursor: "pointer" }}>Demander un Crédit IA</button>
          </div>
       </div>
    </div>
  );

  return (
    <DashboardShell title={activeTab === 'dashboard' ? 'Cockpit Boutique Partenaire' : activeTab === 'wallet' ? 'LiviWallet B2B' : activeTab === 'orders' ? 'Ravitaillement & Catalogue' : activeTab === 'credit' ? 'Santé Financière' : 'Paramètres'} role="boutique">
       
       <HeaderStats />

       <div style={{ marginTop: 24 }}>
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "wallet" && renderWallet()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "credit" && renderCredit()}
          {activeTab === "settings" && (
            <div className="animate-fade-in">
               <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Paramètres Shop</h2>
               <Card style={{ maxWidth: 600 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                     <div><label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>NOM DE LA BOUTIQUE</label><input defaultValue={BOUTIQUE.name} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginTop: 6 }} /></div>
                     <div><label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>MODALITÉ PAIEMENT PRÉFÉRÉE</label><select style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginTop: 6 }}><option>LiviWallet (Défaut)</option><option>Virement Bancaire</option><option>Espèces (LiviCash)</option></select></div>
                     <button onClick={() => handleDummyAction("Sauvegarder Paramètres")} style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: 14, borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>Enregistrer les modifications</button>
                  </div>
               </Card>
            </div>
          )}
       </div>

       <button 
        onClick={() => setIsVoiceActive(true)}
        style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 1000, background: VISION_GREEN, color: '#fff', border: 'none', width: 64, height: 64, borderRadius: '50%', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        className="pulse-btn"
      >
        <Mic size={30} />
      </button>

      {isVoiceActive && <LiviVoice onClose={() => setIsVoiceActive(false)} onResult={handleVoiceResult} />}
    </DashboardShell>
  );
}
