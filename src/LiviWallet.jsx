import { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  CreditCard, 
  ShieldCheck, 
  History,
  Phone,
  ArrowRight
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const WAVE_BLUE = "#4c6ef5"; // Wave Blue
const OM_ORANGE = "#ff9900"; // Orange Money

export default function LiviWallet({ owner = "Supermarché Al-Amine", balance = 2450000 }) {
  const [activeView, setActiveView] = useState("home"); // home | topup | transactions
  const [selectedMethod, setSelectedMethod] = useState(null);

  const transactions = [
    { id: 1, type: "Order", amount: -45000, date: "26 Mars", method: "Internal" },
    { id: 2, type: "Top-up", amount: 150000, date: "25 Mars", method: "Wave" },
    { id: 3, type: "Cash Deposit", amount: 250000, date: "24 Mars", method: "LiviCash" },
  ];

  const renderHome = () => (
    <div className="animate-fade-in">
       <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: 28, padding: 30, color: "#fff", marginBottom: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.15)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>Solde LiviWallet</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{balance.toLocaleString()} <span style={{ fontSize: 16 }}>FCFA</span></div>
          <div style={{ fontSize: 13, opacity: 0.6, marginTop: 8 }}>Compte vérifié · {owner}</div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 30 }}>
          <button onClick={() => setActiveView("topup")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f1f5f9", padding: 16, borderRadius: 20, cursor: "pointer" }}>
             <div style={{ background: "#f0fdf4", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}><ArrowUpRight size={22} /></div>
             <span style={{ fontSize: 11, fontWeight: 800 }}>RECHARGER</span>
          </button>
          <button onClick={() => setActiveView("pay")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f1f5f9", padding: 16, borderRadius: 20, cursor: "pointer" }}>
             <div style={{ background: "#eff6ff", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}><ArrowDownLeft size={22} /></div>
             <span style={{ fontSize: 11, fontWeight: 800 }}>PAYER</span>
          </button>
          <button onClick={() => setActiveView("history")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f1f5f9", padding: 16, borderRadius: 20, cursor: "pointer" }}>
             <div style={{ background: "#f8fafc", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><RefreshCcw size={22} /></div>
             <span style={{ fontSize: 11, fontWeight: 800 }}>HISTORIQUE</span>
          </button>
       </div>

       <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <History size={18} color={GOLD} /> Activités Récentes
       </h3>
       {transactions.map(tx => (
         <div key={tx.id} style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
               <div style={{ background: tx.amount > 0 ? "#f0fdf4" : "#fee2e2", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: tx.amount > 0 ? "#10b981" : "#ef4444" }}>
                  {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
               </div>
               <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{tx.type}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{tx.date} · via {tx.method}</div>
               </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: tx.amount > 0 ? "#10b981" : "#0f172a" }}>
               {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
            </div>
         </div>
       ))}
    </div>
  );

  const renderTopup = () => (
    <div className="animate-fade-in">
       <button onClick={() => setActiveView("home")} style={{ background: "none", border: "none", fontWeight: 800, color: DARK_NAVY, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ArrowDownLeft size={20} style={{ transform: "rotate(45deg)" }} /> Annuler
       </button>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Recharger Wallet</h2>
       <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>Alimentez votre compte LiviPro via vos opérateurs habituels.</p>

       <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {[
            { id: "wave", label: "Wave Sénégal", color: WAVE_BLUE, logo: "🌊", fee: "1% Frais" },
            { id: "om", label: "Orange Money", color: OM_ORANGE, logo: "🍊", fee: "1% Frais" },
            { id: "bank", label: "Virement Bancaire", color: DARK_NAVY, logo: "🏦", fee: "0.5% Frais" },
          ].map(opt => (
            <div key={opt.id} onClick={() => setSelectedMethod(opt.id)} style={{ background: "#fff", border: selectedMethod === opt.id ? `2px solid ${opt.color}` : "2px solid #f1f5f9", borderRadius: 24, padding: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
               <div style={{ background: opt.color, width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>
                  {opt.logo}
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Délai : Instantané · {opt.fee}</div>
               </div>
               {selectedMethod === opt.id && <ShieldCheck color={opt.color} size={24} style={{ position: "absolute", top: 12, right: 12 }} />}
            </div>
          ))}
       </div>

       {selectedMethod && (
         <div style={{ marginTop: 40 }} className="animate-slide-up">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>MONTANT À DÉPOSER (FCFA) :</div>
            <input type="number" defaultValue="150000" style={{ width: "100%", padding: 18, borderRadius: 16, border: `2px solid ${selectedMethod === 'wave' ? WAVE_BLUE : OM_ORANGE}`, fontSize: 24, fontWeight: 900, textAlign: "center", outline: "none" }} />
            <button style={{ width: "100%", background: selectedMethod === 'wave' ? WAVE_BLUE : selectedMethod === 'om' ? OM_ORANGE : DARK_NAVY, color: "#fff", border: "none", padding: 20, borderRadius: 20, fontSize: 16, fontWeight: 900, marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
               Lancer le Paiement <ArrowRight size={20} />
            </button>
         </div>
       )}
    </div>
  );

  const renderPay = () => (
    <div className="animate-fade-in">
       <button onClick={() => setActiveView("home")} style={{ background: "none", border: "none", fontWeight: 800, color: DARK_NAVY, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ArrowDownLeft size={20} style={{ transform: "rotate(45deg)" }} /> Annuler
       </button>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Payer un Fournisseur</h2>
       <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>Scannez le code QR du grossiste pour valider le paiement.</p>
       
       <div style={{ width: "100%", height: 300, background: "#000", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ width: 200, height: 200, border: "2px solid #fff", borderRadius: 20, position: "relative" }}>
             <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: 2, background: GOLD, boxShadow: `0 0 10px ${GOLD}`, animation: "scan 2s infinite" }}></div>
          </div>
          <div style={{ position: "absolute", bottom: 20, color: "#fff", fontSize: 12, fontWeight: 700 }}>Alignez le QR code dans le cadre</div>
       </div>

       <style>{`
          @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
       `}</style>
    </div>
  );

  const renderHistory = () => (
    <div className="animate-fade-in">
       <button onClick={() => setActiveView("home")} style={{ background: "none", border: "none", fontWeight: 800, color: DARK_NAVY, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ArrowDownLeft size={20} style={{ transform: "rotate(45deg)" }} /> Retour
       </button>
       <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Historique Complet</h2>
       {transactions.map(tx => (
          <div key={tx.id} style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f1f5f9" }}>
             <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ background: tx.amount > 0 ? "#f0fdf4" : "#fee2e2", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: tx.amount > 0 ? "#10b981" : "#ef4444" }}>
                   {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                   <div style={{ fontSize: 14, fontWeight: 800 }}>{tx.type}</div>
                   <div style={{ fontSize: 11, color: "#94a3b8" }}>{tx.date} · via {tx.method}</div>
                </div>
             </div>
             <div style={{ fontSize: 15, fontWeight: 900, color: tx.amount > 0 ? "#10b981" : "#0f172a" }}>
                {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
             </div>
          </div>
       ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#f8fafc" }}>
       <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.4s ease-out; }
          .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
       `}</style>
       {activeView === "home" ? renderHome() : 
        activeView === "topup" ? renderTopup() : 
        activeView === "pay" ? renderPay() : 
        renderHistory()}
    </div>
  );
}
