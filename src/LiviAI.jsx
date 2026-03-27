import { useState, useEffect } from "react";
import { Sparkles, MessageCircle, X, Send, Bot, TrendingUp, AlertCircle } from "lucide-react";

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const INSIGHTS = [
  "🚀 Optimisation : La demande de Riz Parfumé augmente de 15% à Marché Fass (Zone A). Proposez un déstockage anticipé.",
  "⚠️ Risque : Le score Karma de la Boutique Serigne Saliou est en baisse (-5 pts). Vérifiez la ponctualité des livraisons.",
  "💡 Opportunité : Groupage possible sur l'Huile Dinor. 3 boutiques voisines ont ce produit dans leur panier.",
  "📈 Revenus : Vos revenus LiviAds ont progressé de 22% ce mois-ci grâce aux campagnes de promo flash."
];

export default function LiviAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInsight(prev => (prev + 1) % INSIGHTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "fixed", bottom: 90, right: 20, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      
      {isOpen ? (
        <div className="animate-slide-up" style={{ width: 320, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.15)", overflow: "hidden" }}>
          <div style={{ background: DARK_NAVY, padding: "16px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={20} color={GOLD} />
              <div style={{ fontSize: 14, fontWeight: 900 }}>Livi Assistant IA</div>
            </div>
            <X size={18} onClick={() => setIsOpen(false)} style={{ cursor: "pointer", opacity: 0.7 }} />
          </div>
          
          <div style={{ padding: 20, maxHeight: 400, overflowY: "auto" }}>
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, marginBottom: 16 }}>
               <div style={{ fontSize: 10, fontWeight: 900, color: GOLD, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={12} /> INSIGHT B2B EN DIRECT
               </div>
               <div style={{ fontSize: 13, color: DARK_NAVY, fontWeight: 700, lineHeight: 1.4 }}>
                  {INSIGHTS[activeInsight]}
               </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
               <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px dashed #10b981", padding: 10, borderRadius: 12, display: "flex", gap: 8 }}>
                  <TrendingUp size={16} color={VISION_GREEN} />
                  <div style={{ fontSize: 11, color: "#065f46", fontWeight: 700 }}>ROI Flotte : +2.4% aujourd'hui.</div>
               </div>
               <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px dashed #ef4444", padding: 10, borderRadius: 12, display: "flex", gap: 8 }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700 }}>2 litiges en attente d'audit (Livreur OD).</div>
               </div>
            </div>
            
            <div style={{ marginTop: 24, padding: "12px 16px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
               <input placeholder="Posez une question à l'IA..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 12 }} />
               <Send size={16} color={DARK_NAVY} />
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsOpen(true)}
          style={{ width: 56, height: 56, background: DARK_NAVY, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", border: `2px solid ${GOLD}` }}>
          <Bot size={28} color={GOLD} />
          <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }}></div>
        </div>
      )}
      
      <style>{`
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
