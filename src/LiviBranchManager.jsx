import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowRightLeft, 
  Activity,
  ChevronRight,
  Plus,
  LayoutDashboard
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviBranchManager() {
  const [branches] = useState([
    { id: "SUC-01", name: "Succursale Dakar-Plateau", manager: "Ousmane Drame", revenue: "4.2M F", stockLevel: "85%", status: "Ouvert" },
    { id: "SUC-02", name: "Succursale Pikine Icotaf", manager: "Awa Ndiaye", revenue: "2.8M F", stockLevel: "42%", status: "Ouvert" },
    { id: "SUC-03", name: "Succursale Saint-Louis Hub", manager: "Modou Fall", revenue: "1.5M F", stockLevel: "12%", status: "Alerte Stock" }
  ]);

  const [activeTab, setActiveTab] = useState("overview"); // overview | transfers | performance

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* BRANCH HEADER */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900 }}>Gestion Multi-Succursales</h2>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Pilotage centralisé Producteur/Grossiste</div>
          </div>
          <div style={{ background: DARK_NAVY, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <Building2 size={24} color={GOLD} />
          </div>
       </div>

       {/* QUICK STATS CONSOLIDATED */}
       <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", borderRadius: 24, padding: 24, color: "#fff", marginBottom: 24 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Chiffre d'Affaires Consolidé (Jour)</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>8,500,000 <span style={{ fontSize: 14 }}>FCFA</span></div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
             <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>TOTAL STOCKS</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>4,240 <span style={{ fontSize: 10 }}>Art.</span></div>
             </div>
             <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>POINTS DE VENTE</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{branches.length} Succ.</div>
             </div>
          </div>
       </div>

       {/* TABS */}
       <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["overview", "transfers", "performance"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{ flex: 1, background: activeTab === tab ? GOLD : "#fff", color: activeTab === tab ? "#fff" : "#64748b", border: "1px solid #f1f5f9", padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
               {tab === "overview" ? "Tableau" : tab === "transfers" ? "Transferts" : "Performance"}
            </button>
          ))}
       </div>

       {activeTab === "overview" && (
         <div className="animate-fade-in">
            {branches.map((suc, idx) => (
              <div key={idx} style={{ background: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                       <div style={{ background: "#f0fdf4", width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MapPin size={20} color={VISION_GREEN} />
                       </div>
                       <div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{suc.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>Resp: {suc.manager}</div>
                       </div>
                    </div>
                    <div style={{ fontSize: 10, background: suc.status === "Alerte Stock" ? "#fef2f2" : "#f0fdf4", color: suc.status === "Alerte Stock" ? "#ef4444" : VISION_GREEN, padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>{suc.status}</div>
                 </div>

                 <div style={{ display: "flex", gap: 20, borderTop: "1px solid #f8fafc", paddingTop: 12 }}>
                    <div>
                       <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>VENTES</div>
                       <div style={{ fontSize: 14, fontWeight: 900 }}>{suc.revenue}</div>
                    </div>
                    <div>
                       <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>STOCKS</div>
                       <div style={{ fontSize: 14, fontWeight: 900, color: parseInt(suc.stockLevel) < 30 ? "#ef4444" : "#0f172a" }}>{suc.stockLevel}</div>
                    </div>
                 </div>
              </div>
            ))}
            <button style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: 16, borderRadius: 16, fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10 }}>
               <Plus size={20} color={GOLD} /> Ajouter une Succursale
            </button>
         </div>
       )}

       {activeTab === "transfers" && (
         <div className="animate-fade-in">
            <div style={{ background: "#fff", padding: 20, borderRadius: 24, border: "1px solid #f1f5f9", marginBottom: 20 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <ArrowRightLeft size={20} color={GOLD} />
                  <div style={{ fontSize: 15, fontWeight: 900 }}>Transfert Inter-Succursales</div>
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 12, alignItems: "center", marginBottom: 20 }}>
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, textAlign: "center", fontSize: 11, fontWeight: 800 }}>CENTRAL PORT</div>
                  <ChevronRight size={20} color="#94a3b8" />
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, textAlign: "center", fontSize: 11, fontWeight: 800 }}>PIKINE ICOTAF</div>
               </div>

               <div style={{ background: "#fef3c7", padding: 12, borderRadius: 12, fontSize: 11, color: "#b45309", fontWeight: 700, marginBottom: 16 }}>
                 ALERTE : Stock critique à Pikine. Réapprovisionnement automatique suggéré.
               </div>

               <button style={{ width: "100%", background: VISION_GREEN, color: "#fff", border: "none", padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 13 }}>Générer Bon de Transfert</button>
            </div>
         </div>
       )}

       {activeTab === "performance" && (
         <div className="animate-fade-in">
            <div style={{ background: "#fff", padding: 20, borderRadius: 24, border: "1px solid #f1f5f9" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <TrendingUp size={20} color={VISION_GREEN} />
                  <div style={{ fontSize: 15, fontWeight: 900 }}>Impact Profit/Perte Consolidé</div>
               </div>
               <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 20, padding: "0 10px" }}>
                  <div style={{ flex: 1, background: GOLD, height: "100%", borderRadius: "8px 8px 0 0", minHeight: 40, position: "relative" }}><span style={{ position: "absolute", bottom: -24, left: 0, width: "100%", fontSize: 9, textAlign: "center", fontWeight: 700 }}>PLAT.</span></div>
                  <div style={{ flex: 1, background: "#3b82f6", height: "65%", borderRadius: "8px 8px 0 0", minHeight: 40, position: "relative" }}><span style={{ position: "absolute", bottom: -24, left: 0, width: "100%", fontSize: 9, textAlign: "center", fontWeight: 700 }}>PIKINE</span></div>
                  <div style={{ flex: 1, background: "#94a3b8", height: "40%", borderRadius: "8px 8px 0 0", minHeight: 40, position: "relative" }}><span style={{ position: "absolute", bottom: -24, left: 0, width: "100%", fontSize: 9, textAlign: "center", fontWeight: 700 }}>ST-LOUIS</span></div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
