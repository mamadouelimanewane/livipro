import { useState, useEffect } from 'react';
import { useToast } from './components/Toast';
import { useIsDesktop } from './hooks/useMediaQuery';
import { ShieldCheck, Zap, HandCoins, AlertTriangle, CheckCircle2, TrendingUp, Lock, ArrowRight, ShieldAlert, Sparkles, Building2, LayoutDashboard, MoreVertical, Layers } from 'lucide-react';

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

export default function LiviShield() {
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState("apply");
  const [isApproving, setIsApproving] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({ name: "Stock Ramadan (Complet)", total: 1250000, wholesaler: "Dakar Logistics Hub" });

  const karmaScore = 942;
  const creditLimit = 5000000;
  const currentExposure = 850000;

  const handleApply = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      toast.success(`LiviShield™ ACTIVÉ : L'IA a validé votre garantie de ${currentOrder.total.toLocaleString()} F. Le grossiste a été payé.`);
      setActiveTab('stats');
    }, 2500);
  };

  return (
    <div className="animate-fade-in" style={{ padding: 20 }}>
       <div style={{ background: `linear-gradient(135deg, ${DARK_NAVY} 0%, #1e293b 100%)`, borderRadius: 32, padding: 32, color: "#fff", marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.1 }}><ShieldCheck size={180} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
             <ShieldCheck size={28} color={GOLD} />
             <h2 style={{ fontSize: 24, fontWeight: 950 }}>LiviShield™ Assurance Crédit</h2>
          </div>
          <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.6, maxWidth: 600 }}>Approvisionnez-vous sans avance de trésorerie. LiviPro garantit vos paiements auprès des grossistes en se basant sur la puissance de votre Karma.</p>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "2fr 1fr" : "1fr", gap: 32 }}>
          <div>
             {activeTab === "apply" ? (
               <Card style={{ borderTop: `8px solid ${GOLD}` }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>Demande de Garantie Immédiate</h3>
                  <div style={{ background: "#f8fafc", padding: 24, borderRadius: 20, marginBottom: 32 }}>
                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                        <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>GROSSISTE CIBLE</div>
                        <div style={{ fontWeight: 900, fontSize: 14 }}>{currentOrder.wholesaler}</div>
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                        <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>PRODUIT / COMMANDE</div>
                        <div style={{ fontWeight: 900, fontSize: 14 }}>{currentOrder.name}</div>
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 950 }}>
                        <div>VALEUR TOTALE</div>
                        <div style={{ color: DARK_NAVY }}>{currentOrder.total.toLocaleString()} F</div>
                     </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 32, padding: 16, background: "#ecfdf5", borderRadius: 16, border: `1px solid ${VISION_GREEN}` }}>
                     <Zap size={24} color={VISION_GREEN} />
                     <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: "#065f46" }}>Audit IA Favorable</div>
                        <div style={{ fontSize: 11, color: "#065f46", opacity: 0.8 }}>Votre Karma (942) est au-dessus du seuil d'excellence LiviShield.</div>
                     </div>
                  </div>

                  <button 
                    onClick={handleApply}
                    disabled={isApproving}
                    style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: 18, borderRadius: 16, fontWeight: 900, fontSize: 15, cursor: isApproving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    {isApproving ? <><Sparkles size={20} className="animate-spin" /> Analyse des Flux & Signature Smart Contract...</> : <><Lock size={20} color={GOLD} /> Activer la Garantie LiviShield™</>}
                  </button>
               </Card>
             ) : (
               <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                     <h3 style={{ fontSize: 18, fontWeight: 900 }}>Suivi du Remboursement (Auto-Pay)</h3>
                     <Badge color={VISION_GREEN} bg="#ecfdf5">ACTIVE</Badge>
                  </div>
                  <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, marginBottom: 16, position: "relative" }}>
                     <div style={{ width: "35%", height: "100%", background: VISION_GREEN, borderRadius: 6 }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginBottom: 32 }}>
                     <span style={{ color: VISION_GREEN }}>437,500 F Remboursés (35%)</span>
                     <span style={{ color: "#94a3b8" }}>Total: 1,250,000 F</span>
                  </div>
                  
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
                     <h4 style={{ fontSize: 14, fontWeight: 900, marginBottom: 16 }}>Flux de Remboursement LiviPOS</h4>
                     {[1,2].map(i => (
                       <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: 12, marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>Vente Consommateur LiviPOS #{i*120}</div>
                          <div style={{ fontSize: 12, fontWeight: 900, color: VISION_GREEN }}>-{(i*4500).toLocaleString()} F (Deduction Auto)</div>
                       </div>
                     ))}
                  </div>
               </Card>
             )}
          </div>

          <div>
             <Card style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 15, fontWeight: 900, marginBottom: 20 }}>Capacité de Garantie</h4>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                   <div style={{ fontSize: 32, fontWeight: 950, color: DARK_NAVY }}>{(creditLimit - currentExposure).toLocaleString()} <span style={{ fontSize: 16 }}>F</span></div>
                   <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>RESTANT SUR VOTRE LIGNE</div>
                </div>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: "#64748b" }}>Encours Actuel</span>
                      <span style={{ fontWeight: 900 }}>{currentExposure.toLocaleString()} F</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: "#64748b" }}>Score Karma Boutique</span>
                      <span style={{ fontWeight: 900, color: VISION_GREEN }}>{karmaScore} AA+</span>
                   </div>
                </div>
             </Card>

             <Card style={{ background: VISION_GREEN + "05", border: `1px solid ${VISION_GREEN}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: VISION_GREEN, fontWeight: 900, fontSize: 14, marginBottom: 12 }}>
                   <ShieldAlert size={18} /> Pourquoi LiviShield ?
                </div>
                <p style={{ fontSize: 12, color: "#365314", lineHeight: 1.6 }}>
                  LiviShield réduit le besoin de prêts bancaires classiques. C'est une assurance intégrée à la supply chain qui convertit vos ventes futures en stock présent.
                </p>
             </Card>
          </div>
       </div>
    </div>
  );
}

function Badge({ children, color, bg }) {
  return <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 8, color, background: bg }}>{children}</span>
}
