import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";

// --- SIMULATION DATA ---
const PARTNERS = [
  { id: "g1", name: "Dakar Logistics Hub (DLH)", type: "Wholesaler", contribution: "75,000,000 FCFA", shares: "65%", score: 98, status: "Founder" },
  { id: "b1", name: "Supermarché Al-Amine", type: "Boutique", contribution: "2,500,000 FCFA", shares: "2.1%", score: 95, status: "Advisory" },
  { id: "b2", name: "Boutique Serigne Saliou", type: "Boutique", contribution: "1,200,000 FCFA", shares: "1.0%", score: 72, status: "Member" },
  { id: "g2", name: "COFISAC Senegal", type: "Wholesaler", contribution: "15,000,000 FCFA", shares: "13%", score: 91, status: "Partner" },
];

const RESOLUTIONS = [
  { id: "r1", title: "Allocation Dividendes Flotte", description: "Distribuer 1,200,000 FCFA de profits générés par les camions TRN-X1 et TRN-X2 aux co-actionnaires Boutiques.", votesFor: "88%", votesAgainst: "2%", status: "Open", deadline: "Demain, 18h" },
  { id: "r2", title: "Baisse Taux Prêt Boutique", description: "Réduire le taux d'intérêt de 5% à 4.2% pour les boutiques ayant un score > 90.", votesFor: "95%", votesAgainst: "2%", status: "Approved", deadline: "Clôturé" },
];

const FLEET_STAKES = [
  { id: "TRN-X1", name: "Le Distributeur Rapide", stake: "5%", earnings: "45,000 FCFA / mois", fuelEfficiency: "98%", status: "En Route" },
  { id: "TRN-X2", name: "Le Frigo Solaire", stake: "2%", earnings: "18,500 FCFA / mois", fuelEfficiency: "92%", status: "Déchargement" },
];

const LOAN_HISTORY = [
  { id: "l1", applicant: "Supermarché Al-Amine", amount: "750,000 FCFA", status: "Paid", date: "Janvier 2026", aiScore: "A+", guarantee: "15 Cartons Lait + Hypothèque Stock" },
  { id: "l2", applicant: "Boutique Ndiaye", amount: "300,000 FCFA", status: "Active", date: "Mars 2026", aiScore: "B", guarantee: "Avance Tontine" },
];

const GOLD_COLOR = "#f59e0b";
const NAVY_DARK = "#0f172a";
const EMERALD = "#10b981";

// --- SHARED COMPONENTS ---
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const Badge = ({ children, color = "#64748b", bg = "#f1f5f9" }) => (
  <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, color, background: bg, textTransform: "uppercase" }}>{children}</span>
);

export default function AssociatesBank() {
  const [view, setView] = useState("dashboard"); // dashboard | tontine | assembly | loans | fleet
  const [loanStep, setLoanStep] = useState("apply"); // apply | analyzing | result
  const [activeResolution, setActiveResolution] = useState(null);
  const [karmaRating, setKarmaRating] = useState(942); // Score de Karma Logistique

  // Simulation Logic
  const triggerAiAudit = () => {
    setLoanStep("analyzing");
    setTimeout(() => {
      setLoanStep("result");
    }, 2500);
  };

  const renderDashboard = () => (
    <div className="animate-fade-in">
      {/* HEADER SECTION */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "40px 20px 60px", color: "#fff", borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.1 }}><Building2 size={180} /></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <div>
              <div style={{ fontSize: 13, color: GOLD_COLOR, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>LiviPro Ecosystem</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Banque des Associés</div>
            </div>
            <div style={{ padding: 10, background: "rgba(255,255,255,0.1)", borderRadius: 16 }}><ShieldCheck size={28} color={GOLD_COLOR} /></div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Capital Social Commun</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>142,500,000 <span style={{ fontSize: 14, fontWeight: 400 }}>F</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Associés Actifs</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>124 <span style={{ fontSize: 14, fontWeight: 400 }}>Part.</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ padding: "0 20px", marginTop: -32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
         {[
           { id: "fleet", icon: <Truck size={22} />, label: "Flotte", color: "#6366f1" },
           { id: "loans", icon: <HandCoins size={22} />, label: "Prêts IA", color: "#f59e0b" },
           { id: "assembly", icon: <Gavel size={22} />, label: "Karma", color: "#ec4899" },
           { id: "stats", icon: <TrendingUp size={22} />, label: "Assets", color: "#10b981" }
         ].map(action => (
           <div key={action.id} onClick={() => setView(action.id)} style={{ cursor: "pointer", background: "#fff", borderRadius: 18, height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              <div style={{ color: action.color, marginBottom: 6 }}>{action.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#1e293b" }}>{action.label}</div>
           </div>
         ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>Actualités de l'Assemblée</h3>
        <Card onClick={() => setView("assembly")} style={{ borderLeft: `4px solid ${GOLD_COLOR}`, background: "#fffbeb" }}>
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
             <Badge color="#b45309" bg="#fef3c7">Résolution en cours</Badge>
             <span style={{ fontSize: 12, color: "#92400E", fontWeight: 700 }}>24h restantes</span>
           </div>
           <div style={{ fontSize: 16, fontWeight: 800, color: "#92400E", marginBottom: 6 }}>{RESOLUTIONS[0].title}</div>
           <p style={{ fontSize: 13, color: "#b45309", opacity: 0.8, lineHeight: 1.4 }}>{RESOLUTIONS[0].description}</p>
           <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
             <div style={{ flex: 1, height: 6, background: "#fef3c7", borderRadius: 3, border: "1px solid #fde68a" }}>
                <div style={{ height: "100%", width: "75%", background: "#b45309", borderRadius: 3 }}></div>
             </div>
             <span style={{ fontSize: 12, fontWeight: 800, color: "#b45309" }}>75% OUI</span>
           </div>
        </Card>

        {/* TOP PARTNERS */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>Associés Leaders</h3>
            <span style={{ fontSize: 12, color: GOLD_COLOR, fontWeight: 700 }}>Voir tout</span>
          </div>
          {PARTNERS.slice(0, 3).map(partner => (
            <div key={partner.id} style={{ display: "flex", alignItems: "center", background: "#fff", padding: 12, borderRadius: 16, marginBottom: 10, border: "1px solid #f1f5f9" }}>
              <div style={{ width: 44, height: 44, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {partner.type === "Wholesaler" ? "🏢" : "🏪"}
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{partner.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Part: {partner.shares} · {partner.contribution}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: partner.score > 90 ? EMERALD : "#f59e0b" }}>{partner.score}%</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>Score IA</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoansPage = () => (
    <div className="animate-fade-in" style={{ padding: 24, paddingBottom: 100 }}>
       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none" }}><ArrowLeft size={24} /></button>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>Prêts IA Boutiques</h2>
       </div>

       {loanStep === "apply" && (
         <>
          <Card style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#fff", border: "none", marginBottom: 24 }}>
             <Cpu size={32} style={{ marginBottom: 12 }} />
             <div style={{ fontSize: 20, fontWeight: 900 }}>Algorithme de Crédit Prédictif</div>
             <p style={{ fontSize: 13, marginTop: 8, opacity: 0.9, lineHeight: 1.5 }}>
               En tant qu'associé Boutique, vous pouvez débloquer un prêt instantané basé sur voter historique logistique LiviPro.
               <br/><br/>
               • Ponctualité des déchargements<br/>
               • Taux de litige <br/>
               • Engagement dans la Tontine
             </p>
          </Card>

          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Simuler une demande de prêt</div>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "2px solid #f1f5f9" }}>
             <div style={{ marginBottom: 20 }}>
               <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Montant souhaité</label>
               <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>500,000 <span style={{ fontSize: 16 }}>FCFA</span></div>
               <input type="range" style={{ width: "100%", marginTop: 12, accentColor: GOLD_COLOR }} />
             </div>
             
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, background: "#f8fafc", padding: 12, borderRadius: 12 }}>
                <div><div style={{ fontSize: 10, color: "#94a3b8" }}>TAUX ASSOCIÉ</div><div style={{ fontSize: 15, fontWeight: 800 }}>4.2%</div></div>
                <div><div style={{ fontSize: 10, color: "#94a3b8" }}>DURÉE</div><div style={{ fontSize: 15, fontWeight: 800 }}>6 Mois</div></div>
                <div><div style={{ fontSize: 10, color: "#94a3b8" }}>MENSUALITÉ</div><div style={{ fontSize: 15, fontWeight: 800 }}>88.500 F</div></div>
             </div>

             <button onClick={triggerAiAudit} style={{ width: "100%", background: "#0f172a", color: "#fff", border: "none", padding: 18, borderRadius: 16, fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <Sparkles size={20} color={GOLD_COLOR} /> Lancer l'Audit IA
             </button>
          </div>
         </>
       )}

       {loanStep === "analyzing" && (
         <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="animate-spin" style={{ margin: "0 auto 30px", width: 80, height: 80, border: "4px solid #f1f5f9", borderTopColor: GOLD_COLOR, borderRadius: "50%" }}></div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Audit IA en cours...</h3>
            <div style={{ fontSize: 14, color: "#64748b" }}>
              Analyse des données logistiques de LiviPro...<br/>
              Vérification des scores de Tontine...<br/>
              Simulation de solvabilité...
            </div>
         </div>
       )}

       {loanStep === "result" && (
         <div className="animate-slide-up">
            <div style={{ background: "#ecfdf5", border: "1px solid #10b981", borderRadius: 24, padding: 24, textAlign: "center", marginBottom: 24 }}>
               <div style={{ background: "#10b981", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                 <CheckCircle2 color="#fff" size={36} />
               </div>
               <h3 style={{ fontSize: 22, fontWeight: 900, color: "#065f46" }}>Prêt Pré-Approuvé !</h3>
               <div style={{ fontSize: 14, color: "#065f46", opacity: 0.8, marginTop: 4 }}>Score de Solvabilité IA : 95/100 (A+)</div>
            </div>

            <Card style={{ marginBottom: 20 }}>
               <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Détails du Déblocage</div>
               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ color: "#64748b" }}>Fonds disponibles</span><span style={{ fontWeight: 800 }}>Instant-Bank LiviPro</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ color: "#64748b" }}>Destination</span><span style={{ fontWeight: 800 }}>Wallet Supermarché Al-Amine</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ color: "#64748b" }}>Garantie</span><span style={{ fontWeight: 800 }}>Shares Banque Associés</span></div>
               </div>
            </Card>

            <button onClick={() => setLoanStep("apply")} style={{ width: "100%", background: "#10b981", color: "#fff", border: "none", padding: 18, borderRadius: 16, fontWeight: 900, fontSize: 16 }}>
               Signer & Recevoir les Fonds
            </button>
         </div>
       )}

       <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>Historique des Prêts</h3>
          {LOAN_HISTORY.map(loan => (
            <div key={loan.id} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f1f5f9" }}>
               <div>
                 <div style={{ fontSize: 14, fontWeight: 800 }}>{loan.applicant}</div>
                 <div style={{ fontSize: 12, color: "#64748b" }}>{loan.date} · Score {loan.aiScore}</div>
               </div>
               <div style={{ textAlign: "right" }}>
                 <div style={{ fontSize: 14, fontWeight: 900 }}>{loan.amount}</div>
                 <Badge color={loan.status === "Paid" ? EMERALD : "#3b82f6"} bg={loan.status === "Paid" ? "#ecfdf5" : "#eff6ff"}>{loan.status}</Badge>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderAssembly = () => (
    <div className="animate-fade-in" style={{ padding: 24, paddingBottom: 100 }}>
       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none" }}><ArrowLeft size={24} /></button>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>Gouvernance & Karma</h2>
       </div>

       {/* LOGISTICS KARMA CARD */}
       <div style={{ background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", borderRadius: 24, padding: 24, color: "#fff", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.1 }}><Sparkles size={120} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", opacity: 0.9 }}>Votre Score Karma Logistique</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 4 }}>
            <div style={{ fontSize: 42, fontWeight: 900 }}>{karmaRating}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fbcfe8", marginBottom: 8 }}>/ 1000 Pts</div>
          </div>
          <div style={{ marginTop: 16, background: "rgba(0,0,0,0.2)", padding: '12px 16px', borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
             <div><div style={{ fontSize: 10, color: "#fbcfe8" }}>POIDS DE VOTE</div><div style={{ fontSize: 15, fontWeight: 900 }}>x1.42</div></div>
             <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#fbcfe8" }}>TAUX PRÊT IA</div><div style={{ fontSize: 15, fontWeight: 900 }}>3.8%</div></div>
          </div>
       </div>

       <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 16 }}>Résolutions des Associés</h3>
       {RESOLUTIONS.map(res => (
         <Card key={res.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
               <Badge color={res.status === "Open" ? "#b45309" : EMERALD} bg={res.status === "Open" ? "#fef3c7" : "#ecfdf5"}>{res.status}</Badge>
               <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Expire le {res.deadline}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{res.title}</div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>{res.description}</p>
            
            {res.status === "Open" ? (
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{ flex: 1, background: "#ecfdf5", color: EMERALD, border: "2px solid #10b981", padding: 12, borderRadius: 12, fontWeight: 800 }}>VOTER OUI</button>
                <button style={{ flex: 1, background: "#fff", color: "#ef4444", border: "2px solid #ef4444", padding: 12, borderRadius: 12, fontWeight: 800 }}>NON</button>
              </div>
            ) : (
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                 <div style={{ fontSize: 13, fontWeight: 700 }}>Résultat: <span style={{ color: EMERALD }}>Adoptée</span></div>
                 <div style={{ fontSize: 13, fontWeight: 700 }}>OUI: 95%</div>
              </div>
            )}
         </Card>
       ))}
    </div>
  );

  const renderFleetPage = () => (
    <div className="animate-fade-in" style={{ padding: 24, paddingBottom: 100 }}>
       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none" }}><ArrowLeft size={24} /></button>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>Co-Actionnariat Flotte</h2>
       </div>

       <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", marginBottom: 24, borderTop: `8px solid #6366f1` }}>
         <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Partage de Profits Mensuel</div>
         <div style={{ fontSize: 28, fontWeight: 900, color: "#6366f1", marginTop: 4 }}>63.500 <span style={{ fontSize: 14 }}>FCFA</span></div>
         <div style={{ marginTop: 12, background: "#f0f9ff", padding: 12, borderRadius: 12, color: "#0369a1", fontSize: 12, fontWeight: 700, display: "flex", gap: 8 }}>
            <TrendingUp size={16} /> +12% vs le mois dernier (Efficience Gazole)
         </div>
       </div>

       <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 16 }}>Vos Camions (Micro-Parts)</h3>
       {FLEET_STAKES.map(truck => (
         <Card key={truck.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
               <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{truck.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>ID: {truck.id} · Part: {truck.stake}</div>
               </div>
               <Badge color={EMERALD} bg="#ecfdf5">{truck.status}</Badge>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", padding: 12, borderRadius: 12, marginBottom: 12 }}>
               <div><div style={{ fontSize: 10, color: "#94a3b8" }}>DIVIDENDES</div><div style={{ fontSize: 14, fontWeight: 800 }}>{truck.earnings}</div></div>
               <div><div style={{ fontSize: 10, color: "#94a3b8" }}>ÉGO-SCORE</div><div style={{ fontSize: 14, fontWeight: 800, color: EMERALD }}>{truck.fuelEfficiency}</div></div>
            </div>
            
            <button style={{ width: "100%", background: "#f1f5f9", border: "none", padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 800, color: "#6366f1" }}>Voir Historique GPS du profit</button>
         </Card>
       ))}

       <div style={{ marginTop: 24, padding: 20, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: 20, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Investir dans un nouveau camion ?</div>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>Participez à la levée de fonds "LiviPro North-Route 2026"</p>
          <button style={{ width: "100%", background: GOLD_COLOR, color: "#fff", border: "none", padding: 12, borderRadius: 12, fontWeight: 900 }}>Prise de parts à partir de 50.000 F</button>
       </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#f8fafc", minHeight: "100vh", position: "relative", fontFamily: "'Inter', sans-serif" }}>
       
       <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.4s ease-out; }
          .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
       `}</style>
       
       {view === "dashboard" && renderDashboard()}
       {view === "loans" && renderLoansPage()}
       {view === "assembly" && renderAssembly()}
       {view === "fleet" && renderFleetPage()}

       {/* NAV BAR MOCK */}
       <div style={{ position: "fixed", bottom: 0, width: "100%", maxWidth: 480, height: 70, background: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
          <div onClick={() => setView("dashboard")} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: view === "dashboard" ? GOLD_COLOR : "#94a3b8", cursor: "pointer" }}>
            <Building2 size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>BANQUE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#94a3b8" }}>
            <Wallet size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>PORTES</span>
          </div>
          <div style={{ background: NAVY_DARK, width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -25, border: "5px solid #f8fafc" }}>
            <HandCoins size={24} color={GOLD_COLOR} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#94a3b8" }}>
            <History size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>FLUX</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#94a3b8" }}>
            <AlertCircle size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>AIDE</span>
          </div>
       </div>

    </div>
  );
}
