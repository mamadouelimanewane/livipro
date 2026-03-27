import { useState, useEffect } from 'react'
import LiviSearch from './LiviSearch'
import LiviDirectory from './LiviDirectory'
import LiviVoice from './LiviVoice'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers, History, ShieldCheck, Settings as SettingsIcon, Send, Receipt, Calculator, CreditCard } from 'lucide-react'
import { useGroupageOffers, useMembers, useProducts } from './useLiviData'
import DashboardShell from "./components/DashboardShell";
import { useSearchParams } from "react-router-dom";

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

export default function ClientPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("view") || "dashboard"); 
  const [isOrdering, setIsOrdering] = useState(false);
  const [salesRecord, setSalesRecord] = useState(parseInt(localStorage.getItem('livi_total_sales') || '1280000'));
  
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();
  const [catalog, setCatalog] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('livi_shared_catalog');
    if (saved) {
      setCatalog(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== activeTab) setActiveTab(v);
  }, [searchParams]);

  const handleTabChange = (newView) => {
    setActiveTab(newView);
    setSearchParams({ view: newView });
  };

  const placeOrder = (product) => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      const orders = JSON.parse(localStorage.getItem('livi_pending_orders') || '[]');
      const newOrder = { id: `ORD-${Date.now()}`, product: product.name, price: product.price, status: 'En attente', date: new Date().toLocaleDateString() };
      localStorage.setItem('livi_pending_orders', JSON.stringify([newOrder, ...orders]));
      alert(`Commande "${product.name}" envoyée au grossiste !`);
    }, 1000);
  };

  const addToPOS = (product) => {
    setCart([...cart, product]);
  };

  const finalizeSale = () => {
    const total = cart.reduce((acc, p) => acc + p.price, 0);
    const newTotal = salesRecord + total;
    setSalesRecord(newTotal);
    localStorage.setItem('livi_total_sales', newTotal.toString());
    alert(`Vente de ${total.toLocaleString()} FCFA enregistrée !\nVotre stock a été déduit et votre Wallet crédité.`);
    setCart([]);
  };

  const HeaderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Ventes Boutique (7j)</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>{salesRecord.toLocaleString()} F</div>
          <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 10 }}>↑ +{(salesRecord/12800).toFixed(1)}% Croissance</div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>KARMA LOGISTIQUE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN, marginTop: 10 }}>942 <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>/ 1000</span></div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>CAPACITÉ CRÉDIT IA</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>5.0M FCFA</div>
       </Card>
    </div>
  );

  return (
    <DashboardShell title={activeTab === 'pos' ? 'LiviPOS : Terminal de Vente' : 'Cockpit Boutique Partenaire'} role="boutique">
       <HeaderStats />

       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
          { id: "pos", label: "Caisse / Vente", icon: <Calculator size={16} /> },
          { id: "orders", label: "Ravitaillement", icon: <Package size={16} /> },
          { id: "wallet", label: "LiviWallet", icon: <Wallet size={16} /> },
          { id: "credit", label: "Crédit & Karma", icon: <ShieldCheck size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ background: activeTab === tab.id ? DARK_NAVY : "#fff", color: activeTab === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
      </div>

       <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0" }}>
          
          {activeTab === "pos" && (
            <div className="animate-fade-in">
               <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1024 ? "2fr 1fr" : "1fr", gap: 32 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Terminal LiviPOS</h2>
                    <p style={{ fontSize: 14, color: "#64748b", marginBottom: 30 }}>Sélectionnez les articles pour une vente rapide avec encaissement LiviCash.</p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                       {catalog.map(p => (
                         <div key={p.id} onClick={() => addToPOS(p)} style={{ background: "#f8fafc", padding: 16, borderRadius: 20, border: "1px solid #f1f5f9", cursor: "pointer", transition: "transform 0.1s" }} className="hover-scale">
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: VISION_GREEN, fontWeight: 900, marginTop: 4 }}>{p.price.toLocaleString()} F</div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <Card style={{ background: "#f8fafc", border: `2px solid ${DARK_NAVY}` }}>
                     <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><Receipt size={20} /> Panier Actif</h3>
                     {cart.length > 0 ? (
                       <>
                         <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 24 }}>
                            {cart.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                                 <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                                 <div style={{ fontSize: 13, fontWeight: 900 }}>{item.price.toLocaleString()} F</div>
                              </div>
                            ))}
                         </div>
                         <div style={{ padding: "20px 0", borderTop: `2px solid ${DARK_NAVY}`, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 950 }}>
                               <span>TOTAL</span>
                               <span>{cart.reduce((acc, p) => acc + p.price, 0).toLocaleString()} F</span>
                            </div>
                         </div>
                         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <button onClick={finalizeSale} style={{ width: "100%", background: VISION_GREEN, color: "#fff", border: "none", padding: 16, borderRadius: 14, fontWeight: 900, font: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                               <Wallet size={20} /> Encaisser (LiviCash)
                            </button>
                            <button onClick={finalizeSale} style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: 16, borderRadius: 14, fontWeight: 900, font: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                               <CreditCard size={20} /> LiviWallet NFC
                            </button>
                         </div>
                       </>
                     ) : (
                       <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                          <Calculator size={40} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                          <p>Votre panier de vente est vide.</p>
                       </div>
                     )}
                  </Card>
               </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-fade-in">
               <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Ravitaillement B2B</h2>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                  {catalog.map(p => (
                     <Card key={p.id} style={{ border: p.promoted ? `2px solid ${GOLD}` : '1px solid #f1f5f9', background: p.promoted ? `${GOLD}05` : '#fff' }}>
                        {p.promoted && <Badge color={GOLD} bg={`${GOLD}20`} style={{ position: "absolute", top: 12, right: 12 }}>🚀 PROMOTION</Badge>}
                        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Stock Grossiste: {p.stock}</div>
                        <div style={{ fontSize: 18, fontWeight: 950, color: DARK_NAVY, marginBottom: 20 }}>{p.price.toLocaleString()} F</div>
                        <button onClick={() => placeOrder(p)} disabled={isOrdering} style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: isOrdering ? "wait" : "pointer" }}>Commander</button>
                     </Card>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="animate-fade-in">
               <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Dernières Ventes Boutique</h3>
               <Card>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Suivi des revenus générés aux consommateurs finaux.</div>
                  {salesRecord > 1280000 ? (
                    <div style={{ background: "#ecfdf5", padding: 20, borderRadius: 20, border: `1px solid ${VISION_GREEN}` }}>
                       <div style={{ fontSize: 13, fontWeight: 800, color: "#065f46" }}>Nouvel Objectif atteint !</div>
                       <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Vous avez augmenté votre capital tontine grâce aux ventes LiviPOS.</div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 14, color: "#94a3b8" }}>En cours de chargement des flux de caisse...</p>
                  )}
               </Card>
            </div>
          )}
       </div>
    </DashboardShell>
  );
}

function LayoutDashboard(props) { return <Box {...props} />; }
function Badge({ children, color, bg, style = {} }) {
  return <span style={{ fontSize: 10, fontWeight: 900, color, background: bg, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase", ...style }}>{children}</span>
}
