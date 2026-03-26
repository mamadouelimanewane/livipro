import { useState } from "react";
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
  AlertTriangle
} from "lucide-react";

// --- DATA SIMULATION ---
const USERS = [
  { id: "u1", name: "Dakar Logistics Hub", role: "Wholesaler", status: "Active", kyc: "Verified", date: "2026-01-10" },
  { id: "u2", name: "Supermarché Al-Amine", role: "Boutique", status: "Active", kyc: "Verified", date: "2026-02-14" },
  { id: "u3", name: "Ousmane Diallo", role: "Driver", status: "Active", kyc: "Verified", date: "2026-01-05" },
  { id: "u4", name: "Boutique Ndiaye", role: "Boutique", status: "Pending", kyc: "In Review", date: "2026-03-20" },
];

const SECURITY_ALERTS = [
  { id: "a1", type: "Fraud", message: "Tentative de double dépôt LiviCash - Boutique X", time: "10 mins ago", level: "High" },
  { id: "a2", type: "Access", message: "Connexion inhabituelle Chauffeur-9824 (GPS Médina)", time: "1 hour ago", level: "Low" }
];

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";

// --- UI COMPONENTS ---
const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

const Badge = ({ text, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 10, color, background: bg, textTransform: "uppercase" }}>{text}</span>
);

export default function AdminPlatform() {
  const [activeTab, setActiveTab] = useState("users"); // users | onboarding | security | settings
  const [onboardingRole, setOnboardingRole] = useState(null);

  const renderUsers = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900 }}>Annuaire & Rôles</h2>
          <button onClick={() => setActiveTab("onboarding")} style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 14, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <UserPlus size={18} /> Inscrire
          </button>
       </div>

       <div style={{ background: "#fff", borderRadius: 16, padding: "12px 16px", border: "1px solid #e2e8f0", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={18} color="#94a3b8" />
          <input placeholder="Rechercher un partenaire..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14 }} />
          <Filter size={18} color="#94a3b8" />
       </div>

       {USERS.map(user => (
         <Card key={user.id} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "#f8fafc", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
               {user.role === "Wholesaler" ? <Building size={20} color={GOLD} /> : user.role === "Boutique" ? <Store size={20} color="#6366f1" /> : <Truck size={20} color="#10b981" />}
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: 14, fontWeight: 800 }}>{user.name}</div>
               <div style={{ fontSize: 11, color: "#64748b" }}>{user.role} · Inscription: {user.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
               <Badge text={user.kyc} color={user.kyc === "Verified" ? "#10b981" : "#f59e0b"} bg={user.kyc === "Verified" ? "#ecfdf5" : "#fef3c7"} />
            </div>
         </Card>
       ))}
    </div>
  );

  const renderOnboarding = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       <button onClick={() => setActiveTab("users")} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontWeight: 700, color: DARK_NAVY }}>
          <ArrowLeft size={20} /> Retour
       </button>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Inscription Associé</h2>
       <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>Choisissez le type de compte à créer pour lancer le processus KYC LiviPro.</p>

       <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {[
            { role: "Wholesaler", icon: <Building size={24} />, label: "Grossiste Hub", color: GOLD, desc: "Accès au capital et à la gestion de flotte." },
            { role: "Boutique", icon: <Store size={24} />, label: "Boutique Partenaire", color: "#6366f1", desc: "Accès au micro-crédit et Tontine." },
            { role: "Driver", icon: <Truck size={24} />, label: "Chauffeur", color: "#10b981", desc: "Suivi des tournées et LiviCash." }
          ].map(opt => (
            <div key={opt.role} style={{ background: "#fff", border: "2px solid #f1f5f9", borderRadius: 24, padding: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 20 }}>
               <div style={{ background: opt.color, width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  {opt.icon}
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{opt.desc}</div>
               </div>
            </div>
          ))}
       </div>

       <div style={{ marginTop: 40, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 24, padding: 30, color: "#fff", position: "relative", overflow: "hidden" }}>
          <FileCheck size={100} style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.1 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>KYC IA Automatisé</h3>
          <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5, marginBottom: 24 }}>Tous les documents (Ninea, CNI, Patent) sont audités par notre algorithme de certification avant ouverture du compte.</p>
          <button style={{ background: GOLD, border: "none", color: "#fff", padding: "14px 24px", borderRadius: 14, fontWeight: 900 }}>Configurer Scanner Document</button>
       </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Dashboard Sécurité</h2>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 20, border: "1px solid #f1f5f9" }}>
             <div style={{ color: "#10b981", marginBottom: 8 }}><ShieldCheck size={24} /></div>
             <div style={{ fontSize: 28, fontWeight: 900 }}>100%</div>
             <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>SYSTÈME OK</div>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 20, border: "1px solid #f1f5f9" }}>
             <div style={{ color: "#ef4444", marginBottom: 8 }}><Lock size={24} /></div>
             <div style={{ fontSize: 28, fontWeight: 900 }}>24/s</div>
             <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>REQUÊTES IA</div>
          </div>
       </div>

       <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle color="#f43f5e" size={20} /> Alertes Fraude & Risques
       </h3>
       {SECURITY_ALERTS.map(alert => (
         <Card key={alert.id} style={{ marginBottom: 12, borderLeft: alert.level === "High" ? `5px solid #ef4444` : `5px solid #f59e0b` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
               <Badge text={alert.type} color={alert.level === "High" ? "#ef4444" : "#f59e0b"} bg={alert.level === "High" ? "#fee2e2" : "#fef3c7"} />
               <span style={{ fontSize: 11, color: "#94a3b8" }}>{alert.time}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{alert.message}</div>
         </Card>
       ))}
       
       <button style={{ width: "100%", background: "#f1f5f9", color: DARK_NAVY, border: "none", padding: 14, borderRadius: 14, fontWeight: 800, marginTop: 20 }}>
          Voir Historique des Connexions
       </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#f8fafc", minHeight: "100vh", position: "relative", fontFamily: "'Inter', sans-serif" }}>
       
       <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.4s ease-out; }
       `}</style>

       {/* HEADER PLATFORM */}
       <div style={{ background: DARK_NAVY, color: "#fff", padding: "40px 24px 20px", borderRadius: "0 0 32px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
             <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>Master Admin</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>Console LiviPro</div>
             </div>
             <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={22} />
             </div>
          </div>
          
          <div style={{ display: "flex", gap: 10, paddingBottom: 10, overflowX: "auto" }}>
             {[
               { id: "users", icon: <Users size={18} />, label: "Membres" },
               { id: "onboarding", icon: <UserPlus size={18} />, label: "Inscription" },
               { id: "security", icon: <ShieldCheck size={18} />, label: "Sécurité" },
               { id: "stats", icon: <BarChart3 size={18} />, label: "Métriques" }
             ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, background: activeTab === tab.id ? GOLD : "rgba(255,255,255,0.1)", color: activeTab === tab.id ? DARK_NAVY : "#fff", border: "none", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  {tab.icon} {tab.label}
               </button>
             ))}
          </div>
       </div>

       <div style={{ paddingBottom: 100 }}>
          {activeTab === "users" && renderUsers()}
          {activeTab === "onboarding" && renderOnboarding()}
          {activeTab === "security" && renderSecurity()}
       </div>

       <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
          <button style={{ background: GOLD, color: "#fff", border: "none", width: 60, height: 60, borderRadius: "50%", boxShadow: "0 10px 30px rgba(245, 158, 11, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Unlock size={24} />
          </button>
       </div>
    </div>
  );
}
