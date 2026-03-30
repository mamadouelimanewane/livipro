import { useState, useEffect } from "react";
import { useToast } from './components/Toast';
import { useIsTablet } from './hooks/useMediaQuery';
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

import { useProducts, useGroupageOffers } from "./useLiviData";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: 0, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", overflow: "hidden", position: "relative", ...style }}>{children}</div>
);

const Badge = ({ children, color, bg }) => (
  <span style={{ fontSize: 9, fontWeight: 950, color, background: bg, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</span>
);

export default function LiviMarket({ onOrder }) {
  const { toast } = useToast();
  const isTablet = useIsTablet();
  const [activeCat, setActiveCat] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(null);
  
  const { data: products, loading: productsLoading } = useProducts();
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();

  const filtered = products.filter(p => 
    (activeCat === "Tous" || p.category === activeCat) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrder = (product) => {
    setIsAdding(product.id);
    setTimeout(() => {
      setIsAdding(null);
      if (onOrder) onOrder(product);
      else toast.success(`Commande de ${product.name} envoyée à ${product.host} !`);
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ fontFamily: "'Outfit', sans-serif" }}>
       {/* SEARCH & FILTERS */}
       <div style={{ display: "flex", flexDirection: isTablet ? "column" : "row", justifyContent: "space-between", alignItems: isTablet ? "flex-start" : "center", gap: 20, marginBottom: 40 }}>
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

        {/* GROUPAGE OFFERS SECTION - B2B Bulk Advantage */}
        <div style={{ marginBottom: 48 }}>
           <h2 style={{ fontSize: 20, fontWeight: 950, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={22} color={GOLD} /> Offres de Groupage Actives <Badge bg="#fffbeb" color={GOLD}>Exclusif LiviPro</Badge>
           </h2>
           <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 20, WebkitOverflowScrolling: "touch" }}>
              {groupageLoading ? (
                 <div style={{ padding: 20, color: "#94a3b8" }}>Recherche d'opportunités de gros...</div>
              ) : groupageOffers?.map(offer => (
                <div key={offer.id} style={{ 
                  minWidth: 320, background: DARK_NAVY, color: "#fff", 
                  padding: 24, borderRadius: 24, boxShadow: "0 15px 35px rgba(15,23,42,0.3)",
                  position: "relative", overflow: "hidden"
                }}>
                   <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>OFFRE À SAISIR</div>
                   <h4 style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>{offer.name}</h4>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                         <div style={{ fontSize: 10, color: "#94a3b8" }}>RÉDUCTION</div>
                         <div style={{ fontSize: 18, fontWeight: 950, color: GOLD }}>-{offer.discount}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                         <div style={{ fontSize: 10, color: "#94a3b8" }}>EXPIRATION</div>
                         <div style={{ fontSize: 14, fontWeight: 800 }}>{offer.deadline}</div>
                      </div>
                   </div>
                   
                   {/* Local progress bar */}
                   <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
                         <span>Progression: {offer.current_orders}/{offer.min_orders} Boutiquiers</span>
                         <span>{Math.round((offer.current_orders/offer.min_orders)*100)}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                         <div style={{ height: "100%", width: `${(offer.current_orders/offer.min_orders)*100}%`, background: GOLD }} />
                      </div>
                   </div>

                   <button style={{ 
                     width: "100%", background: "rgba(255,255,255,0.1)", color: "#fff", 
                     border: "1px solid rgba(255,255,255,0.2)", padding: "10px", 
                     borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer",
                     display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                   }}>
                      <Users size={14} /> Rejoindre le groupage
                   </button>
                </div>
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
