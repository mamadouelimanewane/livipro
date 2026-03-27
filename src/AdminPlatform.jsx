import { useState, useEffect } from "react";
import DocumentVault from "./DocumentVault";
import LiviTrack from "./LiviTrack";
import LiviChain from "./LiviChain";
import LiviSwarm from "./LiviSwarm";
import LiviRelay from "./LiviRelay";
import LiviDirectory from "./LiviDirectory";
import LiviMap from "./LiviMap";
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreVertical, 
  Lock, 
  Unlock, 
  FileCheck,
  Building,
  Truck,
  Store,
  AlertTriangle,
  Percent,
  CircleDollarSign,
  Briefcase,
  TrendingUp,
  FileText,
  ShieldAlert,
  Database,
  MessageSquare,
  Globe,
  Navigation,
  Layers,
  Heart,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { useSocialFeed, useMembers } from "./useLiviData";
import DashboardShell from "./components/DashboardShell";
import { useSearchParams } from "react-router-dom";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

const Badge = ({ text, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 12px", borderRadius: 10, color, background: bg, textTransform: "uppercase", letterSpacing: 0.5 }}>{text}</span>
);

export default function AdminPlatform() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("view") || "social");
  const [isApproving, setIsApproving] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [networkUsers, setNetworkUsers] = useState([
    { id: "u1", name: "Dakar Logistics Hub", role: "Wholesaler", status: "Active", kyc: "Verified", date: "2026-01-10", city: "Dakar", karma: 998 },
    { id: "u2", name: "Supermarché Al-Amine", role: "Boutique", status: "Active", kyc: "Verified", date: "2026-02-14", city: "Dakar", karma: 942 },
    { id: "u4", name: "Boutique Ndiaye", role: "Boutique", status: "Pending", kyc: "In Review", date: "2026-03-20", city: "Guédiawaye", karma: 750 },
    { id: "u5", name: "Alpha Transport", role: "Driver", status: "Pending", kyc: "Waiting Docs", date: "2026-03-25", city: "Thiès", karma: 410 },
  ]);

  useEffect(() => {
    const view = searchParams.get("view");
    if (view && view !== activeTab) {
      setActiveTab(view);
    }
  }, [searchParams]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams({ view: id });
  };

  const { data: socialPosts, loading: socialLoading } = useSocialFeed();

  const handleApprove = (id) => {
    setIsApproving(id)
    setTimeout(() => {
      setIsApproving(null)
      setNetworkUsers(prev => prev.map(u => u.id === id ? { ...u, status: "Active", kyc: "Verified" } : u));
      alert(`Partenaire approuvé ! Le contrat intelligent (Smart Contract) d'adhésion a été scellé sur la LiviChain.`);
    }, 1500);
  };

  const handleAction = (name) => {
    alert(`Régulation: Action "${name}" exécutée.`);
  }

  const StatsHeader = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 32 }}>
       <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Indice de Santé Réseau</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>98.2%</div>
          <div style={{ fontSize: 11, color: VISION_GREEN, marginTop: 4 }}>+2.5% vs Q4</div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>MEMBRES CERTIFIÉS</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>4,284</div>
       </Card>
       <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>TRANSACTIONS B2B / JOUR</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>12.4M F</div>
       </Card>
    </div>
  );

  const renderUsers = () => {
    const pending = networkUsers.filter(u => u.status === "Pending");
    const active = networkUsers.filter(u => u.status === "Active");

    return (
      <div className="animate-fade-in">
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>Validation des Nouveaux Partenaires</h3>
        {pending.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20, marginBottom: 40 }}>
            {pending.map(user => (
              <Card key={user.id} style={{ border: `1px solid ${GOLD}40`, background: `${GOLD}05` }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                       <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                          {user.role === 'Boutique' ? <Store size={20} color="#6366f1" /> : <Truck size={20} color={GOLD} />}
                       </div>
                       <div>
                          <div style={{ fontSize: 15, fontWeight: 900 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{user.city} · Inscription: {user.date}</div>
                       </div>
                    </div>
                    <Badge text={user.kyc} color="#92400e" bg="#fef3c7" />
                 </div>
                 <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", padding: 10, borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Audit Dossier</button>
                    <button onClick={() => handleApprove(user.id)} disabled={isApproving === user.id} style={{ flex: 1, background: VISION_GREEN, color: "#fff", border: "none", padding: 10, borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: isApproving === user.id ? "wait" : "pointer" }}>
                       {isApproving === user.id ? "Validation..." : "Approuver"}
                    </button>
                 </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40, background: "#f8fafc", borderRadius: 24, marginBottom: 40 }}>
             <ShieldCheck size={40} color={VISION_GREEN} style={{ margin: "0 auto 12px" }} />
             <p style={{ fontSize: 14, color: "#64748b" }}>Aucun dossier en attente de validation.</p>
          </div>
        )}

        <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Annuaire du Réseau National</h3>
        <Card style={{ padding: 0, overflowX: "auto" }}>
           <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                 <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "20px", fontSize: 12, color: "#64748b" }}>MEMBRE</th>
                    <th style={{ padding: "20px", fontSize: 12, color: "#64748b" }}>TYPE</th>
                    <th style={{ padding: "20px", fontSize: 12, color: "#64748b" }}>SCORE KARMA</th>
                    <th style={{ padding: "20px", fontSize: 12, color: "#64748b" }}>STATUS</th>
                 </tr>
              </thead>
              <tbody>
                 {active.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                       <td style={{ padding: "20px", fontSize: 14, fontWeight: 800 }}>{u.name}</td>
                       <td style={{ padding: "20px" }}><Badge text={u.role} color={GOLD} bg={`${GOLD}10`} /></td>
                       <td style={{ padding: "20px", fontSize: 14, fontWeight: 950, color: VISION_GREEN }}>{u.karma} pts</td>
                       <td style={{ padding: "20px" }}><Badge text="CERTIFIÉ" color={VISION_GREEN} bg="#ecfdf5" /></td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </Card>
      </div>
    );
  };

  return (
    <DashboardShell title="Autorité de Régulation LiviPro" role="admin">
       <StatsHeader />

       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "social", label: "Flux Réseau", icon: <Globe size={16} /> },
          { id: "users", label: "Partenaires", icon: <Users size={16} /> },
          { id: "compliance", label: "Audit KYC", icon: <FileCheck size={16} /> },
          { id: "atlas", label: "Atlas Géo", icon: <Navigation size={16} /> },
          { id: "security", label: "Sécurité", icon: <ShieldAlert size={16} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ background: activeTab === tab.id ? DARK_NAVY : "#fff", color: activeTab === tab.id ? "#fff" : "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{tab.label}</button>
        ))}
      </div>

       <div style={{ background: "#fff", borderRadius: 28, padding: 32, border: "1px solid #e2e8f0" }}>
          {activeTab === "social" && (
            <div className="animate-fade-in">
               <div style={{ background: `linear-gradient(135deg, ${DARK_NAVY} 0%, #1e293b 100%)`, borderRadius: 24, padding: 32, color: "#fff", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900 }}>Communication Officielle</h2>
                    <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Régulez les échanges et publiez des directives nationales.</p>
                  </div>
                  <button onClick={() => handleAction("Nouvelle Directive")} style={{ background: GOLD, color: DARK_NAVY, border: "none", padding: "12px 24px", borderRadius: 14, fontWeight: 900, cursor: "pointer" }}>Publier Direction</button>
               </div>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                  {socialPosts.map(post => (
                    <Card key={post.id}>
                       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                          <div style={{ width: 40, height: 40, background: GOLD, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>{post.author_name[0]}</div>
                          <div>
                             <div style={{ fontSize: 14, fontWeight: 800 }}>{post.author_name}</div>
                             <div style={{ fontSize: 10, color: "#94a3b8" }}>{post.time}</div>
                          </div>
                       </div>
                       <p style={{ fontSize: 13, color: DARK_NAVY, lineHeight: 1.6, marginBottom: 16 }}>{post.text}</p>
                       <div style={{ display: "flex", gap: 20 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", cursor: "pointer" }}><Heart size={16} /> {post.likes}</div>
                          <div onClick={() => handleAction("Promotion Directive")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", cursor: "pointer" }}><Zap size={16} /> Promouvoir</div>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          )}
          {activeTab === "users" && renderUsers()}
          {activeTab === "compliance" && <DocumentVault />}
          {activeTab === "atlas" && <LiviMap />}
          {activeTab === "security" && (
            <div className="animate-fade-in">
               <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>Centre de Détection de Fraude IA</h2>
               <Card style={{ borderLeft: "6px solid #ef4444", background: "#fef2f2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontWeight: 900, fontSize: 14 }}>
                           <ShieldAlert size={18} /> ALERTE CRITIQUE
                        </div>
                        <p style={{ fontSize: 14, color: "#451a03", marginTop: 8, fontWeight: 600 }}>Tentative de double retrait LiviCash détectée sur le point de vente #BK-922.</p>
                     </div>
                     <Badge text="IMMÉDIAT" color="#fff" bg="#ef4444" />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                     <button onClick={() => handleAction("Isolation Système")} style={{ flex: 1, background: DARK_NAVY, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Isoler le Terminal</button>
                     <button onClick={() => handleAction("Neutralisation")} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Suspendre le Membre</button>
                  </div>
               </Card>
            </div>
          )}
       </div>
    </DashboardShell>
  );
}
