import { useState } from 'react';
import { useIsDesktop } from './hooks/useMediaQuery';
import { Wallet, Smartphone, ShieldCheck, Zap, Lock, CreditCard, ChevronRight, History, MoreVertical, Building2, Globe, TrendingUp } from 'lucide-react';

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

export default function LiviFintech() {
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState("wallet");

  const WALLET_BALANCE = 542000;
  
  const PARTNERS = [
    { name: "Wave Senegal", logo: "🌊", status: "Active", rate: "1%", delay: "Instant" },
    { name: "Orange Money", logo: "🍊", status: "Active", rate: "1.2%", delay: "Instant" },
    { name: "Free Money", logo: "🔴", status: "Active", rate: "1.2%", delay: "Instant" },
    { name: "Ecobank V-Pay", logo: "🏦", status: "Inactive", rate: "2%", delay: "T+1" }
  ];

  return (
    <div className="animate-fade-in">
       <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "2fr 1fr" : "1fr", gap: 32 }}>
          <div>
             <Card style={{ background: `linear-gradient(135deg, ${DARK_NAVY} 0%, #1e293b 100%)`, color: "#fff", marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                   <div>
                      <div style={{ fontSize: 13, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>LiviWallet B2B</div>
                      <div style={{ fontSize: 42, fontWeight: 950, marginTop: 10 }}>{WALLET_BALANCE.toLocaleString()} <span style={{ fontSize: 20 }}>FCFA</span></div>
                   </div>
                   <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}><Smartphone size={32} color={GOLD} /></div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                   <button style={{ flex: 1, background: GOLD, color: DARK_NAVY, border: "none", padding: 14, borderRadius: 14, fontWeight: 900, cursor: "pointer" }}>Déposer Fonds</button>
                   <button style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: 14, borderRadius: 14, fontWeight: 900, cursor: "pointer" }}>Retirer (OM/Wave)</button>
                </div>
             </Card>

             <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Inter-opérabilité & Passerelles</h3>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {PARTNERS.map((p, i) => (
                   <Card key={i} style={{ border: p.status === 'Active' ? `1px solid ${VISION_GREEN}40` : '1px solid #f1f5f9' }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                         <div style={{ fontSize: 24 }}>{p.logo}</div>
                         <div style={{ fontSize: 10, background: p.status === 'Active' ? "#ecfdf5" : "#f1f5f9", color: p.status === 'Active' ? VISION_GREEN : "#64748b", padding: "4px 10px", borderRadius: 8, fontWeight: 900 }}>{p.status}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Taux: {p.rate} · Délai: {p.delay}</div>
                      <button style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", color: DARK_NAVY }}>Configurer APIs</button>
                   </Card>
                ))}
             </div>
          </div>

          <div>
             <Card style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20 }}>Performance Financière</h4>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
                   <div style={{ boxSize: 44, background: VISION_GREEN + "20", padding: 10, borderRadius: 12 }}><TrendingUp size={20} color={VISION_GREEN} /></div>
                   <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>INDICE DE SOLVABILITÉ</div>
                      <div style={{ fontSize: 22, fontWeight: 950, color: VISION_GREEN }}>98.2% <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>A+</span></div>
                   </div>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>Votre historique de transactions via Wave & OM est analysé par l'IA pour augmenter votre plafond de crédit B2B.</p>
             </Card>

             <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                   <h4 style={{ fontSize: 15, fontWeight: 900 }}>Historique Récent</h4>
                   <History size={16} color="#94a3b8" />
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                     <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>Transfert Grossiste</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Wave · 2{i} Mars</div>
                     </div>
                     <div style={{ fontSize: 14, fontWeight: 950, color: "#ef4444" }}>-45,000 F</div>
                  </div>
                ))}
             </Card>
          </div>
       </div>
    </div>
  );
}
