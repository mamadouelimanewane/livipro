import { useState, useEffect } from 'react'
import LiviSearch from './LiviSearch'
import LiviDirectory from './LiviDirectory'
import LiviVoice from './LiviVoice'
import LiviPredict from './LiviPredict'
import LiviFintech from './LiviFintech'
import LiviAcademy from './LiviAcademy'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers, History, ShieldCheck, Settings as SettingsIcon, Send, Receipt, Calculator, CreditCard, GraduationCap, LayoutDashboard, BrainCircuit, Globe } from 'lucide-react'
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
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
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

  const handleCommand = (cmd) => {
     if (cmd.action === 'COMMANDE') {
       handleTabChange('orders');
       alert(`Commande par commande vocale détectée: ${cmd.entity}`);
     } else if (cmd.action === 'FINANCES') {
       handleTabChange('wallet');
     }
  };

  const finalizeSale = () => {
    const total = cart.reduce((acc, p) => acc + p.price, 0);
    const newTotal = salesRecord + total;
    setSalesRecord(newTotal);
    localStorage.setItem('livi_total_sales', newTotal.toString());
    alert(`Vente enregistrée !`);
    setCart([]);
  };

  const HeaderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Ventes Boutique</div>
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
  );

  return (
    <DashboardShell title="Cockpit Boutique Partenaire" role="boutique">
       <HeaderStats />

       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
          { id: "pos", label: "LiviPOS (Caisse)", icon: <Calculator size={16} /> },
          { id: "predict", label: "LiviPredict (IA)", icon: <BrainCircuit size={16} /> },
          { id: "orders", label: "Ravitaillement", icon: <ShoppingCart size={16} /> },
          { id: "wallet", label: "Fintech & InterOp", icon: <Globe size={16} /> },
          { id: "academy", label: "Academy", icon: <GraduationCap size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ background: activeTab === tab.id ? DARK_NAVY : "#fff", color: activeTab === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
        <button onClick={() => setIsVoiceActive(!isVoiceActive)} style={{ background: isVoiceActive ? GOLD : "#fff", color: DARK_NAVY, border: isVoiceActive ? "none" : "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
           <Mic size={16} /> {isVoiceActive ? "Fermer Voix" : "LiviVoice"}
        </button>
      </div>

       {isVoiceActive && (
         <div style={{ marginBottom: 32 }}>
            <LiviVoice onCommand={handleCommand} />
         </div>
       )}

       <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.02)" }}>
          {activeTab === "dashboard" && (
            <div className="animate-fade-in">
               <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Suivi des Flux</h3>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <Card style={{ background: "#f8fafc" }}>
                     <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>STOCKS CRITIQUES</div>
                     <div style={{ fontSize: 24, fontWeight: 950, color: "#ef4444", marginTop: 8 }}>3 Produits</div>
                     <button onClick={() => handleTabChange('predict')} style={{ marginTop: 20, background: DARK_NAVY, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Interroger l'IA</button>
                  </Card>
                  <Card style={{ background: "#f8fafc" }}>
                     <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>TONTINE RAMADAN</div>
                     <div style={{ fontSize: 24, fontWeight: 950, color: VISION_GREEN, marginTop: 8 }}>Virements OK</div>
                     <button style={{ marginTop: 20, background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Gérer Finances</button>
                  </Card>
               </div>
            </div>
          )}

          {activeTab === "pos" && (
            <div className="animate-fade-in">
               <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1024 ? "2fr 1fr" : "1fr", gap: 32 }}>
                   <div>
                      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Terminal de Vente LiviPOS</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                         {catalog.map(p => (
                            <div key={p.id} onClick={() => setCart([...cart, p])} style={{ background: "#f8fafc", padding: 16, borderRadius: 20, border: "1px solid #f1f5f9", cursor: "pointer" }}>
                               <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                               <div style={{ fontSize: 12, color: VISION_GREEN, fontWeight: 900, marginTop: 4 }}>{p.price.toLocaleString()} F</div>
                            </div>
                         ))}
                      </div>
                   </div>
                   <Card style={{ background: "#f8fafc", border: `2px solid ${DARK_NAVY}` }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>Panier de Vente</h3>
                      {cart.map((it, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700 }}><span>{it.name}</span><span>{it.price} F</span></div>))}
                      <div style={{ fontSize: 22, fontWeight: 950, margin: "24px 0", display: "flex", justifyContent: "space-between" }}><span>TOTAL</span><span>{cart.reduce((a,b)=>a+b.price,0).toLocaleString()} F</span></div>
                      <button onClick={finalizeSale} style={{ width: "100%", background: VISION_GREEN, color: "#fff", border: "none", padding: 16, borderRadius: 14, fontWeight: 950, cursor: "pointer" }}>Encaisser LiviCash</button>
                   </Card>
               </div>
            </div>
          )}

          {activeTab === "predict" && <LiviPredict />}
          {activeTab === "wallet" && <LiviFintech />}
          {activeTab === "academy" && <LiviAcademy />}

          {activeTab === "orders" && (
            <div className="animate-fade-in">
               <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Ravitaillement Direct</h3>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                  {catalog.map(p => (
                    <Card key={p.id} style={{ border: p.promoted ? `2px solid ${GOLD}` : "1px solid #f1f5f9" }}>
                       <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{p.name}</div>
                       <div style={{ fontSize: 18, fontWeight: 950, color: DARK_NAVY, marginBottom: 16 }}>{p.price.toLocaleString()} F</div>
                       <button style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Commander</button>
                    </Card>
                  ))}
               </div>
            </div>
          )}
       </div>
    </DashboardShell>
  );
}
