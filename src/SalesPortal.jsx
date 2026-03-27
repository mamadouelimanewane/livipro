import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Users,
  MapPin,
  Sparkles,
  Layers,
  Loader2,
  Filter,
  BarChart3,
  Globe,
  Navigation,
  ShieldCheck,
  Zap
} from "lucide-react";
import LiviFleetManager from "./LiviFleetManager";
import LiviBranchManager from "./LiviBranchManager";
import LiviDirectory from "./LiviDirectory";
import MapView from "./components/MapView";
import { useProducts, useGroupageOffers } from "./useLiviData";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

import DashboardShell from "./components/DashboardShell";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

export default function SalesPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") || "catalog"); 
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== view) {
      setView(v);
    }
  }, [searchParams]);

  const handleViewChange = (newView) => {
    setView(newView);
    setSearchParams({ view: newView });
  };

  const { data: products, loading: productsLoading } = useProducts();
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();

  const filteredProducts = products.filter(p => 
    (activeCategory === "Tous" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (name) => {
    alert(`Action "${name}" : Opération enregistrée sur le serveur (Simulé).`);
  }

  const handleCreateProduct = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      alert("Nouveau produit ajouté au catalogue grossiste !");
    }, 1500);
  }

  const HeaderStats = () => (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "16px 24px", background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", alignSelf: "flex-start", width: "fit-content" }}>
          <div style={{ background: GOLD, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
             <Building2 size={24} />
          </div>
          <div>
             <div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>HUB LOGISTIQUE</div>
             <div style={{ fontSize: 16, fontWeight: 900 }}>Dakar Logistics Hub (Platinum)</div>
          </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
         <Card style={{ background: DARK_NAVY, color: "#fff" }}>
            <div style={{ fontSize: 12, color: GOLD, fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Chiffre d'Affaire Annuel</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>452.8M FCFA</div>
            <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 8, fontWeight: 700 }}>↑ +8.5% Objectifs</div>
         </Card>
         <Card>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Performances Flotte</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>96.2% <span style={{ fontSize: 14, fontWeight: 400, color: "#94a3b8" }}>Livraison</span></div>
            <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 8, fontWeight: 700 }}>Délais optimisés par IA</div>
         </Card>
         <Card>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Indice de Rupture</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: products.filter(p => p.stock < 50).length > 2 ? "#ef4444" : GOLD }}>{products.filter(p => p.stock < 50).length} <span style={{ fontSize: 14, fontWeight: 400, color: "#94a3b8" }}>Critiques</span></div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, fontWeight: 700 }}>Réapprovisionnement auto activé</div>
         </Card>
      </div>
    </div>
  );

  const renderInventoryTable = () => (
    <div className="animate-fade-in">
       <div style={{ display: "flex", flexDirection: window.innerWidth > 768 ? "row" : "column", justifyContent: "space-between", alignItems: window.innerWidth > 768 ? "center" : "flex-start", gap: 20, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Inventaire & Tarification Grossiste</h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>Contrôlez vos stocks, vos prix B2B et vos marges en temps réel.</p>
          </div>
          <div style={{ display: "flex", gap: 12, width: window.innerWidth > 768 ? "auto" : "100%" }}>
              <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrer catalogues..." 
                  style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: "100%" }} 
                />
              </div>
              <button 
                onClick={handleCreateProduct}
                disabled={isAdding}
                style={{ background: GOLD, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: isAdding ? "wait" : "pointer" }}
              >
                {isAdding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} <span style={{ display: window.innerWidth > 600 ? "inline" : "none" }}>Ajouter Article</span>
              </button>
          </div>
       </div>

       <div style={{ background: "#fff", borderRadius: 24, padding: window.innerWidth > 768 ? 32 : 16, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
             <thead>
                <tr style={{ borderBottom: "2px solid #f8fafc", textAlign: "left" }}>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>PRODUIT</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>CATÉGORIE</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>STOCKS RÉELS</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>VALEUR B2B</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>SCORE ROTATION</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800, textAlign: "right" }}>ACTIONS</th>
                </tr>
             </thead>
             <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                   <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                           <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Box size={18} color={GOLD} />}
                           </div>
                           <div>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: #{p.id.split('-')[0]}</div>
                           </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                         <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: 8 }}>{p.category}</span>
                      </td>
                      <td style={{ padding: "16px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 60, height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                               <div style={{ width: `${Math.min(100, (p.stock/1000)*100)}%`, height: "100%", background: p.stock < 50 ? "#ef4444" : VISION_GREEN, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: p.stock < 50 ? "#ef4444" : DARK_NAVY }}>{p.stock} <span style={{ fontSize: 10, fontWeight: 400, color: "#94a3b8" }}>UN</span></span>
                         </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 16, fontWeight: 900 }}>{p.price.toLocaleString()} F</td>
                      <td style={{ padding: "16px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 6, color: VISION_GREEN, fontWeight: 800, fontSize: 13 }}>
                            <TrendingDown size={14} style={{ transform: "rotate(180deg)" }} /> High
                         </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                         <button 
                            onClick={() => handleAction(`Modifier ${p.name}`)}
                            style={{ padding: 8, borderRadius: 10, background: "none", border: "1px solid #f1f5f9", color: "#64748b", cursor: "pointer" }}
                         >
                            <MoreVertical size={18} />
                         </button>
                      </td>
                   </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>Aucun article trouvé dans votre inventaire.</td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <DashboardShell title={view === 'catalog' ? 'Hub Logistique Grossiste' : view === 'fleet' ? 'Supervision de la Flotte' : view === 'directory' ? 'Annuaire Clients B2B' : view === 'groupage' ? 'Campagnes LiviGroupage' : 'Points Relais & Branches'} role="grossiste">
       <HeaderStats />
       
       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "catalog", label: "Stocks & Prix", icon: <Package size={16} /> },
          { id: "fleet", label: "Suivi Flotte", icon: <Truck size={16} /> },
          { id: "directory", label: "Portefeuille Clients", icon: <Users size={16} /> },
          { id: "groupage", label: "LiviGroupage", icon: <Layers size={16} /> },
          { id: "branches", label: "Relais & Points", icon: <Building2 size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => handleViewChange(tab.id)} 
            style={{ 
              background: view === tab.id ? DARK_NAVY : "#fff", 
              color: view === tab.id ? "#fff" : "#64748b",
              border: "1px solid #e2e8f0",
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: view === tab.id ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
              whiteSpace: "nowrap"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 28, padding: window.innerWidth > 768 ? 32 : 20, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.03)" }}>
        {view === "catalog" && renderInventoryTable()}
        {view === "groupage" && (
           <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                 <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900 }}>Campagnes d'Achats Groupés</h2>
                    <p style={{ fontSize: 14, color: "#64748b" }}>Optimisez vos volumes d'importation en regroupant les commandes des boutiques.</p>
                 </div>
                 <button onClick={() => handleAction("Nouvelle Campagne")} style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}>Lance une Campagne</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                 {groupageOffers.map(offer => (
                   <Card key={offer.id} style={{ border: "1px solid #fde68a", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                         <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: 8 }}>Remise: -{offer.discount}</div>
                         <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Fin: 05 Avril</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>{offer.name}</div>
                      
                      <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                           <span>Seuil Critique</span>
                           <span>{offer.current_orders} / {offer.min_orders} boutiques</span>
                        </div>
                        <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4 }}>
                           <div style={{ width: `${(offer.current_orders/offer.min_orders)*100}%`, height: "100%", background: GOLD, borderRadius: 4 }}></div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <button 
                          onClick={() => handleAction(`Edit ${offer.name}`)}
                          style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleAction(`Publier ${offer.name}`)}
                          style={{ flex: 1, background: DARK_NAVY, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                        >
                          Publier
                        </button>
                      </div>
                   </Card>
                 ))}
              </div>
           </div>
        )}
        {view === "fleet" && <LiviFleetManager />}
        {view === "branches" && <LiviBranchManager />}
        {view === "directory" && <LiviDirectory />}
      </div>
    </DashboardShell>
  );
}
