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

// --- DATA SIMULATION ---
const USERS = [
  { id: "u1", name: "Dakar Logistics Hub", role: "Wholesaler", status: "Active", kyc: "Verified", date: "2026-01-10", city: "Dakar" },
  { id: "u2", name: "Supermarché Al-Amine", role: "Boutique", status: "Active", kyc: "Verified", date: "2026-02-14", city: "Dakar" },
  { id: "u3", name: "Ousmane Diallo", role: "Driver", status: "Active", kyc: "Verified", date: "2026-01-05", city: "Pikine" },
  { id: "u4", name: "Boutique Ndiaye", role: "Boutique", status: "Pending", kyc: "In Review", date: "2026-03-20", city: "Guédiawaye" },
  { id: "u5", name: "Alpha Transport", role: "Driver", status: "Pending", kyc: "Waiting Docs", date: "2026-03-25", city: "Thiès" },
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
  const [activeTab, setActiveTab] = useState("social");
  const [isApproving, setIsApproving] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  
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
    alert(`Action "${name}" : Fonctionnalité en cours de déploiement.`);
  }

  const StatsHeader = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 30 }}>
      {[
        { label: "Membres Actifs", value: "4,284", icon: <Users />, color: GOLD },
        { label: "Volume B2B (24h)", value: "12,4M FCFA", icon: <CircleDollarSign />, color: VISION_GREEN },
        { label: "Score Réseau", value: "98.2%", icon: <ShieldCheck />, color: "#6366f1" },
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
              <p style={{ fontSize: 13, color: "#64748b" }}>Gérez les entrées au réseau et la conformité KYC.</p>
            </div>
            <div style={{ display: "flex", gap: 12, width: window.innerWidth > 768 ? "auto" : "100%" }}>
              <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrer..." 
                  style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: "100%" }} 
                />
              </div>
              <button 
                onClick={() => handleAction("Inscription Manuelle")}
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
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>En attente de validation</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
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
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Inscrit le {user.date}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Badge text={user.kyc} color="#92400e" bg="#fef3c7" />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                        <button 
                          onClick={() => handleAction(`Vérifier KYC ${user.name}`)}
                          style={{ flex: 1, background: "#f8fafc", color: DARK_NAVY, border: "1px solid #e2e8f0", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                        >
                          Vérifier KYC
                        </button>
                        <button 
                          onClick={() => handleApprove(user.id)}
                          disabled={isApproving === user.id}
                          style={{ flex: 1, background: VISION_GREEN, color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: isApproving === user.id ? "wait" : "pointer" }}
                        >
                          {isApproving === user.id ? "Validation..." : "Approuver"}
                        </button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Membres Actifs</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {activeUsers.length > 0 ? activeUsers.map(user => (
            <Card key={user.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
               <div style={{ background: "#f8fafc", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user.role === "Wholesaler" ? <Building size={20} color={GOLD} /> : user.role === "Boutique" ? <Store size={20} color="#6366f1" /> : <Truck size={20} color="#10b981" />}
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{user.role} • {user.city}</div>
               </div>
               <div style={{ textAlign: "right" }}>
                  <Badge text="Actif" color={VISION_GREEN} bg="#ecfdf5" />
               </div>
            </Card>
          )) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#94a3b8" }}>Aucun partenaire trouvé.</div>
          )}
        </div>
      </div>
    );
  }

  const renderSocial = () => (
    <div className="animate-fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1a5276 0%, #0f172a 100%)', borderRadius: 24, padding: '24px 30px', marginBottom: 30, color: '#fff', display: 'flex', flexDirection: window.innerWidth > 768 ? "row" : "column", alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 40 }}>🇸🇳</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 1 }}>Protocole Officiel</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Gouvernance LiviPro & Ministère du Commerce</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Surveillance du marché et régulation de la chaîne d'approvisionnement en temps réel.</div>
          </div>
        </div>
        <button 
          onClick={() => handleAction("Admin Console Ministry")}
          style={{ background: GOLD, border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Console Gouv
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
        {socialLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 100 }}>⏳ Syncing with Supabase...</div>
        ) : (
          socialPosts.map(post => (
            <Card key={post.id} style={{ borderLeft: post.author_name?.includes('Ministère') ? `5px solid #1a5276` : '5px solid transparent' }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: post.author_name?.includes('Ministère') ? '#1a5276' : GOLD, width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                      {post.author_name?.includes('Ministère') ? '🇸🇳' : (post.author_name || 'L')[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{post.author_name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{post.time}</div>
                    </div>
                  </div>
                  <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><MoreVertical size={18} /></button>
               </div>
               <p style={{ fontSize: 14, color: DARK_NAVY, lineHeight: 1.6, marginBottom: 20 }}>{post.text}</p>
               <div style={{ display: "flex", gap: 20, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <div 
                    onClick={() => alert("Like ajouté !")}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#ef4444", fontWeight: 800, cursor: "pointer" }}
                  >
                    <Heart size={16} fill="#ef4444" /> {post.likes}
                  </div>
                  <div 
                    onClick={() => handleAction("Commenter")}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 800, cursor: "pointer" }}
                  >
                    <MessageSquare size={16} /> RÉPONDRE
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <DashboardShell title="Console Administration Master" role="admin">
      <StatsHeader />
      
      {/* TABS FOR DESKTOP */}
      <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "social", label: "Flux Réseau", icon: <MessageSquare size={16} /> },
          { id: "users", label: "Partenaires", icon: <Users size={16} /> },
          { id: "compliance", label: "Documents & KYC", icon: <FileCheck size={16} /> },
          { id: "security", label: "Cyber-Sécurité", icon: <ShieldAlert size={16} /> },
          { id: "track", label: "Atlas Tracking", icon: <Navigation size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
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
              boxShadow: activeTab === tab.id ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
              whiteSpace: "nowrap"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 28, padding: window.innerWidth > 768 ? 32 : 20, border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
        {activeTab === "social" && renderSocial()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "compliance" && <DocumentVault />}
        {activeTab === "security" && (
            <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Alertes de Sécurité Critique</h3>
                {SECURITY_ALERTS.map(alert => (
                    <Card key={alert.id} style={{ marginBottom: 12, borderLeft: `5px solid #ef4444` }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{alert.type}</div>
                            <Badge text={alert.level} color="#fff" bg="#ef4444" />
                        </div>
                        <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>{alert.message}</p>
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                          <button 
                            onClick={() => handleAction("Investigation Sécurité")}
                            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                          >
                            Enquêter
                          </button>
                          <button 
                            onClick={() => handleAction("Réinitialisation Sécurité")}
                            style={{ background: "#ef444415", border: "none", color: "#ef4444", padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                          >
                            Réinitialiser
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
