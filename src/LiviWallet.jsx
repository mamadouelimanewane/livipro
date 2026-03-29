import { useState } from "react";
// LiviPro Wallet v3.1 - Force Deployment
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
const WAVE_BLUE = "#4c6ef5";
const OM_ORANGE = "#ff9900";

export default function LiviWallet({ owner = "Supermarché Al-Amine", balance = 2450000 }) {
  const [activeView, setActiveView] = useState("home");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [payMode, setPayMode] = useState("scan");
  const [payMethod, setPayMethod] = useState("wave");

  const transactions = [
    { id: 1, type: "Order", amount: -45000, date: "26 Mars", method: "Internal" },
    { id: 2, type: "Top-up", amount: 150000, date: "25 Mars", method: "Wave" },
    { id: 3, type: "Cash Deposit", amount: 250000, date: "24 Mars", method: "LiviCash" },
  ];

  const renderHome = () => (
    <div className="animate-fade-in">
      {/* Balance card */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 'clamp(20px, 4vw, 28px)',
        padding: 'clamp(20px, 5vw, 30px)',
        color: "#fff",
        marginBottom: 'clamp(16px, 4vw, 24px)',
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%"
        }} />
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: GOLD,
          textTransform: "uppercase",
          marginBottom: 12
        }}>
          Solde LiviWallet
        </div>
        <div style={{ fontSize: 'clamp(28px, 7vw, 36px)', fontWeight: 900 }}>
          {balance.toLocaleString()} <span style={{ fontSize: 'clamp(13px, 3vw, 16px)' }}>FCFA</span>
        </div>
        <div style={{ fontSize: 13, opacity: 0.6, marginTop: 8 }}>
          Compte vérifié · {owner}
        </div>
      </div>

      {/* Action buttons — 3-col grid on mobile (2x+1 look) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 'clamp(8px, 2vw, 12px)',
        marginBottom: 'clamp(20px, 4vw, 30px)'
      }}>
        {[
          {
            view: "topup",
            icon: <ArrowUpRight size={22} />,
            label: "RECHARGER",
            bg: "#f0fdf4",
            color: "#10b981"
          },
          {
            view: "pay",
            icon: <ArrowDownLeft size={22} />,
            label: "PAYER",
            bg: "#eff6ff",
            color: "#3b82f6"
          },
          {
            view: "history",
            icon: <RefreshCcw size={22} />,
            label: "HISTORIQUE",
            bg: "#f8fafc",
            color: "#64748b"
          }
        ].map(action => (
          <button
            key={action.view}
            onClick={() => setActiveView(action.view)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "1px solid #f1f5f9",
              padding: 'clamp(12px, 3vw, 16px) clamp(8px, 2vw, 12px)',
              borderRadius: 'clamp(14px, 3vw, 20px)',
              cursor: "pointer",
              minHeight: 80,
              touchAction: "manipulation"
            }}
          >
            <div style={{
              background: action.bg,
              width: 'clamp(36px, 8vw, 44px)',
              height: 'clamp(36px, 8vw, 44px)',
              borderRadius: 'clamp(10px, 2vw, 14px)',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: action.color,
              flexShrink: 0
            }}>
              {action.icon}
            </div>
            <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', fontWeight: 800, textAlign: "center" }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Recent transactions */}
      <h3 style={{
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: 900,
        marginBottom: 'clamp(10px, 2vw, 16px)',
        display: "flex",
        alignItems: "center",
        gap: 10
      }}>
        <History size={18} color={GOLD} /> Activités Récentes
      </h3>
      {transactions.map(tx => (
        <div
          key={tx.id}
          style={{
            background: "#fff",
            borderRadius: 'clamp(12px, 3vw, 18px)',
            padding: 'clamp(12px, 3vw, 16px)',
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #f1f5f9",
            gap: 8
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0, flex: 1 }}>
            <div style={{
              background: tx.amount > 0 ? "#f0fdf4" : "#fee2e2",
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tx.amount > 0 ? "#10b981" : "#ef4444",
              flexShrink: 0
            }}>
              {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tx.type}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{tx.date} · via {tx.method}</div>
            </div>
          </div>
          <div style={{
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            fontWeight: 900,
            color: tx.amount > 0 ? "#10b981" : "#0f172a",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}>
            {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
          </div>
        </div>
      ))}
    </div>
  );

  const renderTopup = () => (
    <div className="animate-fade-in">
      <button
        onClick={() => setActiveView("home")}
        style={{
          background: "none",
          border: "none",
          fontWeight: 800,
          color: DARK_NAVY,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 'clamp(16px, 4vw, 24px)',
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          minHeight: 44
        }}
      >
        <ArrowDownLeft size={20} style={{ transform: "rotate(45deg)" }} /> Annuler
      </button>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, marginBottom: 8 }}>
        Recharger Wallet
      </h2>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 'clamp(20px, 5vw, 32px)' }}>
        Alimentez votre compte LiviPro via vos opérateurs habituels.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 'clamp(10px, 2vw, 16px)' }}>
        {[
          { id: "wave", label: "Wave Sénégal", color: WAVE_BLUE, logo: "🌊", fee: "1% Frais" },
          { id: "om", label: "Orange Money", color: OM_ORANGE, logo: "🍊", fee: "1% Frais" },
          { id: "bank", label: "Virement Bancaire", color: DARK_NAVY, logo: "🏦", fee: "0.5% Frais" },
        ].map(opt => (
          <div
            key={opt.id}
            onClick={() => setSelectedMethod(opt.id)}
            style={{
              background: "#fff",
              border: selectedMethod === opt.id ? `2px solid ${opt.color}` : "2px solid #f1f5f9",
              borderRadius: 'clamp(16px, 3vw, 24px)',
              padding: 'clamp(14px, 3vw, 20px)',
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 'clamp(12px, 3vw, 20px)',
              position: "relative",
              minHeight: 72,
              touchAction: "manipulation"
            }}
          >
            <div style={{
              background: opt.color,
              width: 'clamp(44px, 10vw, 56px)',
              height: 'clamp(44px, 10vw, 56px)',
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 'clamp(18px, 4vw, 24px)',
              flexShrink: 0
            }}>
              {opt.logo}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 800 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Délai : Instantané · {opt.fee}
              </div>
            </div>
            {selectedMethod === opt.id && (
              <ShieldCheck color={opt.color} size={24} style={{ position: "absolute", top: 12, right: 12 }} />
            )}
          </div>
        ))}
      </div>

      {selectedMethod && (
        <div style={{ marginTop: 'clamp(24px, 5vw, 40px)' }} className="animate-slide-up">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>MONTANT À DÉPOSER (FCFA) :</div>
          <input
            type="number"
            defaultValue="150000"
            style={{
              width: "100%",
              padding: 'clamp(14px, 3vw, 18px)',
              borderRadius: 16,
              border: `2px solid ${selectedMethod === 'wave' ? WAVE_BLUE : OM_ORANGE}`,
              fontSize: 'clamp(20px, 5vw, 24px)',
              fontWeight: 900,
              textAlign: "center",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button style={{
            width: "100%",
            background: selectedMethod === 'wave' ? WAVE_BLUE : selectedMethod === 'om' ? OM_ORANGE : DARK_NAVY,
            color: "#fff",
            border: "none",
            padding: 'clamp(14px, 3vw, 20px)',
            borderRadius: 20,
            fontSize: 'clamp(14px, 3vw, 16px)',
            fontWeight: 900,
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            minHeight: 52,
            touchAction: "manipulation"
          }}>
            Lancer le Paiement <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );

  const renderPay = () => (
    <div className="animate-fade-in">
      <button
        onClick={() => setActiveView("home")}
        style={{
          background: "none",
          border: "none",
          fontWeight: 800,
          color: DARK_NAVY,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 'clamp(16px, 4vw, 24px)',
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          minHeight: 44
        }}
      >
        <ArrowDownLeft size={20} style={{ transform: "rotate(45deg)" }} /> Retour
      </button>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, marginBottom: 8 }}>
        Payer un Fournisseur
      </h2>

      {/* Pay mode toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 'clamp(16px, 4vw, 24px)' }}>
        <button
          onClick={() => setPayMode("scan")}
          style={{
            flex: 1,
            padding: 'clamp(10px, 2vw, 12px)',
            borderRadius: 14,
            background: payMode === "scan" ? DARK_NAVY : "#fff",
            color: payMode === "scan" ? "#fff" : "#64748b",
            border: "1px solid #e2e8f0",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            minHeight: 44,
            touchAction: "manipulation"
          }}
        >
          SCANNER QR
        </button>
        <button
          onClick={() => setPayMode("number")}
          style={{
            flex: 1,
            padding: 'clamp(10px, 2vw, 12px)',
            borderRadius: 14,
            background: payMode === "number" ? DARK_NAVY : "#fff",
            color: payMode === "number" ? "#fff" : "#64748b",
            border: "1px solid #e2e8f0",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            minHeight: 44,
            touchAction: "manipulation"
          }}
        >
          PAR NUMÉRO
        </button>
      </div>

      {payMode === "scan" ? (
        <div style={{
          width: "100%",
          height: 'clamp(240px, 50vw, 300px)',
          background: "#000",
          borderRadius: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            width: 'clamp(160px, 40vw, 200px)',
            height: 'clamp(160px, 40vw, 200px)',
            border: "2px solid #fff",
            borderRadius: 20,
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              height: 2,
              background: GOLD,
              boxShadow: `0 0 10px ${GOLD}`,
              animation: "scan 2s infinite"
            }} />
          </div>
        </div>
      ) : (
        <div className="animate-slide-up">
          {/* Method selector */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div
              onClick={() => setPayMethod("wave")}
              style={{
                flex: 1,
                minWidth: 120,
                height: 70,
                borderRadius: 16,
                background: payMethod === "wave" ? WAVE_BLUE : "#f8fafc",
                color: payMethod === "wave" ? "#fff" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
                border: "2px solid #f1f5f9",
                gap: 10,
                touchAction: "manipulation"
              }}
            >
              <img src="/wave_logo.png" alt="Wave" style={{ height: 32, borderRadius: 8 }} />
              <span translate="no">WAVE</span>
            </div>
            <div
              onClick={() => setPayMethod("om")}
              style={{
                flex: 1,
                minWidth: 120,
                height: 70,
                borderRadius: 16,
                background: payMethod === "om" ? OM_ORANGE : "#f8fafc",
                color: payMethod === "om" ? "#fff" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
                border: "2px solid #f1f5f9",
                gap: 10,
                touchAction: "manipulation"
              }}
            >
              <img src="/om_logo.png" alt="Orange Money" style={{ height: 32, borderRadius: 8 }} />
              <span translate="no">ORANGE MONEY</span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, color: "#64748b" }}>
              NUMÉRO DU DESTINATAIRE
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <Phone size={20} />
              </div>
              <input
                type="tel"
                placeholder="+221 ..."
                style={{
                  width: "100%",
                  padding: "16px 16px 16px 48px",
                  borderRadius: 16,
                  border: "2px solid #f1f5f9",
                  fontSize: 16,
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, color: "#64748b" }}>
              MONTANT (FCFA)
            </div>
            <input
              type="number"
              defaultValue="25000"
              style={{
                width: "100%",
                padding: "clamp(14px, 3vw, 20px)",
                borderRadius: 16,
                border: "2px solid #f1f5f9",
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: 900,
                textAlign: "center",
                color: DARK_NAVY,
                boxSizing: "border-box"
              }}
            />
          </div>

          <button style={{
            width: "100%",
            background: payMethod === "wave" ? WAVE_BLUE : OM_ORANGE,
            color: "#fff",
            border: "none",
            padding: 'clamp(14px, 3vw, 20px)',
            borderRadius: 20,
            fontSize: 'clamp(14px, 3vw, 16px)',
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            minHeight: 52,
            touchAction: "manipulation"
          }}>
            Confirmer le Paiement <ArrowRight size={20} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
      `}</style>
    </div>
  );

  const renderHistory = () => (
    <div className="animate-fade-in">
      <button
        onClick={() => setActiveView("home")}
        style={{
          background: "none",
          border: "none",
          fontWeight: 800,
          color: DARK_NAVY,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 'clamp(16px, 4vw, 24px)',
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          minHeight: 44
        }}
      >
        <ArrowDownLeft size={20} style={{ transform: "rotate(45deg)" }} /> Retour
      </button>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, marginBottom: 'clamp(14px, 4vw, 20px)' }}>
        Historique Complet
      </h2>
      {transactions.map(tx => (
        <div
          key={tx.id}
          style={{
            background: "#fff",
            borderRadius: 'clamp(12px, 3vw, 18px)',
            padding: 'clamp(12px, 3vw, 16px)',
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #f1f5f9",
            gap: 8
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0, flex: 1 }}>
            <div style={{
              background: tx.amount > 0 ? "#f0fdf4" : "#fee2e2",
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tx.amount > 0 ? "#10b981" : "#ef4444",
              flexShrink: 0
            }}>
              {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tx.type}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{tx.date} · via {tx.method}</div>
            </div>
          </div>
          <div style={{
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            fontWeight: 900,
            color: tx.amount > 0 ? "#10b981" : "#0f172a",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}>
            {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      maxWidth: "100%",
      width: "100%",
      margin: "0 auto",
      padding: 'clamp(14px, 4vw, 24px)',
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      background: "#f8fafc",
      boxSizing: "border-box",
      overflowX: "hidden"
    }}>
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
