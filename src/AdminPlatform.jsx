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

const INDEPENDENT_DRIVERS = [
  { id: "d1", name: "Ibrahima Fall", status: "Disponible", rating: 4.8, commission: "5%", type: "Freelance" },
  { id: "d2", name: "Samba Ka", status: "En Course", rating: 4.9, commission: "5%", type: "Freelance" },
  { id: "d3", name: "Moussa Sow", status: "Indépendant", rating: 4.5, commission: "7%", type: "Freelance" },
];

const COMMISSION_CONFIG = [
  { id: "c1", label: "Commission LiviPay (Transaction)", value: 1.5, type: "percent" },
  { id: "c2", label: "Commission Livreur Indépendant", value: 5.0, type: "percent" },
  { id: "c3", label: "Frais de Service Grossiste (Mensuel)", value: 100000, type: "flat" },
  { id: "c4", label: "Marge Crédit IA (Spread)", value: 2.0, type: "percent" },
];

const COMPLIANCE_DOCS = [
  { id: "d1", owner: "Ibrahima Fall", type: "Permis de Conduire", expiry: "12/2027", status: "Valid", category: "Livreur" },
  { id: "d2", owner: "Camion DK-2938-A", type: "Assurance AXA", expiry: "04/2026", status: "Warning", category: "Véhicule" },
  { id: "d3", owner: "Samba Ka", type: "Visite Technique", expiry: "01/2026", status: "Expired", category: "Véhicule" },
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
  const [activeTab, setActiveTab] = useState("social"); // social | users | onboarding | security | settings
  const [onboardingRole, setOnboardingRole] = useState(null);
  const { data: socialPosts, loading: socialLoading } = useSocialFeed();
  const { data: members, loading: membersLoading } = useMembers();

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
       <button onClick={() => setActiveTab("social")} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontWeight: 700, color: DARK_NAVY }}>
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
    </div>
  );

  const renderRevenue = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Modèle Économique</h2>
       <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Voici comment vous, en tant que propriétaire, monétisez LiviPro.</p>

       <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {[
            { label: "Commissions Paiements (1.5%)", value: "842,500 F", trend: "+12%", color: "#10b981", desc: "Prélèvement sur LiviPay & LiviCash." },
            { label: "Abonnements SaaS Grossistes", value: "1,250,000 F", trend: "Fixe", color: GOLD, desc: "Frais de service infrastructure (100k/mois/grossiste)." },
            { label: "Marge Crédit IA (2%)", value: "450,000 F", trend: "+5%", color: "#6366f1", desc: "Différence de taux sur les prêts débloqués." },
            { label: "LiviAds (Promos Flash)", value: "320,000 F", trend: "+40%", color: "#f97316", desc: "Revenus publicitaires des grossistes." },
            { label: "Frais Service Tontine", value: "185,200 F", trend: "+20%", color: "#ec4899", desc: "Gestion des cycles d'épargne automatisés." }
          ].map((rev, idx) => (
            <Card key={idx} style={{ position: "relative" }}>
               <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>{rev.label}</div>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: DARK_NAVY }}>{rev.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: rev.color }}>{rev.trend}</div>
               </div>
               <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, fontStyle: "italic" }}>{rev.desc}</div>
            </Card>
          ))}
       </div>

       <div style={{ marginTop: 32, padding: 24, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: 24, color: "#fff" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Total Revenus (Net)</h3>
          <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>2,727,700 FCFA</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Période: Mars 2026 (En cours)</div>
       </div>
    </div>
  );

  const renderCommissions = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Paramétrage Commissions</h2>
       <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Réglage global des prélèvements du propriétaire.</p>

       {COMMISSION_CONFIG.map(config => (
         <Card key={config.id} style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
               <div style={{ fontSize: 14, fontWeight: 800 }}>{config.label}</div>
               <div style={{ fontSize: 11, color: "#94a3b8" }}>Type: {config.type === "percent" ? "Pourcentage" : "Forfaitaire"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <input defaultValue={config.value} style={{ width: 60, padding: 8, borderRadius: 10, border: "2px solid #e2e8f0", fontWeight: 900, textAlign: "center" }} />
               <span style={{ fontWeight: 800 }}>{config.type === "percent" ? "%" : "F"}</span>
            </div>
         </Card>
       ))}
    </div>
  );

  const renderCompliance = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Conformité & Assurances</h2>
       <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Gestion administrative des livreurs et de la flotte.</p>

       <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {["Tous", "Livreur", "Véhicule"].map(cat => (
            <button key={cat} style={{ background: "#fff", border: "1px solid #f1f5f9", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800, color: "#64748b" }}>{cat}</button>
          ))}
       </div>

       {COMPLIANCE_DOCS.map(doc => (
         <Card key={doc.id} style={{ marginBottom: 16, borderLeft: doc.status === 'Expired' ? '4px solid #ef4444' : doc.status === 'Warning' ? '4px solid #f59e0b' : '4px solid #10b981' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
               <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ background: "#f8fafc", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <FileText size={20} color={DARK_NAVY} />
                  </div>
                  <div>
                     <div style={{ fontSize: 15, fontWeight: 800 }}>{doc.type}</div>
                     <div style={{ fontSize: 11, color: "#94a3b8" }}>{doc.owner} · {doc.category}</div>
                  </div>
               </div>
               <Badge text={doc.status} color={doc.status === 'Expired' ? "#ef4444" : doc.status === 'Warning' ? "#f59e0b" : "#10b981"} bg={doc.status === 'Expired' ? "#fee2e2" : doc.status === 'Warning' ? "#fef3c7" : "#ecfdf5"} />
            </div>
            
            <div style={{ marginTop: 12, display: 'flex', gap: 4 }}>
               <div style={{ height: 4, flex: 1, background: '#10b981', borderRadius: 2 }}></div>
               <div style={{ height: 4, flex: 1, background: doc.status === 'Valid' ? '#10b981' : '#e2e8f0', borderRadius: 2 }}></div>
               <div style={{ height: 4, flex: 1, background: doc.status === 'Valid' ? '#10b981' : '#e2e8f0', borderRadius: 2 }}></div>
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>WORKFLOW: ÉMIS -{'>'} VÉRIFIÉ -{'>'} ARCHIVÉ</div>
         </Card>
       ))}
    </div>
  );

  const renderSocial = () => (
    <div className="animate-fade-in" style={{ padding: 24 }}>
       {/* Bannière Sponsor Ministère */}
       <div style={{ background: 'linear-gradient(135deg, #1a5276 0%, #0f172a 100%)', borderRadius: 20, padding: '16px 20px', marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>🇸🇳</div>
          <div>
             <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase' }}>Sponsor Officiel</div>
             <div style={{ fontSize: 13, fontWeight: 900 }}>Ministère du Commerce, de la Consommation et des PME</div>
             <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>République du Sénégal · Partenaire institutionnel LiviPro</div>
          </div>
       </div>

       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Flux Communautaire</h2>
       <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Alertes logistiques et opportunités partagées par le réseau.</p>
       
       {socialLoading ? (
         <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>⏳ Chargement depuis Supabase...</div>
       ) : (
         socialPosts.map(post => (
           <Card key={post.id} style={{ marginBottom: 16, borderLeft: post.author_name?.includes('Ministère') ? '4px solid #1a5276' : '4px solid transparent' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ background: post.author_name?.includes('Ministère') ? '#1a5276' : GOLD, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 12 }}>
                       {post.author_name?.includes('Ministère') ? '🇸🇳' : (post.author_name || 'L')[0]}
                    </div>
                    <div>
                       <div style={{ fontSize: 13, fontWeight: 800 }}>{post.author_name}</div>
                       {post.author_name?.includes('Ministère') && <div style={{ fontSize: 9, fontWeight: 800, color: '#1a5276' }}>✅ COMPTE OFFICIEL VÉRIFIÉ</div>}
                    </div>
                 </div>
                 <div style={{ fontSize: 11, color: "#94a3b8" }}>{post.time}</div>
              </div>
              <p style={{ fontSize: 13, color: DARK_NAVY, lineHeight: 1.5, marginBottom: 16 }}>{post.text}</p>
              <div style={{ display: "flex", gap: 16, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                    <Heart size={16} color="#ef4444" /> {post.likes}
                 </div>
                 <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                    <MessageSquare size={16} /> Répondre
                 </div>
              </div>
           </Card>
         ))
       )}
       
       <button style={{ width: "100%", background: "#fff", color: DARK_NAVY, border: "2px solid #f1f5f9", padding: 18, borderRadius: 18, fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <MessageSquare size={20} /> Diffuser une Alerte Réseau
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
             <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>Master Admin</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>Console LiviPro</div>
             </div>
             <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: VISION_GREEN }}>NETWORK HEALTH</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>98.2%</div>
             </div>
          </div>
          
          <div style={{ display: "flex", gap: 10, paddingBottom: 10, overflowX: "auto" }}>
             {[
               { id: "social", icon: <MessageSquare size={18} />, label: "Social" },
               { id: "users", icon: <Users size={18} />, label: "Membres" },
               { id: "stats", icon: <BarChart3 size={18} />, label: "Revenus" },
               { id: "track", icon: <Navigation size={18} />, label: "Tracking" },
               { id: "chain", icon: <Globe size={18} />, label: "Web3/Chain" },
               { id: "relay", icon: <TrendingUp size={18} />, label: "Relais" },
               { id: "swarm", icon: <Layers size={18} />, label: "Swarm" },
               { id: "atlas", icon: <Globe size={18} />, label: "Map" },
               { id: "compliance", icon: <FileText size={18} />, label: "Docs" },
               { id: "commissions", icon: <Percent size={18} />, label: "Prix" },
               { id: "security", icon: <ShieldCheck size={18} />, label: "Sec" },
               { id: "onboarding", icon: <UserPlus size={18} />, label: "Inscrire" }
             ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, background: activeTab === tab.id ? GOLD : "rgba(255,255,255,0.1)", color: activeTab === tab.id ? DARK_NAVY : "#fff", border: "none", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  {tab.icon} {tab.label}
               </button>
             ))}
          </div>
       </div>

       <div style={{ paddingBottom: 100 }}>
          {activeTab === "social" && renderSocial()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "onboarding" && renderOnboarding()}
          {activeTab === "security" && renderSecurity()}
          {activeTab === "stats" && renderRevenue()}
          {activeTab === "commissions" && renderCommissions()}
          {activeTab === "compliance" && renderCompliance()}
          {activeTab === "vault" && <DocumentVault />}
          {activeTab === "track" && <LiviTrack />}
          {activeTab === "chain" && <LiviChain />}
          {activeTab === "swarm" && <LiviSwarm />}
          {activeTab === "relay" && <LiviRelay />}
          {activeTab === "members" && <LiviDirectory />}
          {activeTab === "atlas" && <LiviMap />}
       </div>

       <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
          <button style={{ background: GOLD, color: "#fff", border: "none", width: 60, height: 60, borderRadius: "50%", boxShadow: "0 10px 30px rgba(245, 158, 11, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Unlock size={24} />
          </button>
       </div>
    </div>
  );
}
