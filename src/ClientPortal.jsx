import { useState, useEffect } from 'react'
import { useToast } from './components/Toast'
import LiviAcademy from './LiviAcademy'
import LiviMarket from './LiviMarket'
import LiviCommunity from './LiviCommunity'
import LiviShield from './LiviShield'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers, History, ShieldCheck, Settings as SettingsIcon, Send, Receipt, Calculator, CreditCard, GraduationCap, LayoutDashboard, BrainCircuit, Globe, ShoppingBag, MessageSquare, ShieldAlert } from 'lucide-react'
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
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("view") || "market"); // Set market as default for wow factor
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [salesRecord, setSalesRecord] = useState(parseInt(localStorage.getItem('livi_total_sales') || '1280000'));

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== activeTab) setActiveTab(v);
  }, [searchParams]);

  const handleTabChange = (newView) => {
    setActiveTab(newView);
    setSearchParams({ view: newView });
  };

  const handleOrder = (product) => {
     const orders = JSON.parse(localStorage.getItem('livi_pending_orders') || '[]');
     const newOrder = { id: `ORD-${Date.now()}`, product: product.name, price: product.price, status: 'En attente', date: new Date().toLocaleDateString() };
     localStorage.setItem('livi_pending_orders', JSON.stringify([newOrder, ...orders]));
     toast.success(`LiviMarket Certifié : Commande de ${product.name} envoyée au hub ${product.host}.`);
     handleTabChange('dashboard');
  };

  const finalizeSale = () => {
    toast.success(`Vente de proximité enregistrée !`);
  };

  return (
    <DashboardShell title={activeTab === 'market' ? 'LiviMarket™ : Marketplace B2B' : 'Cockpit Boutique Partenaire'} role="boutique">
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
          <Card style={{ background: DARK_NAVY, color: "#fff" }}>
             <div style={{ fontSize: 11, color: GOLD, fontWeight: 800 }}>Ventes (7j)</div>
             <div style={{ fontSize: 32, fontWeight: 900 }}>{salesRecord.toLocaleString()} F</div>
          </Card>
          <Card>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>KARMA LOGISTIQUE</div>
             <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN }}>942 <span style={{ fontSize: 14, color: "#94a3b8" }}>/ 1000</span></div>
          </Card>
          <Card>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>CAPACITÉ CRÉDIT IA</div>
             <div style={{ fontSize: 32, fontWeight: 900 }}>5.0M FCFA</div>
          </Card>
       </div>

       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "community", label: "LiviCommunity™", icon: <MessageSquare size={16} /> },
          { id: "market", label: "Marketplace B2B", icon: <ShoppingBag size={16} /> },
          { id: "shield", label: "E-Garantie LiviShield™", icon: <ShieldCheck size={16} /> },
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
          { id: "pos", label: "LiviPOS (Caisse)", icon: <Calculator size={16} /> },
          { id: "predict", label: "IA Inventaire", icon: <BrainCircuit size={16} /> },
          { id: "wallet", label: "Fintech InterOp", icon: <Globe size={16} /> },
          { id: "academy", label: "Academy", icon: <GraduationCap size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ background: activeTab === tab.id ? DARK_NAVY : "#fff", color: activeTab === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
        <button onClick={() => setIsVoiceActive(!isVoiceActive)} style={{ background: isVoiceActive ? GOLD : "#fff", color: DARK_NAVY, border: isVoiceActive ? "none" : "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
           <Mic size={16} /> {isVoiceActive ? "Fermer Voix" : "LiviVoice"}
        </button>
      </div>

       {isVoiceActive && <div style={{ marginBottom: 32 }}><LiviVoice onCommand={({ action, entity }) => { if (action === 'COMMANDE') handleTabChange('market'); }} /></div>}

       <div style={{ background: "#fff", borderRadius: 32, padding: 40, border: "1px solid #f1f5f9", boxShadow: "0 20px 60px rgba(0,0,0,0.02)" }}>
          {activeTab === "community" && <LiviCommunity />}
          {activeTab === "shield" && <LiviShield />}
          {activeTab === "market" && <LiviMarket onOrder={handleOrder} />}
          {activeTab === "dashboard" && (
            <div className="animate-fade-in">
               <h3 style={{ fontSize: 22, fontWeight: 950, marginBottom: 24 }}>Suivi des Flux Commandés</h3>
               <Card style={{ padding: 0, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                     <thead style={{ background: "#f8fafc" }}>
                        <tr style={{ textAlign: "left" }}>
                           <th style={{ padding: "16px", fontSize: 12, color: "#64748b" }}>ID ORDRE</th>
                           <th style={{ padding: "16px", fontSize: 12, color: "#64748b" }}>PRODUIT</th>
                           <th style={{ padding: "16px", fontSize: 12, color: "#64748b" }}>STATUT</th>
                        </tr>
                     </thead>
                     <tbody>
                        {JSON.parse(localStorage.getItem('livi_pending_orders') || '[]').map((o, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                             <td style={{ padding: "16px", fontSize: 13, fontWeight: 900 }}>{o.id}</td>
                             <td style={{ padding: "16px", fontSize: 14 }}>{o.product}</td>
                             <td style={{ padding: "16px" }}>
                                <span style={{ fontSize: 11, fontWeight: 900, background: o.status === "Livré" ? "#ecfdf5" : "#fffbeb", color: o.status === "Livré" ? VISION_GREEN : GOLD, padding: "4px 10px", borderRadius: 8 }}>{o.status.toUpperCase()}</span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </Card>
            </div>
          )}
          {activeTab === "pos" && (
             <div style={{ textAlign: "center", padding: 60 }}>
                <Calculator size={48} style={{ opacity: 0.2, margin: "0 auto 20px" }} />
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Terminal de Vente Local</h3>
                <p style={{ fontSize: 14, color: "#64748b", marginTop: 10 }}>Module de caisse prêt pour les ventes au détail.</p>
                <button onClick={finalizeSale} style={{ marginTop: 20, background: DARK_NAVY, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 800 }}>Démarrer Vente</button>
             </div>
          )}
          {activeTab === "predict" && <LiviPredict />}
          {activeTab === "wallet" && <LiviFintech />}
          {activeTab === "academy" && <LiviAcademy />}
       </div>
    </DashboardShell>
  );
}
