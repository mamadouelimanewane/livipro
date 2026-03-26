import { useState } from "react";
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Eye, 
  Download, 
  Lock, 
  History, 
  Calendar,
  Filter,
  ArrowRight,
  Database
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const SECURE_BLUE = "#3b82f6";
const GOLD = "#f59e0b";

export default function DocumentVault() {
  const [searchTerm, setSearchTerm] = useState("");

  const ARCHIVES = [
    { id: "BC-2026-001", type: "Bon de Commande", partner: "Boutique Saliou", date: "24/03/2026", hash: "8x2f...91z", status: "Signé (IA)" },
    { id: "FAC-2026-982", type: "Facture", partner: "Grossiste Nestlé", date: "22/03/2026", hash: "5k8a...33m", status: "Clôturé" },
    { id: "BL-2026-441", type: "Bon de Livraison", partner: "Ousmane (Livreur)", date: "25/03/2026", hash: "2p1q...77v", status: "Audit Réussi" },
    { id: "FIN-BANK-02", type: "Relevé Tontine", partner: "Cercle Associés", date: "20/03/2026", hash: "9jLy...44p", status: "Immuable" },
  ];

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
             <h2 style={{ fontSize: 22, fontWeight: 900, color: DARK_NAVY }}>LiviSecure Vault</h2>
             <div style={{ fontSize: 12, color: SECURE_BLUE, display: "flex", alignItems: "center", gap: 5, fontWeight: 700 }}>
                <Lock size={12} /> Archivage Immuable (Proof-of-Transaction)
             </div>
          </div>
          <div style={{ background: "#fff", width: 44, height: 44, borderRadius: 14, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <Database size={20} color={DARK_NAVY} />
          </div>
       </div>

       {/* SEARCH & FILTERS */}
       <div style={{ background: "#fff", borderRadius: 20, padding: 12, display: "flex", gap: 12, border: "1px solid #f1f5f9", marginBottom: 24 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
             <Search size={18} color="#94a3b8" />
             <input 
               type="text" 
               placeholder="Rechercher par N° ou Partenaire..." 
               style={{ border: "none", outline: "none", width: "100%", fontSize: 13 }}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button style={{ background: "#f1f5f9", border: "none", padding: "10px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}><Filter size={16} /></button>
       </div>

       {/* VAULT LIST */}
       <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ARCHIVES.map((doc, idx) => (
            <div key={idx} style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14 }}>
                     <div style={{ width: 48, height: 48, background: "#f0f7ff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={24} color={SECURE_BLUE} />
                     </div>
                     <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: DARK_NAVY }}>{doc.id}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: SECURE_BLUE }}>{doc.type}</div>
                     </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <div style={{ fontSize: 11, background: "#ecfdf5", color: "#10b981", padding: "4px 10px", borderRadius: 8, fontWeight: 800 }}>{doc.status}</div>
                     <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>HASH: {doc.hash}</div>
                  </div>
               </div>

               <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 16px", background: "#f8fafc", borderRadius: 16 }}>
                  <div>
                     <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>PARTENAIRE</div>
                     <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.partner}</div>
                  </div>
                  <div>
                     <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>DATE ARCHIVAGE</div>
                     <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.date}</div>
                  </div>
               </div>

               <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button style={{ flex: 1, background: DARK_NAVY, color: "#fff", border: "none", padding: "12px", borderRadius: 12, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                     <Eye size={16} /> Consulter
                  </button>
                  <button style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px", borderRadius: 12, color: DARK_NAVY }}>
                     <Download size={18} />
                  </button>
                  <button style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px", borderRadius: 12, color: DARK_NAVY }}>
                     <History size={18} />
                  </button>
               </div>
            </div>
          ))}
       </div>

       {/* INTEGRITY SEAL INFO */}
       <div style={{ marginTop: 30, padding: 20, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 24, textAlign: "center", color: "#fff" }}>
          <ShieldCheck size={32} color={GOLD} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 900 }}>Certificat d'Intégrité Digitale</div>
          <p style={{ fontSize: 11, opacity: 0.7, marginTop: 6, lineHeight: 1.5 }}>Tous les documents de la plateforme sont scellés par un condensat (Hash) immuable. Toute altération rompt la validité juridique de la pièce.</p>
       </div>
    </div>
  );
}
