import { useState } from "react";
import { 
  Package, 
  Search, 
  ShoppingCart, 
  ArrowLeft, 
  Tag, 
  MoreVertical, 
  Plus,
  Box,
  Truck,
  TrendingDown,
  Building2,
  Users
} from "lucide-react";
import LiviFleetManager from "./LiviFleetManager";
import LiviBranchManager from "./LiviBranchManager";
import LiviDirectory from "./LiviDirectory";
import { PRODUCTS } from "./LiviData";

// --- SIMULATION DATA (MOVED TO LIVIDATA) ---

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function SalesPortal() {
  const [view, setView] = useState("catalog"); // catalog | fleet | branches | directory
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = PRODUCTS.filter(p => 
    (activeCategory === "Tous" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === "fleet") return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <button onClick={() => setView("catalog")} style={{ position: "absolute", top: 20, left: 20, zIndex: 10, background: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <ArrowLeft size={20} />
      </button>
      <LiviFleetManager />
    </div>
  );

  if (view === "branches") return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <button onClick={() => setView("catalog")} style={{ position: "absolute", top: 20, left: 20, zIndex: 10, background: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <ArrowLeft size={20} />
      </button>
      <LiviBranchManager />
    </div>
  );

  if (view === "directory") return (
    <div className="animate-fade-in" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <button onClick={() => setView("catalog")} style={{ position: "absolute", top: 20, left: 20, zIndex: 10, background: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <ArrowLeft size={20} />
      </button>
      <LiviDirectory />
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#f8fafc", minHeight: "100vh", position: "relative", fontFamily: "'Inter', sans-serif" }}>
       
       <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.4s ease-out; }
       `}</style>

       {/* HEADER */}
       <div style={{ background: DARK_NAVY, padding: "40px 24px 30px", borderRadius: "0 0 32px 32px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
             <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>Portail Grossiste</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>Module Ventes</div>
             </div>
             <div style={{ background: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 14 }}>
                <ShoppingCart size={22} />
             </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
             <Search size={18} color="#94a3b8" />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Rechercher un produit ou prix..." 
               style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, color: "#fff" }} 
             />
          </div>
       </div>

       {/* CATEGORIES */}
       <div style={{ padding: "24px 24px 0", display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10 }}>
          {["Tous", "Laitier", "Alimentaire", "Céréales"].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ 
                flexShrink: 0, 
                background: activeCategory === cat ? GOLD : "#fff", 
                color: activeCategory === cat ? "#fff" : "#64748b",
                border: "1px solid #f1f5f9",
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800
              }}>
              {cat}
            </button>
          ))}
       </div>

       {/* PRODUCTS LIST */}
       <div className="animate-fade-in" style={{ padding: 24, paddingBottom: 100 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 16 }}>LISTE DES PRIX EXPOSÉS</div>
          
          {filteredProducts.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                     <div style={{ background: "#f8fafc", width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box size={24} color={GOLD} />
                     </div>
                     <div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Catégorie: {p.category}</div>
                     </div>
                  </div>
                  <MoreVertical size={18} color="#cbd5e1" />
               </div>

               <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, borderTop: "1px solid #f8fafc", paddingTop: 16, alignItems: "flex-end" }}>
                  <div>
                     <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Stock Hub</div>
                     <div style={{ fontSize: 14, fontWeight: 800, color: p.stock < 50 ? "#ef4444" : "#10b981", marginTop: 2 }}>
                        {p.stock} Unités {p.stock < 50 && <span style={{ fontSize: 10, fontStyle: "italic" }}>(Bas)</span>}
                     </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     {p.promo && <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 800, textDecoration: "line-through", marginBottom: 2 }}>{(p.price * 1.1).toLocaleString()} F</div>}
                     <div style={{ fontSize: 20, fontWeight: 900, color: DARK_NAVY }}>{p.price.toLocaleString()} F</div>
                     <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, background: "#fef3c7", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>PRIX GROSSISTE</div>
                  </div>
               </div>
            </div>
          ))}

          <button style={{ width: "100%", background: GOLD, color: "#fff", border: "none", padding: 18, borderRadius: 18, fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 10px 25px rgba(245, 158, 11, 0.3)" }}>
             <Plus size={20} /> Ajouter un Produit
          </button>
          
          <div style={{ marginTop: 20, background: "#f0fdf4", padding: 16, borderRadius: 16, display: "flex", alignItems: "center", gap: 12, border: "1px dashed #10b981" }}>
             <TrendingDown size={20} color="#10b981" />
             <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Paramètres : Vos prix sont synchronisés avec 124 boutiques.</div>
          </div>
       </div>

       {/* FLOATING ACTION */}
       <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setView("directory")} style={{ width: 60, height: 60, borderRadius: 30, background: "#fff", color: VISION_GREEN, border: "2px solid #ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", cursor: "pointer" }}>
             <Users size={24} />
          </button>
          <button onClick={() => setView("branches")} style={{ width: 60, height: 60, borderRadius: 30, background: "#fff", color: DARK_NAVY, border: "2px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", cursor: "pointer" }}>
             <Building2 size={24} />
          </button>
          <button onClick={() => setView("fleet")} style={{ width: 60, height: 60, borderRadius: 30, background: DARK_NAVY, color: "#f59e0b", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(15,23,42,0.3)", cursor: "pointer" }}>
             <Truck size={24} />
          </button>
       </div>
    </div>
  );
}
