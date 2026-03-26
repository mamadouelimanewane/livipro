import { useState } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Star, 
  QrCode, 
  MoreVertical,
  MessageCircle,
  Filter,
  CheckCircle2,
  Building2
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all | wholesaler | boutique

  const MEMBERS = [
    { id: "M1", type: "wholesaler", name: "Grossiste Al-Amine", location: "Dakar Port, Zone B", phone: "+221 77 123 45 67", rating: 4.8, status: "Certifié Platinum" },
    { id: "M2", type: "boutique", name: "Boutique Le Plateau", location: "Rue 12 x 15, Plateau", phone: "+221 78 987 65 43", rating: 4.9, status: "A+ Karma" },
    { id: "M3", type: "wholesaler", name: "Diagne Distribution", location: "Kaolack Marche Central", phone: "+221 76 543 21 09", rating: 4.7, status: "Actif" },
    { id: "M4", type: "boutique", name: "Alimentation Ndiaye", location: "Pikine Icotaf 2", phone: "+221 77 000 11 22", rating: 4.5, status: "Sociétaire Banque" }
  ];

  const filteredMembers = MEMBERS.filter(m => 
    (filter === "all" || m.type === filter) &&
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* DIRECTORY HEADER */}
       <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>Annuaire LiviConnect</h2>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginTop: 4 }}>Réseau B2B de Confiance du Sénégal</div>
       </div>

       {/* SEARCH & FILTER */}
       <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: "relative" }}>
             <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Chercher un membre..." 
               style={{ width: "100%", height: 50, padding: "0 44px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, fontSize: 13, fontWeight: 600, outline: "none" }} 
             />
          </div>
          <button style={{ height: 50, width: 50, background: DARK_NAVY, border: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <Filter size={18} color={GOLD} />
          </button>
       </div>

       <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["all", "wholesaler", "boutique"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setFilter(tab)}
              style={{ flex: 1, background: filter === tab ? DARK_NAVY : "#fff", color: filter === tab ? "#fff" : "#64748b", border: "1px solid #f1f5f9", padding: "8px", borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
               {tab === "all" ? "Tous" : tab === "wholesaler" ? "Grossistes" : "Boutiques"}
            </button>
          ))}
       </div>

       {/* CARD LIST */}
       <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {filteredMembers.map(member => (
            <div key={member.id} className="animate-fade-in" style={{ background: "#fff", borderRadius: 24, padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
               {/* Accent logic... */}
               <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, background: member.type === 'wholesaler' ? GOLD : VISION_GREEN }}></div>
               
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                     <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f8fafc", border: `1.5px solid ${member.type === 'wholesaler' ? GOLD : VISION_GREEN}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {member.type === 'wholesaler' ? <Building2 size={24} color={GOLD} /> : <Users size={24} color={VISION_GREEN} />}
                     </div>
                     <div>
                        <div style={{ fontSize: 16, fontWeight: 900 }}>{member.name}</div>
                        <div style={{ fontSize: 10, color: member.type === 'wholesaler' ? GOLD : VISION_GREEN, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>{member.type}</div>
                     </div>
                  </div>
                  <MoreVertical size={18} color="#cbd5e1" />
               </div>

               <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
                     <MapPin size={14} /> {member.location}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
                     <Phone size={14} /> {member.phone}
                  </div>
               </div>

               <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                     <CheckCircle2 size={16} color={VISION_GREEN} />
                     <span style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>{member.status}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                     <Star size={14} fill={GOLD} color={GOLD} />
                     <span style={{ fontSize: 12, fontWeight: 900 }}>{member.rating}</span>
                  </div>
               </div>

               <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button style={{ flex: 1, background: "#25d366", color: "#fff", border: "none", padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                     <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button style={{ background: "#f1f5f9", border: "none", padding: "10px", borderRadius: 12, color: "#64748b" }}>
                     <QrCode size={18} />
                  </button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
