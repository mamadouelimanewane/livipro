import { useState } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Users, 
  Activity, 
  CreditCard, 
  PieChart, 
  ShieldCheck,
  Globe
} from "lucide-react";

export default function BankPerformance() {
  return (
    <div style={{ padding: 24, background: "#0f172a", borderRadius: 32, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
             <div style={{ background: "rgba(255,255,255,0.1)", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={24} color="#f59e0b" />
             </div>
             <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>LiviBank Performance</div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>LIVE NETWORK METRICS</div>
             </div>
          </div>
          <div style={{ background: "#10b981", padding: "6px 14px", borderRadius: 30, fontSize: 10, fontWeight: 900 }}>RÉSEAU STABLE</div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>LIQUIDITÉ TOTALE</div>
             <div style={{ fontSize: 24, fontWeight: 900 }}>142.5M <span style={{ fontSize: 12 }}>F</span></div>
             <div style={{ fontSize: 10, color: "#10b981", fontWeight: 800, marginTop: 4 }}>+12% (LiviCash Flow)</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>PRÊTS ACTIFS</div>
             <div style={{ fontSize: 24, fontWeight: 900 }}>28.2M <span style={{ fontSize: 12 }}>F</span></div>
             <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 800, marginTop: 4 }}>Risque IA : 2.4% (Très Bas)</div>
          </div>
       </div>

       <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
             <div style={{ fontSize: 13, fontWeight: 800 }}>Répartition des Actifs</div>
             <PieChart size={18} color="#94a3b8" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             {[
               { label: "Trésorerie Wave/OM", val: 65, color: "#3b82f6" },
               { label: "Prêts Boutiques", val: 20, color: "#f59e0b" },
               { label: "Fonds Propres Associés", val: 15, color: "#10b981" }
             ].map((item, i) => (
               <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                     <span style={{ color: "#94a3b8" }}>{item.label}</span>
                     <span style={{ fontWeight: 800 }}>{item.val}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                     <div style={{ height: "100%", width: `${item.val}%`, background: item.color, borderRadius: 2 }}></div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       <div style={{ textAlign: "center", padding: "20px 0" }}>
          <ShieldCheck size={32} color="#10b981" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, fontWeight: 900 }}>Audité par LiviTrust Engine</div>
          <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>Aucune dérive financière détectée dans les dernières 10,000 transactions.</p>
       </div>
    </div>
  );
}
