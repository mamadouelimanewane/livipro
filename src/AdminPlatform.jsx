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
  Heart
} from "lucide-react";
import { useSocialFeed, useMembers } from "./useLiviData";
import DashboardShell from "./components/DashboardShell";
import { useSearchParams } from "react-router-dom";

// --- DATA SIMULATION ---
const USERS = [
  { id: "u1", name: "Dakar Logistics Hub", role: "Wholesaler", status: "Active", kyc: "Verified", date: "2026-01-10", city: "Dakar", karma: 998 },
  { id: "u2", name: "Supermarché Al-Amine", role: "Boutique", status: "Active", kyc: "Verified", date: "2026-02-14", city: "Dakar", karma: 942 },
  { id: "u3", name: "Ousmane Diallo", role: "Driver", status: "Active", kyc: "Verified", date: "2026-01-05", city: "Pikine", karma: 975 },
  { id: "u4", name: "Boutique Ndiaye", role: "Boutique", status: "Pending", kyc: "In Review", date: "2026-03-20", city: "Guédiawaye", karma: 750 },
  { id: "u5", name: "Alpha Transport", role: "Driver", status: "Pending", kyc: "Waiting Docs", date: "2026-03-25", city: "Thiès", karma: 410 },
];

const SECURITY_ALERTS = [
  { id: "a1", type: "Fraud", message: "Tentative de double dépôt LiviCash - Boutique X", time: "10 mins ago", level: "High" },
  { id: "a2", type: "Access", message: "Connexion inhabituelle Chauffeur-9824 (GPS Médina)", time: "1 hour ago", level: "Low" }
];

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

// --- UI COMPONENTS ---
const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

const Badge = ({ text, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 10, color, background: bg, textTransform: "uppercase" }}>{text}</span>
);

export default function AdminPlatform() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("view") || "social");
  const [isApproving, setIsApproving] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

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
  const { data: members, loading: membersLoading } = useMembers();

  const handleApprove = (id) => {
    setIsApproving(id)
    setTimeout(() => {
      setIsApproving(null)
      alert(`Partenaire ${id} approuvé ! Son accès au réseau LiviPro est désormais actif.`);
    }, 1200);
  };

  const handleAction = (name) => {
    alert(`Action "${name}" : Opération exécutée sur le Backbone Admin LiviPro.`);
  }

  const StatsHeader = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 30 }}>
      {[
        { label: "Membres Actifs", value: "4,284", icon: <Users />, color: GOLD },
        { label: "Volume B2B (24h)", value: "12,4M FCFA", icon: <CircleDollarSign />, color: VISION_GREEN },
        { label: "Indice Réseau", value: "98.2%", icon: <ShieldCheck />, color: "#6366f1" },
        { label: "Alertes Fraude", value: SECURITY_ALERTS.length, icon: <ShieldAlert />, color: "#ef4444" },
      ].map((stat, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: `${stat.color}15`, color: stat.color, padding: 12, borderRadius: 12 }}>{stat.icon}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{stat.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderUsers = () => {
    const pendingUsers = USERS.filter(u => u.status === "Pending" && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const activeUsers = USERS.filter(u => u.status === "Active" && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="animate-fade-in">
        <div style={{ display: "flex", flexDirection: window.innerWidth > 768 ? "row" : "column", justifyContent: "space-between", alignItems: window.innerWidth > 768 ? "center" : "flex-start", gap: 20, marginBottom: 30 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900 }}>Validation & Annuaire Partenaires</h2>
              <p style={{ fontSize: 14, color: "#64748b" }}>Gérez les entrées au réseau, la conformité KYC et les scores de Karma.</p>
            </div>
            <div style={{ display: "flex", gap: 12, width: window.innerWidth > 768 ? "auto" : "100%" }}>
              <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher membre..." 
                  style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: "100%" }} 
                />
              </div>
              <button 
                onClick={() => handleAction("Ajouter Partenaire")}
                style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 14, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <UserPlus size={18} /> <span style={{ display: window.innerWidth > 600 ? "inline" : "none" }}>Inscription</span>
              </button>
            </div>
        </div>

        {/* PENDING APPROVAL SECTION */}
        {pendingUsers.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <ShieldAlert size={20} color={GOLD} />
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>En attente de validation KYC</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
                {pendingUsers.map(user => (
                  <Card key={user.id} style={{ border: `1px solid ${GOLD}40`, background: `${GOLD}05` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <div style={{ background: "#fff", width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                              {user.role === "Boutique" ? <Store size={22} color="#6366f1" /> : user.role === "Wholesaler" ? <Building size={22} color={GOLD} /> : <Truck size={22} color={VISION_GREEN} />}
                          </div>
                          <div>
                              <div style={{ fontSize: 15, fontWeight: 800 }}>{user.name}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>{user.role} • {user.city}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Date d'inscription: {user.date}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Badge text={user.kyc} color="#92400e" bg="#fef3c7" />
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, fontWeight: 700 }}>{user.karma} pts</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                        <button 
                          onClick={() => handleAction(`Inspecter KYC ${user.name}`)}
                          style={{ flex: 1, background: "#fff", color: DARK_NAVY, border: "1px solid #e2e8f0", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                        >
                          Vérifier Dossier
                        </button>
                        <button 
                          onClick={() => handleApprove(user.id)}
                          disabled={isApproving === user.id}
                          style={{ flex: 1, background: VISION_GREEN, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: isApproving === user.id ? "wait" : "pointer" }}
                        >
                          {isApproving === user.id ? "Validation..." : "Approuver au Réseau"}
                        </button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Annuaire Officiel des Partenaires</h3>
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
                <tr style={{ borderBottom: "2px solid #f8fafc", textAlign: "left" }}>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>MEMBRE</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>TYPE</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>LOCALISATION</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800 }}>KARMA</th>
                   <th style={{ padding: "16px", color: "#64748b", fontSize: 12, fontWeight: 800, textAlign: "right" }}>ACTIONS</th>
                </tr>
             </thead>
             <tbody>
                {activeUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                     <td style={{ padding: "16px" }}>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{user.name}</div>
                     </td>
                     <td style={{ padding: "16px" }}>
                        <Badge text={user.role} color={GOLD} bg={`${GOLD}15`} />
                     </td>
                     <td style={{ padding: "16px", fontSize: 13, color: "#64748b" }}>{user.city}</td>
                     <td style={{ padding: "16px" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: VISION_GREEN }}>{user.karma} <span style={{ fontSize: 10, fontWeight: 400, color: "#94a3b8" }}>pts</span></div>
                     </td>
                     <td style={{ padding: "16px", textAlign: "right" }}>
                        <button 
                          onClick={() => handleAction(`Edit ${user.name}`)}
                          style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                        >
                          <MoreVertical size={18} />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </Card>
      </div>
    );
  }

  const renderSocial = () => (
    <div className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1a5276 0%, #0f172a 100%)', borderRadius: 24, padding: '24px 30px', marginBottom: 32, color: '#fff', display: 'flex', flexDirection: window.innerWidth > 768 ? "row" : "column", alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 40 }}>🇸🇳</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.5 }}>Autorité de Régulation LiviPro</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Gouvernance B2B & Flux Nationaux</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6, lineHeight: 1.4 }}>Supervision de l'approvisionnement stratégique et régulation des prix marché.</div>
          </div>
        </div>
        <button 
          onClick={() => handleAction("Console Stratégique")}
          style={{ background: GOLD, border: 'none', color: DARK_NAVY, padding: '14px 28px', borderRadius: 14, fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", fontSize: 13 }}
        >
          Console Stratégique
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
        {socialLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 100 }}>🔍 Analyse des données en cours...</div>
        ) : (
          socialPosts.map(post => (
            <Card key={post.id} style={{ borderLeft: post.author_name?.includes('Ministère') ? `6px solid #1a5276` : `6px solid ${GOLD}` }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: post.author_name?.includes('Ministère') ? '#1a5276' : GOLD, width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                      {post.author_name?.includes('Ministère') ? '🇸🇳' : (post.author_name || 'L')[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{post.author_name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{post.time}</div>
                    </div>
                  </div>
                  <button onClick={() => handleAction("Menu Social")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><MoreVertical size={18} /></button>
               </div>
               <p style={{ fontSize: 14, color: DARK_NAVY, lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>{post.text}</p>
               <div style={{ display: "flex", gap: 24, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <div 
                    onClick={() => handleAction("Like")}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#ef4444", fontWeight: 800, cursor: "pointer" }}
                  >
                    <Heart size={18} fill="#ef4444" /> {post.likes}
                  </div>
                  <div 
                    onClick={() => handleAction("Répondre")}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b", fontWeight: 800, cursor: "pointer" }}
                  >
                    <MessageSquare size={18} /> RÉPONDRE
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <DashboardShell title={activeTab === 'social' ? 'Supervision du Réseau National' : activeTab === 'users' ? 'Validation des Partenaires' : activeTab === 'compliance' ? 'Vault & Certification KYC' : activeTab === 'security' ? 'Centre de Cyber-Sécurité' : 'Atlas Tracking Logistique'} role="admin">
      <StatsHeader />
      
      <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "social", label: "Flux Réseau", icon: <Globe size={16} /> },
          { id: "users", label: "Valid. Partenaires", icon: <Users size={16} /> },
          { id: "compliance", label: "Certification KYC", icon: <FileCheck size={16} /> },
          { id: "security", label: "Sécurité Réseau", icon: <ShieldAlert size={16} /> },
          { id: "track", label: "Atlas Tracking", icon: <Navigation size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => handleTabChange(tab.id)} 
            style={{ 
              background: activeTab === tab.id ? DARK_NAVY : "#fff", 
              color: activeTab === tab.id ? "#fff" : "#64748b",
              border: "1px solid #e2e8f0",
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: activeTab === tab.id ? "0 8px 25px rgba(0,0,0,0.05)" : "none",
              whiteSpace: "nowrap"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 28, padding: window.innerWidth > 768 ? 32 : 20, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.02)" }}>
        {activeTab === "social" && renderSocial()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "compliance" && <DocumentVault />}
        {activeTab === "security" && (
            <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>Menaces & Intégrité du Système</h3>
                {SECURITY_ALERTS.map(alert => (
                    <Card key={alert.id} style={{ marginBottom: 16, borderLeft: `6px solid #ef4444`, background: "#fffafb" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                               <div style={{ fontSize: 14, fontWeight: 800, color: "#991b1b" }}>{alert.type}</div>
                               <p style={{ fontSize: 14, color: "#64748b", marginTop: 8, fontWeight: 500 }}>{alert.message}</p>
                            </div>
                            <Badge text={alert.level} color="#fff" bg="#ef4444" />
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                          <button 
                            onClick={() => handleAction("Investigation Sécurité")}
                            style={{ flex: 1, background: DARK_NAVY, color: "#fff", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                          >
                            Démarrer Enquête
                          </button>
                          <button 
                            onClick={() => handleAction("Neutraliser")}
                            style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                          >
                            Neutraliser l'accès
                          </button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
        {activeTab === "track" && <LiviTrack />}
      </div>
    </DashboardShell>
  );
}
