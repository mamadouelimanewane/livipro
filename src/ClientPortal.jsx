import { useState, useEffect } from 'react'
import LiviSearch from './LiviSearch'
import LiviDirectory from './LiviDirectory'
import LiviVoice from './LiviVoice'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers, History, ShieldCheck, Settings as SettingsIcon, Send } from 'lucide-react'
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
  
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();
  const [catalog, setCatalog] = useState([]);

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
      alert(`Commande "${product.name}" envoyée au grossiste ! Suivez la livraison en temps réel.`);
    }, 1200);
  };

  const HeaderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Chiffre d'Affaire (7j)</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>1.280.000 F</div>
       </Card>
       <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>KARMA LOGISTIQUE</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN, marginTop: 10 }}>942 <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>/ 1000</span></div>
            </div>
          </div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Capacité Crédit IA</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>5.000.000 F</div>
       </Card>
    </div>
  );

  return (
    <DashboardShell title="Cockpit Boutique Partenaire" role="boutique">
       <HeaderStats />

       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
          { id: "orders", label: "Ravitaillement", icon: <Package size={16} /> },
          { id: "wallet", label: "LiviWallet", icon: <Wallet size={16} /> },
          { id: "credit", label: "Crédit & Karma", icon: <ShieldCheck size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ background: activeTab === tab.id ? DARK_NAVY : "#fff", color: activeTab === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
      </div>

       <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0" }}>
          {activeTab === "orders" && (
            <div className="animate-fade-in">
               <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Catalogue Grossiste (Temps Réel)</h2>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                  {catalog.map(p => (
                     <Card key={p.id} style={{ border: p.promoted ? `2px solid ${GOLD}` : '1px solid #f1f5f9', background: p.promoted ? `${GOLD}05` : '#fff' }}>
                        {p.promoted && <Badge color={GOLD} bg={`${GOLD}20`} style={{ position: "absolute", top: 12, right: 12 }}>🚀 NOUVEAU</Badge>}
                        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>{p.category} · Stock: {p.stock}</div>
                        <div style={{ fontSize: 18, fontWeight: 950, color: DARK_NAVY, marginBottom: 20 }}>{p.price.toLocaleString()} F</div>
                        <button 
                           onClick={() => placeOrder(p)}
                           disabled={isOrdering}
                           style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: isOrdering ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        >
                           <ShoppingCart size={18} /> Commander
                        </button>
                     </Card>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="animate-fade-in">
               <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Suivi de vos commandes</h3>
               <Card>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                     <thead>
                        <tr style={{ borderBottom: "1px solid #f8fafc", textAlign: "left" }}>
                           <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>ID</th>
                           <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>PRODUIT</th>
                           <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>STATUT</th>
                        </tr>
                     </thead>
                     <tbody>
                        {JSON.parse(localStorage.getItem('livi_pending_orders') || '[]').map((o, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                             <td style={{ padding: "16px", fontSize: 13, fontWeight: 800 }}>{o.id}</td>
                             <td style={{ padding: "16px", fontSize: 13 }}>{o.product}</td>
                             <td style={{ padding: "16px" }}>
                                <Badge color={o.status === "Livré" ? VISION_GREEN : GOLD}>{o.status}</Badge>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </Card>
            </div>
          )}
          {/* Other views same as before... */}
       </div>
    </DashboardShell>
  );
}

function LayoutDashboard(props) { return <Box {...props} />; }
function Badge({ children, color, bg, style = {} }) {
  return <span style={{ fontSize: 10, fontWeight: 900, color, background: bg, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase", ...style }}>{children}</span>
}
