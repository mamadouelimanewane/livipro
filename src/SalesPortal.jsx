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
  Send,
  Thermometer,
  Mic,
  LayoutDashboard,
  BrainCircuit,
  PieChart
} from "lucide-react";
import LiviFleetManager from "./LiviFleetManager";
import LiviBranchManager from "./LiviBranchManager";
import LiviDirectory from "./LiviDirectory";
import LiviVoice from "./LiviVoice";
import LiviGreen from "./LiviGreen";
import LiviCommunity from "./LiviCommunity";
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
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
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

  const handleNav = (v) => {
    setView(v);
    setSearchParams({ view: v });
  };

  const handleCommand = (cmd) => {
    if (cmd.action === 'LOGISTIQUE') handleNav('fleet');
    else if (cmd.action === 'COMMANDE') handleNav('catalog');
  };

  const HeaderStats = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800 }}>CAPEX DISTRIBUTEUR</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>452.8M F</div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>PERF LOGISTIQUE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: VISION_GREEN }}>96.2%</div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>INDICE CHAÎNE FROID</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>2.4°C <span style={{ fontSize: 14, color: "#94a3b8" }}>Moyen</span></div>
       </Card>
    </div>
  );

  return (
    <DashboardShell title="Logistique & Ventes Grossiste" role="grossiste">
       <HeaderStats />

       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "community", label: "LiviCommunity™", icon: <MessageSquare size={16} /> },
          { id: "catalog", label: "Stocks & Prix", icon: <Package size={16} /> },
          { id: "branches", label: "Multi-Succursales", icon: <Building2 size={16} /> },
          { id: "green", label: "LiviGreen ColdChain", icon: <Thermometer size={16} /> },
          { id: "fleet", label: "Suivi Flotte", icon: <Truck size={16} /> },
          { id: "directory", label: "Portefeuille Clients", icon: <Users size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleNav(tab.id)} style={{ background: view === tab.id ? DARK_NAVY : "#fff", color: view === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
        <button onClick={() => setIsVoiceActive(!isVoiceActive)} style={{ background: isVoiceActive ? GOLD : "#fff", color: DARK_NAVY, border: isVoiceActive ? "none" : "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
           <Mic size={16} /> {isVoiceActive ? "Fermer Voix" : "LiviVoice"}
        </button>
      </div>

       {isVoiceActive && <div style={{ marginBottom: 32 }}><LiviVoice onCommand={handleCommand} /></div>}

       <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.02)" }}>
          {view === "community" && <LiviCommunity />}
          {view === "catalog" && (
            <div className="animate-fade-in">
               <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Inventaire Centralisé</h2>
               <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc" }}>
                     <tr style={{ textAlign: "left" }}>
                        <th style={{ padding: "16px", fontSize: 12, color: "#64748b" }}>PRODUIT</th>
                        <th style={{ padding: "16px", fontSize: 12, color: "#64748b" }}>STOCK RÉEL</th>
                        <th style={{ padding: "16px", fontSize: 12, color: "#64748b" }}>PRIX B2B</th>
                     </tr>
                  </thead>
                  <tbody>
                     {inventory.map(p => (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                           <td style={{ padding: "16px", fontSize: 14, fontWeight: 800 }}>{p.name}</td>
                           <td style={{ padding: "16px", fontSize: 14, fontWeight: 700 }}>{p.stock}</td>
                           <td style={{ padding: "16px", fontSize: 14, fontWeight: 950 }}>{p.price.toLocaleString()} F</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
          {view === "branches" && <LiviBranchManager />}
          {view === "green" && <LiviGreen />}
          {view === "fleet" && <LiviFleetManager />}
          {view === "directory" && <LiviDirectory />}
       </div>
    </DashboardShell>
  );
}
