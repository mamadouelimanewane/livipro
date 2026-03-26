import { useState } from "react";
import { 
  HandCoins, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  History,
  ShieldAlert,
  AlertTriangle,
  TrendingDown
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LoanManager() {
  const [activeTab, setActiveTab] = useState("pipeline"); // pipeline | schedule

  const PENDING_LOANS = [
    { id: "L-2026-01", applicant: "Supermarché Al-Amine", amount: 1200000, score: 95, risk: "Low", rationale: "Karma 942/1000. 100% ponctualité. Solvabilité confirmée.", status: "Audit IA" },
    { id: "L-2026-02", applicant: "Boutique Saliou", amount: 350000, score: 42, risk: "High", rationale: "Dépôts LiviCash irréguliers. 2 litiges non résolus en fév.", status: "Vérification Admin" },
    { id: "L-2026-03", applicant: "Alimentation Ndiaye", amount: 750000, score: 81, risk: "Medium", rationale: "Chiffre d'affaires stable mais faible participation tontine.", status: "Approuvé" },
  ];

  const REPAYMENTS = [
    { partner: "Supermarché Al-Amine", total: 1200000, paid: 600000, nextDate: "05/04/2026", monthly: 200000, progress: 50 },
    { partner: "Boutique Le Plateau", total: 500000, paid: 500000, nextDate: "COMPLÉTÉ", monthly: 0, progress: 100 },
  ];

  return (
    <div style={{ padding: 20, fontFamily: "'Inter', sans-serif" }}>
       <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {["pipeline", "schedule"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{ flex: 1, background: activeTab === tab ? DARK_NAVY : "#fff", color: activeTab === tab ? "#fff" : "#64748b", border: activeTab === tab ? "none" : "1px solid #f1f5f9", padding: "12px", borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
               {tab === "pipeline" ? "Demandes en cours" : "Échéancier & Remboursement"}
            </button>
          ))}
       </div>

       {activeTab === "pipeline" && (
         <div className="animate-fade-in">
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Pipeline d'Approbation (Workflow)</h3>
            {PENDING_LOANS.map((loan, idx) => (
              <div key={idx} style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", marginBottom: 16 }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                       <div style={{ fontSize: 15, fontWeight: 800 }}>{loan.applicant}</div>
                       <div style={{ fontSize: 12, color: "#94a3b8" }}>ID: {loan.id} · Score IA: <span style={{ color: VISION_GREEN, fontWeight: 900 }}>{loan.score}</span></div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 16, fontWeight: 900, color: DARK_NAVY }}>{loan.amount.toLocaleString()} F</div>
                 </div>

                 {/* AI RISK PANEL */}
                 <div style={{ background: loan.risk === 'High' ? '#fef2f2' : loan.risk === 'Medium' ? '#fffbeb' : '#f0fdf4', padding: 12, borderRadius: 12, marginBottom: 16, border: `1px solid ${loan.risk === 'High' ? '#fecaca' : '#d1fae5'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: loan.risk === 'High' ? '#ef4444' : '#10b981', marginBottom: 4 }}>
                       <ShieldAlert size={14} /> ANALYSE DE RISQUE IA : {loan.risk}
                    </div>
                    <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{loan.rationale}</p>
                 </div>

                 {/* VISUAL WORKFLOW */}
                 <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "16px 0" }}>
                    <div style={{ background: VISION_GREEN, width: 10, height: 10, borderRadius: "50%" }}></div>
                    <div style={{ flex: 1, height: 2, background: VISION_GREEN }}></div>
                    <div style={{ background: loan.status === "Audit IA" ? "#e2e8f0" : VISION_GREEN, width: 10, height: 10, borderRadius: "50%" }}></div>
                    <div style={{ flex: 1, height: 2, background: loan.status === "Approuvé" ? VISION_GREEN : "#e2e8f0" }}></div>
                    <div style={{ background: loan.status === "Approuvé" ? VISION_GREEN : "#e2e8f0", width: 10, height: 10, borderRadius: "50%" }}></div>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8", fontWeight: 800, marginBottom: 20 }}>
                    <span>DEMANDE</span>
                    <span>AUDIT IA</span>
                    <span>TRANSFERT</span>
                 </div>

                 <div style={{ display: "flex", gap: 12 }}>
                    <button style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                       <FileText size={14} /> Audit Dossier
                    </button>
                    {loan.status === "Approuvé" ? (
                      <button style={{ flex: 1, background: VISION_GREEN, color: "#fff", border: "none", padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                         <Zap size={14} /> Transférer Fonds
                      </button>
                    ) : (
                      <button style={{ flex: 1, background: DARK_NAVY, color: "#fff", border: "none", padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                         Approuver Manuel
                      </button>
                    )}
                 </div>
              </div>
            ))}
         </div>
       )}

       {activeTab === "schedule" && (
         <div className="animate-fade-in">
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Gestion des Remboursements</h3>
            {REPAYMENTS.map((rep, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", marginBottom: 16 }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                       <div style={{ fontSize: 14, fontWeight: 800 }}>{rep.partner}</div>
                       <div style={{ fontSize: 11, color: "#94a3b8" }}>Restant: {(rep.total - rep.paid).toLocaleString()} F</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: VISION_GREEN }}>{rep.progress}% Payé</div>
                 </div>

                 <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${rep.progress}%`, background: GOLD, transition: "width 0.5s ease" }}></div>
                 </div>

                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Échéance : <span style={{ fontWeight: 800, color: DARK_NAVY }}>{rep.nextDate}</span></div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#ef4444" }}>{rep.monthly > 0 ? `${rep.monthly.toLocaleString()} F / mois` : "SOLDE NUL"}</div>
                 </div>
                 
                 {rep.monthly > 0 && (
                   <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, background: "#eff6ff", color: "#3b82f6", border: "none", padding: "12px", borderRadius: 12, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                         <CreditCard size={16} /> Prélèvement Auto
                      </button>
                      <button style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: 12, color: "#64748b" }}>
                         <History size={18} />
                      </button>
                   </div>
                 )}
              </div>
            ))}
         </div>
       )}
    </div>
  );
}
