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
  Zap,
  Send
} from "lucide-react";
import LiviFleetManager from "./LiviFleetManager";
import LiviBranchManager from "./LiviBranchManager";
import LiviDirectory from "./LiviDirectory";
import MapView from "./components/MapView";
import { useProducts, useGroupageOffers } from "./useLiviData";
import DashboardShell from "./components/DashboardShell";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

export default function SalesPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") || "catalog"); 
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Shared simulation state
  const { data: productsData, loading: productsLoading } = useProducts();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('livi_shared_catalog');
    if (saved) {
      setInventory(JSON.parse(saved));
    } else {
      setInventory(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== view) setView(v);
  }, [searchParams]);

  const handleViewChange = (newView) => {
    setView(newView);
    setSearchParams({ view: newView });
  };

  const handleAction = (msg) => alert(`Action: ${msg}`);

  const promoteToBoutiques = (product) => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      const updated = inventory.map(p => p.id === product.id ? { ...p, promoted: true } : p);
      setInventory(updated);
      localStorage.setItem('livi_shared_catalog', JSON.stringify(updated));
      alert(`Le produit "${product.name}" a été promu ! Il apparaîtra instantanément dans les portails de toutes les boutiques partenaires.`);
    }, 1000);
  };

  const addNewProduct = () => {
    const name = prompt("Nom du produit ?");
    if (!name) return;
    const price = parseInt(prompt("Prix B2B (FCFA) ?") || "1000");
    const newP = { id: `p-${Date.now()}`, name, price, stock: 500, category: "Nouveauté", promoted: true };
    const updated = [newP, ...inventory];
    setInventory(updated);
    localStorage.setItem('livi_shared_catalog', JSON.stringify(updated));
    alert("Produit ajouté et injecté dans le réseau !");
  };

  const HeaderStats = () => (
    <div style={{ marginBottom: 32 }}>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
         <Card style={{ background: DARK_NAVY, color: "#fff" }}>
            <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Chiffre d'Affaire Distributeur</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>452.8M FCFA</div>
         </Card>
         <Card>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Taux de Livraison</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN }}>96.2%</div>
         </Card>
         <Card>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Boutiques Actives</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>114</div>
         </Card>
      </div>
    </div>
  );

  return (
    <DashboardShell title="Hub Logistique Grossiste" role="grossiste">
       <HeaderStats />
       
       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "catalog", label: "Stocks & Prix", icon: <Package size={16} /> },
          { id: "fleet", label: "Suivi Flotte", icon: <Truck size={16} /> },
          { id: "directory", label: "Portefeuille Clients", icon: <Users size={16} /> },
          { id: "groupage", label: "LiviGroupage", icon: <Layers size={16} /> },
          { id: "branches", label: "Relais & Points", icon: <Building2 size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleViewChange(tab.id)} style={{ background: view === tab.id ? DARK_NAVY : "#fff", color: view === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.icon} {tab.label}</button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0" }}>
        {view === "catalog" && (
           <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                 <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900 }}>Inventaire & Offres B2B</h2>
                    <p style={{ fontSize: 14, color: "#64748b" }}>Gérez vos prix et poussez vos promotions vers les boutiques.</p>
                 </div>
                 <button onClick={addNewProduct} style={{ background: GOLD, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                   <Plus size={20} /> Nouveau Produit
                 </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                 <thead>
                    <tr style={{ borderBottom: "2px solid #f8fafc", textAlign: "left" }}>
                       <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>PRODUIT</th>
                       <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>STOCK</th>
                       <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>PRIX B2B</th>
                       <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800, textAlign: "right" }}>ACTIONS</th>
                    </tr>
                 </thead>
                 <tbody>
                    {inventory.map(p => (
                       <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "16px", fontSize: 14, fontWeight: 800 }}>{p.name}</td>
                          <td style={{ padding: "16px", fontSize: 14, color: p.stock < 50 ? "#ef4444" : "#1e293b", fontWeight: 700 }}>{p.stock}</td>
                          <td style={{ padding: "16px", fontSize: 14, fontWeight: 900 }}>{p.price.toLocaleString()} F</td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                             <button 
                                onClick={() => promoteToBoutiques(p)}
                                style={{ background: p.promoted ? VISION_GREEN : "#f1f5f9", color: p.promoted ? "#fff" : "#64748b", border: "none", padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                             >
                                <Send size={14} /> {p.promoted ? "Promu" : "Promouvoir"}
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
        {view === "fleet" && <LiviFleetManager />}
        {view === "directory" && <LiviDirectory />}
        {view === "branches" && <LiviBranchManager />}
      </div>
    </DashboardShell>
  );
}
