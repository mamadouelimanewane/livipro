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
  Users,
  MapPin,
  Sparkles,
  Layers,
  Loader2
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

export default function SalesPortal() {
  const [view, setView] = useState("catalog"); 
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products, loading: productsLoading } = useProducts();
  const { data: groupageOffers, loading: groupageLoading } = useGroupageOffers();

  const filteredProducts = products.filter(p => 
    (activeCategory === "Tous" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const HeaderStats = () => (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "16px 24px", background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", alignSelf: "flex-start", width: "fit-content" }}>
          <div style={{ background: GOLD, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
             <Building2 size={24} />
          </div>
          <div>
             <div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>IDENTIFICATION GROSSISTE</div>
             <div style={{ fontSize: 16, fontWeight: 900 }}>Dakar Logistics Hub (Certifié Platinum)</div>
          </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
         <Card style={{ background: DARK_NAVY, color: "#fff" }}>
            <div style={{ fontSize: 12, color: GOLD, fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Valeur Générée (Période)</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>45.2M FCFA</div>
            <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 8, fontWeight: 700 }}>↑ +14.5% vs mois dernier</div>
         </Card>
         <Card>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Capacité Flotte</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>82% <span style={{ fontSize: 14, fontWeight: 400, color: "#94a3b8" }}>Charge</span></div>
            <div style={{ fontSize: 11, color: GOLD, marginTop: 8, fontWeight: 700 }}>5 Camions • 3 Motos • 2 Indépendants</div>
         </Card>
         <Card>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Alertes Stock</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#ef4444" }}>{products.filter(p => p.stock < 50).length} <span style={{ fontSize: 14, fontWeight: 400, color: "#94a3b8" }}>Critiques</span></div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, fontWeight: 700 }}>Rupture imminente : Riz, Huile</div>
         </Card>
      </div>
    </div>
  );

  const renderInventoryTable = () => (
    <div className="animate-fade-in">
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Inventaire & Tarification</h2>
            <p style={{ fontSize: 13, color: "#64748b" }}>Gérez vos prix grossistes et vos niveaux de stock en temps réel.</p>
          </div>
          <button style={{ background: GOLD, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={20} /> Nouveau Produit
          </button>
       </div>

       <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
                <tr style={{ borderBottom: "2px solid #f8fafc", textAlign: "left" }}>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>VISUEL</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>DÉSIGNATION</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>GROSSISTE ID</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>STOCK DISPO</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>PRIX B2B</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>ACTIONS</th>
                </tr>
             </thead>
             <tbody>
                {filteredProducts.map(p => (
                   <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "16px" }}>
                         <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Box size={20} color={GOLD} />}
                         </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                         <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                         <div style={{ fontSize: 11, color: "#64748b" }}>{p.category}</div>
                      </td>
                      <td style={{ padding: "16px" }}>
                         <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{p.wholesaler || "Dakar Hub"}</div>
                      </td>
                      <td style={{ padding: "16px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 60, height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                               <div style={{ width: `${Math.min(100, (p.stock/1000)*100)}%`, height: "100%", background: p.stock < 50 ? "#ef4444" : VISION_GREEN, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: p.stock < 50 ? "#ef4444" : DARK_NAVY }}>{p.stock}</span>
                         </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 16, fontWeight: 900 }}>{p.price.toLocaleString()} F</td>
                      <td style={{ padding: "16px" }}>
                         <button style={{ padding: 8, borderRadius: 10, background: "none", border: "1px solid #f1f5f9", color: "#64748b" }}><MoreVertical size={18} /></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <DashboardShell title="Hub Logistique & Ventes Grossiste" role="grossiste">
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
            onClick={() => setView(tab.id)} 
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
              boxShadow: view === tab.id ? "0 4px 15px rgba(0,0,0,0.1)" : "none"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
        {view === "catalog" && renderInventoryTable()}
        {view === "groupage" && (
           <div className="animate-fade-in">
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Campagnes d'Achats Groupés</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                 {groupageOffers.map(offer => (
                   <Card key={offer.id} style={{ border: "1px solid #fde68a" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: 8, display: "inline-block", marginBottom: 12 }}>PROMO ACTIVE : -{offer.discount}</div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{offer.name}</div>
                      <div style={{ marginTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                           <span>Progression</span>
                           <span>{offer.current_orders} / {offer.min_orders} boutiques</span>
                        </div>
                        <div style={{ height: 8, background: "#f8fafc", borderRadius: 4 }}>
                           <div style={{ width: `${(offer.current_orders/offer.min_orders)*100}%`, height: "100%", background: GOLD, borderRadius: 4 }} />
                        </div>
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
