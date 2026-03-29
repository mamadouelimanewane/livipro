import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Zap, Calendar, Package, RefreshCw, BarChart3, Clock, LayoutDashboard } from 'lucide-react';
import { useProducts } from './useLiviData';

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

export default function LiviPredict() {
  const { data: products, loading: productsLoading } = useProducts();
  const [activeSeason, setActiveSeason] = useState("ramadan");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulation de calcul prédictif basé sur le stock réel
  const getDyanmicPredictions = () => {
    if (!products || products.length === 0) return [];
    
    return products.slice(0, 3).map(p => {
      const isCritical = p.stock < 100;
      return {
        id: p.id,
        name: p.name,
        current: p.stock,
        predicted: p.stock + (activeSeason === 'ramadan' ? 150 : 80),
        confidence: isCritical ? 99 : 88,
        status: isCritical ? "Rupture Imminente" : "Flux Stable"
      };
    });
  };

  const currentPredictions = getDyanmicPredictions();

  return (
    <div className="animate-fade-in">
       <div style={{ background: `linear-gradient(135deg, ${DARK_NAVY} 0%, #1e293b 100%)`, borderRadius: 28, padding: 32, color: "#fff", marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.1 }}><LayoutDashboard size={180} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={24} color={GOLD} />
                <h2 style={{ fontSize: 22, fontWeight: 900 }}>LiviPredict™ IA</h2>
             </div>
             <button onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 2000); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} /> {isRefreshing ? "Analyse Flux..." : "Rafraîchir"}
             </button>
          </div>
          <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.6, maxWidth: 500 }}>
            {productsLoading ? "Analyse du catalogue en cours..." : "Analyse IA terminée. Votre stock de Riz et Huile nécessite une attention immédiate pour le Ramadan."}
          </p>
       </div>

       <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <button onClick={() => setActiveSeason("ramadan")} style={{ flex: 1, background: activeSeason === "ramadan" ? GOLD : "#fff", color: activeSeason === "ramadan" ? DARK_NAVY : "#64748b", border: "1px solid #e2e8f0", padding: "16px", borderRadius: 16, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Calendar size={18} /> RAMADAN 2026</button>
          <button onClick={() => setActiveSeason("tabaski")} style={{ flex: 1, background: activeSeason === "tabaski" ? GOLD : "#fff", color: activeSeason === "tabaski" ? DARK_NAVY : "#64748b", border: "1px solid #e2e8f0", padding: "16px", borderRadius: 16, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Calendar size={18} /> TABASKI 2026</button>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          {currentPredictions.map(item => (
            <Card key={item.id} style={{ borderLeft: `6px solid ${item.current === 0 ? "#ef4444" : GOLD}` }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                     <div style={{ fontSize: 15, fontWeight: 900 }}>{item.name}</div>
                     <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={12} color={VISION_GREEN} /> Confiance IA: {item.confidence}%</div>
                  </div>
                  <div style={{ background: item.current === 0 ? "#fef2f2" : "#fffbeb", padding: "8px 12px", borderRadius: 12, color: item.current === 0 ? "#ef4444" : GOLD, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>{item.status}</div>
               </div>

               <div style={{ background: "#f8fafc", padding: 16, borderRadius: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                     <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800 }}>STOCK ACTUEL</div>
                     <div style={{ fontSize: 20, fontWeight: 950, color: item.current < 10 ? "#ef4444" : DARK_NAVY }}>{item.current}</div>
                  </div>
                  <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
                     <div style={{ fontSize: 9, color: VISION_GREEN, fontWeight: 800 }}>PRÉVISION {activeSeason.toUpperCase()}</div>
                     <div style={{ fontSize: 20, fontWeight: 950, color: GOLD }}>{item.predicted}</div>
                  </div>
               </div>

               <div style={{ display: "flex", gap: 12 }}>
                  <button style={{ flex: 1, background: "#f1f5f9", border: "none", padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#64748b" }}>Historique Flux</button>
                  <button style={{ flex: 1, background: DARK_NAVY, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                     <Zap size={14} color={GOLD} /> Commande Auto
                  </button>
               </div>
            </Card>
          ))}
       </div>
    </div>
  );
}
