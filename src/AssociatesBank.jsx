import { useState, useEffect } from "react";
import LoanManager from "./LoanManager";
import BankPerformance from "./BankPerformance";
import { 
  Building2, 
  Users, 
  HandCoins, 
  Vote, 
  Cpu, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  Wallet,
  Coins,
  Gavel,
  History,
  Sparkles,
  Truck,
  FileText,
  Zap,
  Lock,
  Database,
  ArrowRight,
  UserPlus,
  Target,
  UserCircle,
  Calendar,
  LayoutDashboard
} from "lucide-react";
import DashboardShell from "./components/DashboardShell";
import { useSearchParams } from "react-router-dom";

// --- SIMULATION DATA ---
const PARTNERS = [
  { id: "g1", name: "Dakar Logistics Hub (DLH)", type: "Wholesaler", contribution: "75,000,000 FCFA", shares: "65%", score: 98, status: "Founder" },
  { id: "b1", name: "Supermarché Al-Amine", type: "Boutique", contribution: "2,500,000 FCFA", shares: "2.1%", score: 95, status: "Advisory" },
  { id: "b2", name: "Boutique Serigne Saliou", type: "Boutique", contribution: "1,200,000 FCFA", shares: "1.0%", score: 72, status: "Member" },
];

const TONTINES = [
  { id: "t1", name: "Cercle des Boutiquiers - Casamance", members: 12, cycle: "Mensuel", amount: "100.000 F", nextPayout: "01 Avril", totalPool: "1.200.000 F", status: "Actif" },
  { id: "t2", name: "LiviGroupage Importation Riz", members: 42, cycle: "Trimestriel", amount: "500.000 F", nextPayout: "15 Mai", totalPool: "21.000.000 F", status: "En cours" }
];

const RESOLUTIONS = [
  { id: "r1", title: "Allocation Dividendes Flotte Q1", description: "Distribuer 4.5M FCFA de profits générés par les camions TRN-X1 aux co-actionnaires Boutiques.", votesFor: "88%", votesAgainst: "2%", status: "Open", deadline: "Demain, 18h" },
  { id: "r2", title: "Baisse Taux Prêt Boutique", description: "Réduire le taux d'intérêt de 1.2% à 0.8% pour les boutiques ayant un score Karma > 950.", votesFor: "95%", votesAgainst: "2%", status: "Approved", deadline: "Clôturé" },
];

const GOLD_COLOR = "#f59e0b";
const NAVY_DARK = "#0f172a";
const EMERALD = "#10b981";

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden", ...style }}>{children}</div>
);

const Badge = ({ children, color = "#64748b", bg = "#f1f5f9" }) => (
  <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 10, fontWeight: 900, color, background: bg, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</span>
);

export default function AssociatesBank() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") || "dashboard"); 
  const [loanStep, setLoanStep] = useState(searchParams.get("loanStep") || "apply"); // apply | analyzing | result | closed
  const [activeResolution, setActiveResolution] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== view) setView(v);
    const ls = searchParams.get("loanStep");
    if (ls && ls !== loanStep) setLoanStep(ls);
  }, [searchParams]);

  const handleNav = (v, params = {}) => {
    setView(v);
    setSearchParams({ view: v, ...params });
  };

  const handleAction = (msg) => {
    alert(`Action: ${msg} enregistrée.`);
  }

  const triggerAiAudit = () => {
    setLoanStep("analyzing");
    setSearchParams({ view: "loans", loanStep: "analyzing" });
    setTimeout(() => {
      setLoanStep("result");
      setSearchParams({ view: "loans", loanStep: "result" });
    }, 2500);
  };

  const closeLoanDossier = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setLoanStep("closed");
      setSearchParams({ view: "loans", loanStep: "closed" });
      alert("Félicitations ! Votre dossier de prêt est désormais CLÔTURÉ. Votre Karma Logistique a augmenté de +45 pts.");
    }, 1500);
  };

  const handleVote = (res) => {
    alert(`Votre vote pour "${res}" a été enregistré sur la LiviChain.`);
  }

  const renderDashboard = () => (
    <div className="animate-fade-in">
       {/* STATS HEADER */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 32 }}>
          <Card style={{ background: NAVY_DARK, color: "#fff" }}>
             <div style={{ fontSize: 11, color: GOLD_COLOR, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>Trésorerie du Cercle Associé</div>
             <div style={{ fontSize: 32, fontWeight: 900 }}>845.280.000 F</div>
             <div style={{ fontSize: 11, color: EMERALD, marginTop: 10, fontWeight: 700 }}>↑ +4.2M F ce jour (Cotisations)</div>
          </Card>
          <Card>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>Taux Co-actionnaire Moyen</div>
             <div style={{ fontSize: 32, fontWeight: 900, color: EMERALD }}>0.8% <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>/ an</span></div>
             <div style={{ fontSize: 11, color: GOLD_COLOR, marginTop: 10, fontWeight: 700 }}>Contre 12-15% en banque classique</div>
          </Card>
          <Card>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>Membres Actifs</div>
             <div style={{ fontSize: 32, fontWeight: 900 }}>4,284</div>
             <div style={{ fontSize: 11, color: "#6366f1", marginTop: 10, fontWeight: 700 }}>98% Taux de remboursement</div>
          </Card>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1024 ? "2fr 1fr" : "1fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
             {/* TONTINE HUB */}
             <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                   <h3 style={{ fontSize: 18, fontWeight: 900 }}>Tontines & Fonds de Solidarité</h3>
                   <button onClick={() => handleNav("tontine")} style={{ background: "none", border: "none", color: NAVY_DARK, fontSize: 13, fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}>Toutes les tontines</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                   {TONTINES.map(ton => (
                     <div key={ton.id} style={{ background: "#f8fafc", padding: 20, borderRadius: 20, border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                           <Badge color="#6366f1" bg="#eef2ff">{ton.cycle}</Badge>
                           <div style={{ fontSize: 11, fontWeight: 800, color: EMERALD }}>{ton.members} Membres</div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{ton.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Part: <span style={{ fontWeight: 800, color: NAVY_DARK }}>{ton.amount}</span></div>
                        <div style={{ background: "#fff", padding: 12, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                           <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>POOL TOTAL</div>
                           <div style={{ fontSize: 18, fontWeight: 900, color: NAVY_DARK }}>{ton.totalPool}</div>
                        </div>
                        <button 
                          onClick={() => handleAction(`Participer à ${ton.name}`)}
                          style={{ width: "100%", marginTop: 16, background: NAVY_DARK, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                        >
                          Verser ma part
                        </button>
                     </div>
                   ))}
                </div>
             </Card>

             {/* GOVERNANCE SECTION */}
             <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                   <Gavel size={24} color={GOLD_COLOR} />
                   <h3 style={{ fontSize: 18, fontWeight: 900 }}>Gouvernance & Démocratie</h3>
                </div>
                {RESOLUTIONS.map(res => (
                  <div key={res.id} style={{ marginBottom: 20, padding: 20, background: "#f8fafc", borderRadius: 20, border: "1px solid #f1f5f9" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <Badge color={res.status === "Approved" ? EMERALD : GOLD_COLOR} bg={res.status === "Approved" ? "#ecfdf5" : "#fffbeb"}>{res.status}</Badge>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{res.deadline}</span>
                     </div>
                     <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{res.title}</div>
                     <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>{res.description}</p>
                     <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => handleVote(res.title)} style={{ flex: 1, background: EMERALD, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer" }}>Voter OUI</button>
                        <button onClick={() => handleVote(res.title)} style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer" }}>Voter NON</button>
                     </div>
                  </div>
                ))}
             </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
             {/* LOAN QUICK ACCESS */}
             <Card style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, #1e293b 100%)`, color: "#fff" }}>
                <HandCoins size={32} color={GOLD_COLOR} style={{ marginBottom: 20 }} />
                <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Besoin de financement ?</h4>
                <p style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.6, marginBottom: 24 }}>Obtenez un prêt IA basé sur votre score Karma Logistique en moins de 30 secondes.</p>
                <button 
                  onClick={() => handleNav("loans")}
                  style={{ width: "100%", background: GOLD_COLOR, color: NAVY_DARK, border: "none", padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: "pointer" }}
                >
                  Postuler maintenant
                </button>
             </Card>

             <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                   <History size={18} color="#64748b" />
                   <h4 style={{ fontSize: 15, fontWeight: 900 }}>Flux Blockchain LiviPro</h4>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                     <div style={{ width: 8, height: 8, borderRadius: "50%", background: EMERALD, marginTop: 6 }}></div>
                     <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Dépôt Tontine #TX-982{i}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Confirmé · Il y a {i*5} mins</div>
                     </div>
                  </div>
                ))}
             </Card>
          </div>
       </div>
    </div>
  );

  const renderLoans = () => (
    <div className="animate-fade-in">
       <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900 }}>Banque Associée : Prêts IA</h2>
          <p style={{ fontSize: 15, color: "#64748b" }}>Transparence totale, taux préférentiels et audit algorithmique.</p>
       </div>

       {loanStep === "apply" && (
          <Card style={{ maxWidth: 600, margin: "0 auto" }}>
             <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, textAlign: "center" }}>Demander un Financement</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Montant souhaité</label>
                   <input type="text" placeholder="Ex: 500,000 FCFA" style={{ width: "100%", marginTop: 8, padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 16, fontWeight: 800, outline: "none" }} />
                </div>
                <div style={{ background: "#f8fafc", padding: 20, borderRadius: 20, border: "1px solid #e2e8f0" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Score Karma Requis</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: EMERALD }}>750+</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Votre Karma actuel</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: EMERALD }}>942</span>
                   </div>
                </div>
                <button 
                  onClick={triggerAiAudit}
                  style={{ width: "100%", background: NAVY_DARK, color: "#fff", border: "none", padding: 18, borderRadius: 18, fontSize: 15, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
                >
                  Lancer l'Audit IA <Cpu size={20} color={GOLD_COLOR} />
                </button>
             </div>
          </Card>
       )}

       {loanStep === "analyzing" && (
         <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 30px" }}>
               <div style={{ position: "absolute", width: "100%", height: "100%", border: "4px solid #f1f5f9", borderRadius: "50%" }}></div>
               <div style={{ position: "absolute", width: "100%", height: "100%", border: `4px solid ${GOLD_COLOR}`, borderRadius: "50%", borderTopColor: "transparent" }} className="animate-spin"></div>
               <Cpu size={40} color={GOLD_COLOR} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900 }}>Audit LiviAI en cours...</h3>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 12 }}>Vérification de l'historique logistique, de la ponctualité LiviCash et des stocks...</p>
         </div>
       )}

       {loanStep === "result" && (
         <div className="animate-fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
            <Card style={{ borderTop: `8px solid ${EMERALD}`, textAlign: "center", padding: 40 }}>
               <div style={{ background: "#ecfdf5", width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={48} color={EMERALD} />
               </div>
               <h3 style={{ fontSize: 24, fontWeight: 900 }}>PRÊT APPROUVÉ !</h3>
               <p style={{ fontSize: 16, color: "#64748b", marginTop: 12 }}>L'IA a validé votre demande. Le montant de <span style={{ fontWeight: 800, color: NAVY_DARK }}>500,000 FCFA</span> est prêt à être décaissé sur votre LiviWallet.</p>
               
               <div style={{ marginTop: 40, background: "#f8fafc", borderRadius: 24, padding: 24, textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase" }}>CONDITIONS ASSOCIÉES</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                     <div style={{ padding: 16, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Taux mensuel</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: EMERALD }}>0.8%</div>
                     </div>
                     <div style={{ padding: 16, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Durée</div>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>3 Mois</div>
                     </div>
                  </div>
               </div>

               <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
                  <button 
                    onClick={() => handleAction("Signer Smart Contract")}
                    style={{ flex: 1, background: NAVY_DARK, color: "#fff", border: "none", padding: 16, borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: "pointer" }}
                  >
                    Signer & Recevoir
                  </button>
                  <button 
                    onClick={closeLoanDossier}
                    disabled={isProcessing}
                    style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: 16, borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: isProcessing ? "wait" : "pointer" }}
                  >
                    Rembourser & Clôturer
                  </button>
               </div>
            </Card>
         </div>
       )}

       {loanStep === "closed" && (
         <div className="animate-fade-in" style={{ textAlign: "center", padding: 60 }}>
            <div style={{ background: "#f0fdf4", width: 100, height: 100, borderRadius: "50%", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <ShieldCheck size={60} color={EMERALD} />
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 900 }}>Dossier Dossier Clôturé avec Succès</h3>
            <p style={{ fontSize: 16, color: "#64748b", marginTop: 12 }}>Votre intégrité financière est exemplaire. Votre score Karma a été réévalué.</p>
            <button 
               onClick={() => setLoanStep("apply")}
               style={{ marginTop: 32, background: NAVY_DARK, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 14, fontWeight: 800, cursor: "pointer" }}
            >
               Retour au Dashboard Bancaire
            </button>
         </div>
       )}
    </div>
  );

  const renderTontine = () => (
    <div className="animate-fade-in">
       <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900 }}>Cercle de Tontine Digitale</h2>
          <p style={{ fontSize: 15, color: "#64748b" }}>Transparence absolue sur la LiviChain. Pas de frais de gestion.</p>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1024 ? "2fr 1fr" : "1fr", gap: 32 }}>
          <div>
             <Card style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Votre Tontine Active : Casamance</h3>
                <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
                   <div style={{ flex: 1, background: "#f8fafc", padding: 20, borderRadius: 20 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginBottom: 6 }}>PROCHAIN TIRAGE</div>
                      <div style={{ fontSize: 20, fontWeight: 950, color: EMERALD }}>VOUS (01 Avril)</div>
                   </div>
                   <div style={{ flex: 1, background: "#f8fafc", padding: 20, borderRadius: 20 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginBottom: 6 }}>MONTANT À RECEVOIR</div>
                      <div style={{ fontSize: 20, fontWeight: 950 }}>1.200.000 F</div>
                   </div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 16 }}>Ordre de Ramassage (Blockchain)</div>
                {[
                  { name: "Ousmane Diallo", status: "Reçu", date: "Janvier", color: "#94a3b8" },
                  { name: "Grossiste DLH", status: "Reçu", date: "Février", color: "#94a3b8" },
                  { name: "Boutique Serigne Saliou", status: "Reçu", date: "Mars", color: "#94a3b8" },
                  { name: "VOUS (Al-Amine)", status: "À venir", date: "Avril", color: GOLD_COLOR, active: true },
                  { name: "Cofisac SA", status: "À venir", date: "Mai", color: "#64748b" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 14, background: item.active ? `${GOLD_COLOR}10` : "transparent", border: item.active ? `1px solid ${GOLD_COLOR}40` : "none", marginBottom: 4 }}>
                     <div style={{ fontSize: 12, fontWeight: 900, color: item.color, width: 60 }}>{item.date}</div>
                     <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: item.active ? NAVY_DARK : "#64748b" }}>{item.name}</div>
                     <Badge color={item.status === "Reçu" ? EMERALD : item.color} bg={item.status === "Reçu" ? "#ecfdf5" : "#f1f5f9"}>{item.status}</Badge>
                  </div>
                ))}
             </Card>
          </div>
          <div>
            <Card style={{ background: EMERALD, color: "#fff", marginBottom: 24 }}>
               <Sparkles size={32} style={{ marginBottom: 16 }} />
               <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Boostez votre Cycle</h4>
               <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>En réinvestissant 15% de votre ramassage dans le fonds de garantie, vous gagnez un accès VIP aux stocks de sécurité.</p>
               <button onClick={() => handleAction("Activer Boost")} style={{ width: "100%", background: "#fff", color: EMERALD, border: "none", padding: 12, borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: "pointer" }}>Inscrire au Programme</button>
            </Card>
          </div>
       </div>
    </div>
  );

  return (
    <DashboardShell title={view === 'dashboard' ? 'Associates Bank Hub' : view === 'loans' ? 'Centre de Crédit IA' : 'Tontine & Solidarité'} role="admin">
       <div style={{ display: "flex", gap: 10, marginBottom: 30, overflowX: "auto", paddingBottom: 10 }}>
        {[
          { id: "dashboard", label: "Dashboard Banque", icon: <LayoutDashboard size={16} /> },
          { id: "loans", label: "Prêts & Crédits", icon: <HandCoins size={16} /> },
          { id: "tontine", label: "Tontine Digitale", icon: <GroupIcon size={16} /> }, // Placeholder or use Users
          { id: "assembly", label: "Gouvernance", icon: <Gavel size={16} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => handleNav(tab.id)} 
            style={{ 
              background: view === tab.id ? NAVY_DARK : "#fff", 
              color: view === tab.id ? "#fff" : "#64748b",
              border: "1px solid #e2e8f0",
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {tab.id === 'assembly' ? <Gavel size={16}/> : tab.id === 'tontine' ? <Users size={16}/> : tab.icon} {tab.label}
          </button>
        ))}
      </div>

       {view === "dashboard" && renderDashboard()}
       {view === "loans" && renderLoans()}
       {view === "tontine" && renderTontine()}
       {view === "assembly" && renderDashboard() /* Governance is on dashboard too */}
    </DashboardShell>
  );
}

function GroupIcon(props) {
  return <Users {...props} />
}
