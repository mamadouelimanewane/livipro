import { useState } from "react";
import { 
  Search, 
  ArrowRight, 
  MapPin, 
  Truck, 
  TrendingUp, 
  Filter, 
  ChevronRight, 
  Star,
  Zap,
  Mic,
  Volume2,
  Clock
} from "lucide-react";
import LiviVoice from "./LiviVoice";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviSearch() {
  const [query, setQuery] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [results] = useState([
    { 
      product: "Riz Parfumé (Sac 50kg)", 
      category: "Céréales",
      comparisons: [
        { wholesaler: "Grossiste Al-Amine", price: 21500, delivery: "2h", rating: 4.8, best: false },
        { wholesaler: "Ets Saliou & Frères", price: 20900, delivery: "5h", rating: 4.5, best: true },
        { wholesaler: "Diagne Distribution", price: 22000, delivery: "1h", rating: 4.9, best: false }
      ]
    },
    { 
      product: "Huile Dinor 5L", 
      category: "Alimentaire",
      comparisons: [
        { wholesaler: "Diagne Distribution", price: 38500, delivery: "1h", rating: 4.9, best: true },
        { wholesaler: "Grossiste Al-Amine", price: 39000, delivery: "3h", rating: 4.8, best: false }
      ]
    }
  ]);

  const filteredResults = query.length > 2 
    ? results.filter(r => r.product.toLowerCase().includes(query.toLowerCase())) 
    : [];

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* SEARCH HEADER */}
       <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>LiviSearch AI</h2>
          <div style={{ position: "relative" }}>
             <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <Search size={20} />
             </div>
             <input 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Chercher Riz, Huile, Lait..." 
               style={{ width: "100%", height: 60, padding: "0 64px 0 54px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, fontSize: 16, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,0.03)", outline: "none", color: DARK_NAVY }} 
             />
             <div onClick={() => setIsVoiceActive(true)} style={{ position: "absolute", right: 64, top: "50%", transform: "translateY(-50%)", color: GOLD, cursor: "pointer", background: "rgba(245, 158, 11, 0.1)", padding: 6, borderRadius: 10 }}>
                <Mic size={22} />
             </div>
             <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: DARK_NAVY, padding: 8, borderRadius: 12, cursor: "pointer" }}>
                <Filter size={18} color={GOLD} />
             </div>
          </div>
       </div>

       {query.length <= 2 && (
         <div className="animate-fade-in">
            <div style={{ fontSize: 13, fontWeight: 800, color: "#94a3b8", marginBottom: 16 }}>RECHERCHES FRÉQUENTES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
               {["Riz Brisé", "Sucre en Poudre", "Lait Nido", "Savon Diama"].map(tag => (
                 <button key={tag} onClick={() => setQuery(tag)} style={{ background: "#fff", border: "1px solid #f1f5f9", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800, color: "#64748b" }}>{tag}</button>
               ))}
            </div>
            
            <div style={{ marginTop: 40, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: 24, padding: 24, color: "#fff" }}>
               <Zap size={32} color={GOLD} style={{ marginBottom: 16 }} />
               <h3 style={{ fontSize: 17, fontWeight: 900 }}>Comparateur de Prix B2B</h3>
               <p style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.6, marginTop: 8 }}>
                  LiviSearch scanne tous les grossistes du réseau pour vous proposer le meilleur compromis entre prix et temps de livraison.
               </p>
            </div>
         </div>
       )}

       {filteredResults.map((res, idx) => (
         <div key={idx} className="animate-fade-in" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
               <h3 style={{ fontSize: 18, fontWeight: 800 }}>{res.product}</h3>
               <div style={{ fontSize: 10, background: "#eff6ff", color: "#3b82f6", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>{res.category}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
               {res.comparisons.map((comp, cIdx) => (
                 <div key={cIdx} style={{ background: "#fff", padding: 16, borderRadius: 24, border: comp.best ? `2px solid ${VISION_GREEN}` : "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", position: "relative" }}>
                    {comp.best && <div style={{ position: "absolute", top: -10, right: 20, background: VISION_GREEN, color: "#fff", fontSize: 9, fontWeight: 900, padding: "4px 10px", borderRadius: 20 }}>MEILLEUR PRIX</div>}
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                       <div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{comp.wholesaler}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                             <Star size={12} fill={GOLD} color={GOLD} />
                             <span style={{ fontSize: 11, fontWeight: 800 }}>{comp.rating}</span>
                             <span style={{ fontSize: 11, color: "#94a3b8" }}>· Reliable</span>
                          </div>
                       </div>
                       <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: DARK_NAVY }}>{comp.price.toLocaleString()} F</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>SOIT {(comp.price / 50).toLocaleString()} F / KG</div>
                       </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f8fafc", paddingTop: 12 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800 }}>
                          <Clock size={16} color={VISION_GREEN} />
                          <span>Livraison: {comp.delivery}</span>
                       </div>
                       <button style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 900 }}>Commander</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
       ))}

       {query.length > 2 && filteredResults.length === 0 && (
         <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 900 }}>Aucune correspondance brute</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Voulez-vous que l'IA LiviSearch appelle un grossiste pour vous ?</p>
         </div>
       )}
       {isVoiceActive && <LiviVoice onClose={() => setIsVoiceActive(false)} onResult={(res) => setQuery(res)} />}
    </div>
  );
}
