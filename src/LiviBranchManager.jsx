import { useState } from "react";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  MapPin, 
  ArrowUpRight, 
  Plus, 
  Activity, 
  Clock, 
  ShoppingBag, 
  Package,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Zap,
  Globe,
  Settings,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  LayoutDashboard
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

const Badge = ({ text, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 10, color, background: bg, textTransform: "uppercase" }}>{text}</span>
);

export default function LiviBranchManager() {
  const [activeBranch, setActiveBranch] = useState(null);

  const BRANCHES = [
    { id: "b1", name: "Dakar-Plateau Central", resp: "Ousmane Drame", status: "Ouvert", sales: "4.2M F", stock: 85, personnel: 12, performance: "High", city: "Dakar" },
    { id: "b2", name: "Pikine Icotaf Hub", resp: "Awa Ndiaye", status: "Ouvert", sales: "2.8M F", stock: 42, personnel: 8, performance: "Medium", city: "Pikine" },
    { id: "b3", name: "Saint-Louis Delta", resp: "Modou Fall", status: "Alerte Stock", sales: "1.5M F", stock: 12, personnel: 6, performance: "Low", city: "Saint-Louis" },
  ];

  return (
    <div className="animate-fade-in">
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
             <h2 style={{ fontSize: 24, fontWeight: 900 }}>Gestion Multi-Succursales</h2>
             <p style={{ fontSize: 13, color: "#64748b" }}>Contrôlez l'ensemble de vos points de vente depuis un cockpit unique.</p>
          </div>
          <button style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
             <Plus size={18} /> Ajouter Succursale
          </button>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 40 }}>
          {BRANCHES.map(branch => (
            <Card key={branch.id} style={{ border: branch.status === 'Alerte Stock' ? "1px solid #ef4444" : "1px solid #f1f5f9" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                     <Building2 size={24} color={DARK_NAVY} />
                  </div>
                  <Badge text={branch.status} color={branch.status === 'Ouvert' ? VISION_GREEN : "#ef4444"} bg={branch.status === 'Ouvert' ? "#ecfdf5" : "#fef2f2"} />
               </div>
               <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{branch.name}</div>
               <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Responsable: {branch.resp}</div>

               <div style={{ background: "#f8fafc", padding: 16, borderRadius: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div>
                     <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800 }}>VENTES (JOUR)</div>
                     <div style={{ fontSize: 16, fontWeight: 950, color: DARK_NAVY }}>{branch.sales}</div>
                  </div>
                  <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 12 }}>
                     <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800 }}>STOCKS</div>
                     <div style={{ fontSize: 16, fontWeight: 950, color: branch.stock < 20 ? "#ef4444" : VISION_GREEN }}>{branch.stock}%</div>
                  </div>
               </div>

               <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                     <Settings size={14} /> Configurer
                  </button>
                  <button onClick={() => setActiveBranch(branch)} style={{ flex: 1, background: DARK_NAVY, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                     Analyser <ArrowUpRight size={14} />
                  </button>
               </div>
            </Card>
          ))}
       </div>

       {activeBranch && (
         <div className="animate-fade-in">
           <Card style={{ borderTop: `8px solid ${DARK_NAVY}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
                 <div>
                    <h3 style={{ fontSize: 22, fontWeight: 900 }}>Audit Performance : {activeBranch.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: VISION_GREEN, fontWeight: 800, marginTop: 4 }}>
                       <Activity size={14} /> Données synchronisées en temps réel (Backend LiviPro)
                    </div>
                 </div>
                 <button onClick={() => setActiveBranch(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Fermer l'audit</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 32 }}>
                 <div style={{ padding: 20, background: "#f8fafc", borderRadius: 20 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800 }}>CHIFFRE D'AFFAIRES MENSUEL</div>
                    <div style={{ fontSize: 24, fontWeight: 950, marginTop: 8 }}>125,4M F</div>
                    <div style={{ fontSize: 11, color: VISION_GREEN, fontWeight: 900, marginTop: 4 }}>+14% Objectif</div>
                 </div>
                 <div style={{ padding: 20, background: "#f8fafc", borderRadius: 20 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800 }}>PRÉCISION INVENTAIRE</div>
                    <div style={{ fontSize: 24, fontWeight: 950, marginTop: 8 }}>99.2%</div>
                    <div style={{ fontSize: 11, color: GOLD, fontWeight: 900, marginTop: 4 }}>Audit IA certifié</div>
                 </div>
                 <div style={{ padding: 20, background: "#f8fafc", borderRadius: 20 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800 }}>EFFECTIF PERSONNEL</div>
                    <div style={{ fontSize: 24, fontWeight: 950, marginTop: 8 }}>{activeBranch.personnel} Agents</div>
                 </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                 <button style={{ flex: 1, background: VISION_GREEN, color: "#fff", border: "none", padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <ShieldCheck size={20} /> Certifier Bilan de Succursale
                 </button>
              </div>
           </Card>
         </div>
       )}
    </div>
  );
}
