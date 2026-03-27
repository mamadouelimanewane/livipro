import { useState } from "react";
import { 
  CreditCard, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Star, 
  Users, 
  Phone, 
  Globe, 
  CheckCircle2, 
  MoreVertical,
  Cpu,
  Smartphone,
  Zap,
  LayoutDashboard,
  ZapOff,
  UserCircle
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

const MEMBERS = [
  { id: "M-9821-DAK", name: "Ousmane Drame", role: "Wholesaler", status: "Verified Owner", karma: 998, city: "Dakar", since: "2026", color: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
  { id: "M-4412-PIK", name: "Awa Ndiaye", role: "Boutique", status: "Verified Store", karma: 942, city: "Pikine", since: "2026", color: "linear-gradient(135deg, #111827 0%, #374151 100%)" },
  { id: "M-7721-STL", name: "Modou Fall", role: "Wholesaler", status: "Elite Partner", karma: 885, city: "Saint-Louis", since: "2025", color: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)" },
  { id: "D-1102-CAM", name: "Cheikh Tidiane", role: "Driver", status: "Certified App", karma: 975, city: "Thiès", since: "2026", color: "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)" },
  { id: "M-2231-MAT", name: "Binta Seck", role: "Boutique", status: "Verified Store", karma: 720, city: "Matam", since: "2026", color: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" },
  { id: "M-5520-KOL", name: "Ibrahima Ka", role: "Admin", status: "Regulator", karma: 1000, city: "LiviHost", since: "2024", color: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)" },
];

export default function LiviDirectory() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MEMBERS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
             <h2 style={{ fontSize: 24, fontWeight: 900 }}>Annuaire LiviPro ID™</h2>
             <p style={{ fontSize: 13, color: "#64748b" }}>Identité numérique certifiée de tous les partenaires du réseau.</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, width: 300 }}>
             <Search size={18} color="#94a3b8" />
             <input 
               type="text" 
               placeholder="Rechercher membre ou ville..." 
               style={{ border: "none", outline: "none", width: "100%", fontSize: 13 }}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 30 }}>
          {filtered.map((member) => (
            <div key={member.id} className="hover-scale" style={{ 
               position: "relative",
               background: member.color, 
               borderRadius: 24, 
               padding: 24, 
               color: "#fff", 
               boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
               overflow: "hidden",
               minHeight: 220,
               border: "1px solid rgba(255,255,255,0.1)",
               cursor: "pointer"
            }}>
               {/* CHIP & NFC ICON */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                  <div style={{ width: 44, height: 32, background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", borderRadius: 6, position: "relative" }}>
                     <div style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, border: "1px solid rgba(0,0,0,0.1)" }}></div>
                  </div>
                  <div style={{ opacity: 0.6 }}><Smartphone size={24} /></div>
               </div>

               {/* MEMBER LOGO / ICON */}
               <div style={{ position: "absolute", right: 24, top: 70, opacity: 0.05 }}><ShieldCheck size={120} /></div>

               <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{member.role === 'Admin' ? 'Régulateur National' : 'LiviPro Business Identity'}</div>
                  <div style={{ fontSize: 20, fontWeight: 950, marginBottom: 4 }}>{member.name}</div>
                  <div style={{ fontSize: 14, opacity: 0.8, letterSpacing: 2, fontFamily: "monospace", marginBottom: 24 }}>{member.id}</div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                     <div>
                        <div style={{ fontSize: 9, opacity: 0.6, fontWeight: 800 }}>KARMA SCORE</div>
                        <div style={{ fontSize: 16, fontWeight: 950, color: VISION_GREEN }}>{member.karma} <span style={{ fontSize: 10 }}>PTS</span></div>
                     </div>
                     <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 9, opacity: 0.6, fontWeight: 800 }}>{member.city.toUpperCase()}</div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Membre depuis {member.since}</div>
                     </div>
                  </div>
               </div>

               {/* VERIFIED SEAL */}
               <div style={{ position: "absolute", top: 24, right: 24, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)" }}>
                  <ShieldCheck size={14} color={VISION_GREEN} />
                  <span style={{ fontSize: 10, fontWeight: 900 }}>{member.status.toUpperCase()}</span>
               </div>
            </div>
          ))}
       </div>

       {filtered.length === 0 && (
         <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            <UserCircle size={60} style={{ margin: "0 auto 20px", opacity: 0.2 }} />
            <p>Aucun membre trouvé dans le registre LiviPro.</p>
         </div>
       )}
    </div>
  );
}
