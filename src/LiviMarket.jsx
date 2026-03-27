import { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  ChevronRight, 
  Building2, 
  Box, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Star,
  Layers,
  Sparkles,
  ShoppingBag,
  CircleDollarSign,
  Package,
  Eye,
  LayoutDashboard
} from "lucide-react";

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

// Assets generated earlier (using their paths from context)
const RICE_IMG = "sac_de_riz_sac_50kg_premium_senegal_1774652642574.png";
const OIL_IMG = "huile_vegetale_dinor_premium_5l_1774652655927.png";
const MILK_IMG = "lait_nido_carton_senegal_b2b_1774652670053.png";

const MARKET_PRODUCTS = [
  { id: "p1", name: "Riz Parfumé Thai (Sac 50kg)", category: "Céréales", price: 21500, stock: 450, host: "Dakar Logistics Hub", rating: 4.8, image: RICE_IMG, trending: true },
  { id: "p2", name: "Huile Dinor Premium (5L x 4)", category: "Liquides", price: 18400, stock: 120, host: "Al-Amine Grossiste", rating: 4.9, image: OIL_IMG, trending: true },
  { id: "p3", name: "Lait Nido (Carton 12)", category: "Épicerie", price: 45000, stock: 85, host: "Coopérative Thiès Hub", rating: 4.7, image: MILK_IMG, trending: false },
  { id: "p4", name: "Sucre St Louis (Fardeau)", category: "Épicerie", price: 22100, stock: 0, host: "Dakar Logistics Hub", rating: 4.5, image: null, trending: false },
  { id: "p5", name: "Savon BF (Carton)", category: "Hygiène", price: 12500, stock: 210, host: "Al-Amine Grossiste", rating: 4.6, image: null, trending: false },
];

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: 0, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", overflow: "hidden", position: "relative", ...style }}>{children}</div>
);

const Badge = ({ children, color, bg }) => (
  <span style={{ fontSize: 9, fontWeight: 950, color, background: bg, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</span>
);

export default function LiviMarket({ onOrder }) {
  const [activeCat, setActiveCat] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(null);

  const filtered = MARKET_PRODUCTS.filter(p => 
    (activeCat === "Tous" || p.category === activeCat) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrder = (product) => {
    setIsAdding(product.id);
    setTimeout(() => {
      setIsAdding(null);
      if (onOrder) onOrder(product);
      else alert(`Commande de ${product.name} envoyée à ${product.host} !`);
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ fontFamily: "'Outfit', sans-serif" }}>
       {/* SEARCH & FILTERS */}
       <div style={{ display: "flex", flexDirection: window.innerWidth > 768 ? "row" : "column", justifyContent: "space-between", alignItems: window.innerWidth > 768 ? "center" : "flex-start", gap: 20, marginBottom: 40 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flex: 1, boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
             <Search size={20} color="#94a3b8" />
             <input 
               type="text" 
               placeholder="Rechercher Riz, Huile, Lait..." 
               style={{ border: "none", outline: "none", width: "100%", fontSize: 14, fontWeight: 500 }}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, maxWidth: "100%" }}>
             {["Tous", "Céréales", "Liquides", "Épicerie", "Hygiène"].map(cat => (
               <button 
                key={cat} 
                onClick={() => setActiveCat(cat)}
                style={{ background: activeCat === cat ? DARK_NAVY : "#fff", color: activeCat === cat ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
               >
                 {cat}
               </button>
             ))}
          </div>
       </div>

       {/* PRODUCT GRID */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32 }}>
          {filtered.map(p => (
            <Card key={p.id} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
               {/* PRODUCT IMAGE */}
               <div style={{ height: 200, background: "#f8fafc", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Box size={48} color={GOLD} style={{ opacity: 0.3 }} />
                  )}
                  {p.trending && <div style={{ position: "absolute", top: 16, left: 16 }}><Badge color="#fff" bg={GOLD}>🔥 Trend</Badge></div>}
                  <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <div style={{ background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 900, color: DARK_NAVY }}>
                       <Star size={12} fill={GOLD} color={GOLD} /> {p.rating}
                    </div>
                  </div>
               </div>

               {/* PRODUCT INFO */}
               <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>{p.category}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 950, color: DARK_NAVY, marginBottom: 8, lineHeight: 1.3 }}>{p.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                     <Building2 size={14} color="#64748b" />
                     <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Grossiste: <span style={{ color: DARK_NAVY, fontWeight: 800 }}>{p.host}</span></div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: 16, borderRadius: 20, marginBottom: 24 }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                           <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800 }}>DISPONIBILITÉ</div>
                           <div style={{ fontSize: 15, fontWeight: 950, color: p.stock === 0 ? "#ef4444" : VISION_GREEN }}>{p.stock === 0 ? "Rupture" : `${p.stock} UN`}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800 }}>PRIX B2B HT</div>
                           <div style={{ fontSize: 22, fontWeight: 950, color: DARK_NAVY }}>{p.price.toLocaleString()} F</div>
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={() => handleOrder(p)}
                    disabled={p.stock === 0 || isAdding === p.id}
                    style={{ width: "100%", background: p.stock === 0 ? "#e2e8f0" : DARK_NAVY, color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 900, fontSize: 14, cursor: (p.stock === 0 || isAdding === p.id) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    {isAdding === p.id ? "Initialisation..." : p.stock === 0 ? "Non disponible" : <><ShoppingCart size={18} /> Commander Direct</>}
                  </button>
               </div>
            </Card>
          ))}
       </div>

       {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
             <Package size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
             <p>Aucun produit ne correspond à votre recherche dans la Marketplace.</p>
          </div>
       )}
    </div>
  );
}
