import { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

const API = "/api";
const fmt = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";
const fmtK = (v: number) => (v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v));

const queryClient = new QueryClient();

interface AuthState {
  grossisteId: number | null;
  grossisteNom: string;
  grossisteVille: string;
}
const AuthCtx = createContext<{ auth: AuthState; setAuth: (a: AuthState) => void }>({
  auth: { grossisteId: null, grossisteNom: "", grossisteVille: "" },
  setAuth: () => {},
});
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>(() => {
    try { return JSON.parse(localStorage.getItem("grossiste_mobile_auth") || "null") || { grossisteId: null, grossisteNom: "", grossisteVille: "" }; }
    catch { return { grossisteId: null, grossisteNom: "", grossisteVille: "" }; }
  });
  const setAuth = (a: AuthState) => { setAuthState(a); localStorage.setItem("grossiste_mobile_auth", JSON.stringify(a)); };
  return <AuthCtx.Provider value={{ auth, setAuth }}>{children}</AuthCtx.Provider>;
}

function Login() {
  const { setAuth } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<any>(null);
  const [pin, setPin] = useState("");

  const { data: grossistes } = useQuery({
    queryKey: ["grossistes"],
    queryFn: () => fetch(`${API}/admin/grossistes`).then(r => r.json()),
  });

  const handlePin = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          setAuth({ grossisteId: selected.id, grossisteNom: selected.nom, grossisteVille: selected.ville });
        }, 300);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🏭</div>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>LiviPro</h1>
        <p style={{ color: "#f97316", fontSize: 14, margin: "4px 0 0", fontWeight: 600 }}>Espace Grossiste</p>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 24, padding: 24, width: "100%", maxWidth: 380 }}>
        {step === 1 && (
          <>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Sélectionnez votre compte</h2>
            {(grossistes || []).map((g: any) => (
              <button key={g.id} onClick={() => { setSelected(g); setStep(2); }}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: "16px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 10, textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, background: "#f9731620", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏭</div>
                <div>
                  <div>{g.nom}</div>
                  <div style={{ color: "#64748b", fontSize: 13, fontWeight: 400 }}>{g.ville}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "#f97316", fontSize: 18 }}>›</div>
              </button>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={() => { setStep(1); setPin(""); }} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 }}>← Retour</button>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Code PIN</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>{selected?.nom}</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 28 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 52, height: 52, borderRadius: 14, background: pin.length > i ? "#f97316" : "#0f172a", border: "2px solid " + (pin.length > i ? "#f97316" : "#334155"), display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  {pin.length > i && <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fff" }} />}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
                <button key={i} onClick={() => d === "⌫" ? setPin(p => p.slice(0,-1)) : d !== "" ? handlePin(d) : undefined}
                  disabled={d === ""}
                  style={{ height: 60, borderRadius: 14, background: d === "" ? "transparent" : "#0f172a", border: d === "" ? "none" : "1px solid #334155", color: "#fff", fontSize: 22, fontWeight: 600, cursor: d === "" ? "default" : "pointer" }}>
                  {d}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { auth } = useAuth();
  const { data: livraisons } = useQuery({
    queryKey: ["livraisons", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!auth.grossisteId,
    refetchInterval: 30000,
  });
  const { data: tournees } = useQuery({
    queryKey: ["tournees", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/tournees`).then(r => r.json()),
    enabled: !!auth.grossisteId,
    refetchInterval: 30000,
  });
  const { data: alertes } = useQuery({
    queryKey: ["alertes", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fraud-alerts`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });

  const livs = livraisons || [];
  const tourn = tournees || [];
  const alts = alertes || [];

  const caTotal = livs.filter((l: any) => l.statut === "livree").reduce((s: number, l: any) => s + (l.montant || 0), 0);
  const enAttente = livs.filter((l: any) => l.statut === "en_attente").length;
  const livrees = livs.filter((l: any) => l.statut === "livree").length;
  const encours = tourn.filter((t: any) => t.statut === "en_cours").length;
  const alertesHaute = alts.filter((a: any) => a.risque === "eleve" || a.risque === "critique").length;

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 2px", textTransform: "capitalize" }}>{today}</p>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>{auth.grossisteNom}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(249,115,22,0.15)", borderRadius: 14, padding: "14px 12px" }}>
            <div style={{ color: "#f97316", fontSize: 24, fontWeight: 800 }}>{fmtK(caTotal)}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>FCFA CA livré</div>
          </div>
          <div style={{ background: "rgba(34,197,94,0.15)", borderRadius: 14, padding: "14px 12px" }}>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 800 }}>{livrees}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>Livraisons OK</div>
          </div>
          <div style={{ background: "rgba(59,130,246,0.15)", borderRadius: 14, padding: "14px 12px" }}>
            <div style={{ color: "#60a5fa", fontSize: 24, fontWeight: 800 }}>{encours}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>Tournées en cours</div>
          </div>
          <div style={{ background: alertesHaute > 0 ? "rgba(239,68,68,0.15)" : "rgba(30,41,59,0.5)", borderRadius: 14, padding: "14px 12px" }}>
            <div style={{ color: alertesHaute > 0 ? "#ef4444" : "#64748b", fontSize: 24, fontWeight: 800 }}>{alertesHaute}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>Alertes fraude</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#1e293b", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ color: "#f59e0b", fontSize: 22, fontWeight: 700 }}>{enAttente}</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>En attente</div>
        </div>
        <div style={{ flex: 1, background: "#1e293b", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
          <div style={{ color: "#a78bfa", fontSize: 22, fontWeight: 700 }}>{tourn.length}</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>Total tournées</div>
        </div>
      </div>

      <h3 style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Tournées du jour</h3>
      {tourn.slice(0, 3).map((t: any) => {
        const statutColors: Record<string, { bg: string; color: string }> = {
          planifiee: { bg: "#f59e0b20", color: "#f59e0b" },
          en_cours: { bg: "#22c55e20", color: "#22c55e" },
          terminee: { bg: "#60a5fa20", color: "#60a5fa" },
          annulee: { bg: "#ef444420", color: "#ef4444" },
        };
        const s = statutColors[t.statut] || statutColors.planifiee;
        return (
          <div key={t.id} style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚚</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{t.chauffeurNom || `Tournée #${t.id}`}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{t.nombreLivraisons || 0} livraisons</div>
            </div>
            <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t.statut?.replace("_", " ")}</span>
          </div>
        );
      })}
      {tourn.length === 0 && <div style={{ color: "#64748b", textAlign: "center", padding: 24 }}>Aucune tournée aujourd'hui</div>}
    </div>
  );
}

function Tournees() {
  const { auth } = useAuth();
  const { data: tournees, isLoading } = useQuery({
    queryKey: ["tournees", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/tournees`).then(r => r.json()),
    enabled: !!auth.grossisteId,
    refetchInterval: 15000,
  });
  const [filtre, setFiltre] = useState<string>("tous");

  const filtres = ["tous", "planifiee", "en_cours", "terminee"];
  const tourn = (tournees || []).filter((t: any) => filtre === "tous" || t.statut === filtre);
  const statutColors: Record<string, { bg: string; color: string; label: string }> = {
    planifiee: { bg: "#f59e0b20", color: "#f59e0b", label: "Planifiée" },
    en_cours: { bg: "#22c55e20", color: "#22c55e", label: "En cours 🔄" },
    terminee: { bg: "#60a5fa20", color: "#60a5fa", label: "Terminée ✓" },
    annulee: { bg: "#ef444420", color: "#ef4444", label: "Annulée" },
  };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Tournées</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {filtres.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            style={{ padding: "6px 14px", borderRadius: 20, background: filtre === f ? "#f97316" : "#1e293b", border: "none", color: filtre === f ? "#fff" : "#94a3b8", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontWeight: filtre === f ? 700 : 400 }}>
            {f === "tous" ? "Toutes" : f.replace("_", " ")}
          </button>
        ))}
      </div>
      {isLoading && <div style={{ color: "#64748b", textAlign: "center", padding: 32 }}>Chargement...</div>}
      {tourn.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚚</div>
          <div style={{ color: "#64748b" }}>Aucune tournée trouvée</div>
        </div>
      )}
      {tourn.map((t: any) => {
        const s = statutColors[t.statut] || statutColors.planifiee;
        return (
          <div key={t.id} style={{ background: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{t.chauffeurNom || `Chauffeur #${t.chauffeurId}`}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>Tournée #{t.id}</div>
              </div>
              <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
              <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ color: "#fff", fontWeight: 700 }}>{t.nombreLivraisons || 0}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>Livraisons</div>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ color: "#22c55e", fontWeight: 700 }}>{t.livreesCount || 0}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>Livrées</div>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ color: "#f97316", fontWeight: 700, fontSize: 13 }}>{t.montantTotal ? fmtK(t.montantTotal) : "—"}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>FCFA</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Boutiques() {
  const { auth } = useAuth();
  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const { data: creditScores } = useQuery({
    queryKey: ["credit-scores", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/credit-scores`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const [search, setSearch] = useState("");

  const risqueColors: Record<string, { bg: string; color: string }> = {
    faible: { bg: "#22c55e20", color: "#22c55e" },
    modere: { bg: "#f59e0b20", color: "#f59e0b" },
    eleve: { bg: "#ef444420", color: "#ef4444" },
    critique: { bg: "#dc262620", color: "#dc2626" },
  };

  const botiquesdFiltered = (boutiques || []).filter((b: any) =>
    b.nom?.toLowerCase().includes(search.toLowerCase()) || b.adresse?.toLowerCase().includes(search.toLowerCase())
  );

  const getCredit = (boutiqueId: number) => (creditScores || []).find((c: any) => c.boutiqueId === boutiqueId);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Boutiques</h2>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
          style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
      </div>
      {botiquesdFiltered.map((b: any) => {
        const credit = getCredit(b.id);
        const r = credit ? (risqueColors[credit.risque] || risqueColors.modere) : null;
        return (
          <div key={b.id} style={{ background: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏪</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{b.nom}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{b.adresse}</div>
              </div>
              {credit && r && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{credit.score}</div>
                  <span style={{ background: r.bg, color: r.color, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{credit.risque}</span>
                </div>
              )}
            </div>
            {credit && (
              <div style={{ marginTop: 10 }}>
                <div style={{ background: "#0f172a", borderRadius: 6, height: 5 }}>
                  <div style={{ width: credit.score + "%", height: "100%", background: r?.color || "#f97316", borderRadius: 6 }} />
                </div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Limite crédit: {fmt(credit.limiteRecommandee)}</div>
              </div>
            )}
          </div>
        );
      })}
      {botiquesdFiltered.length === 0 && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
          <div style={{ color: "#64748b" }}>Aucune boutique trouvée</div>
        </div>
      )}
    </div>
  );
}

function Alertes() {
  const { auth } = useAuth();
  const { data: alertes, isLoading } = useQuery({
    queryKey: ["alertes", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fraud-alerts`).then(r => r.json()),
    enabled: !!auth.grossisteId,
    refetchInterval: 60000,
  });

  const niveauColors: Record<string, { bg: string; color: string; icon: string }> = {
    faible: { bg: "#22c55e20", color: "#22c55e", icon: "ℹ️" },
    modere: { bg: "#f59e0b20", color: "#f59e0b", icon: "⚠️" },
    eleve: { bg: "#ef444420", color: "#ef4444", icon: "🔴" },
    critique: { bg: "#dc262620", color: "#dc2626", icon: "🚨" },
  };

  const alts = (alertes || []).sort((a: any, b: any) => {
    const order: Record<string, number> = { critique: 0, eleve: 1, modere: 2, faible: 3 };
    return (order[a.risque] || 3) - (order[b.risque] || 3);
  });

  const haute = alts.filter((a: any) => a.risque === "eleve" || a.risque === "critique").length;

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Alertes</h2>
        {haute > 0 && <span style={{ background: "#ef444420", color: "#ef4444", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{haute} critiques</span>}
      </div>
      {isLoading && <div style={{ color: "#64748b", textAlign: "center", padding: 32 }}>Chargement...</div>}
      {alts.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ color: "#22c55e", fontWeight: 600 }}>Aucune alerte</div>
          <div style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Tout semble normal</div>
        </div>
      )}
      {alts.map((a: any, i: number) => {
        const n = niveauColors[a.risque] || niveauColors.modere;
        return (
          <div key={i} style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12, borderLeft: "3px solid " + n.color }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{a.boutiqueNom || `Boutique #${a.boutiqueId}`}</div>
                  <span style={{ background: n.bg, color: n.color, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{a.risque}</span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 14 }}>{a.description || a.type || "Comportement suspect détecté"}</div>
                {a.score !== undefined && (
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Score fraude: <span style={{ color: n.color, fontWeight: 700 }}>{a.score}/100</span></div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Profil() {
  const { auth, setAuth } = useAuth();
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 20, padding: 28, marginBottom: 20, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>🏭</div>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>{auth.grossisteNom}</h2>
        <p style={{ color: "#fed7aa", margin: 0 }}>📍 {auth.grossisteVille}</p>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Compte</span>
          <span style={{ color: "#e2e8f0", fontWeight: 500 }}>Grossiste</span>
        </div>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Ville</span>
          <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{auth.grossisteVille}</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>ID</span>
          <span style={{ color: "#e2e8f0", fontWeight: 500 }}>#{auth.grossisteId}</span>
        </div>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {[
          { icon: "🔔", label: "Notifications", value: "Activées" },
          { icon: "🌙", label: "Thème", value: "Sombre" },
          { icon: "🌍", label: "Langue", value: "Français" },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid #0f172a" : "none" }}>
            <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{item.icon}</span>
            <span style={{ color: "#e2e8f0", flex: 1, fontSize: 15 }}>{item.label}</span>
            <span style={{ color: "#64748b", fontSize: 14 }}>{item.value} ›</span>
          </div>
        ))}
      </div>

      <button onClick={() => { localStorage.removeItem("grossiste_mobile_auth"); setAuth({ grossisteId: null, grossisteNom: "", grossisteVille: "" }); }}
        style={{ width: "100%", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 14, padding: 16, color: "#ef4444", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        🚪 Se déconnecter
      </button>
    </div>
  );
}

type Tab = "dashboard" | "tournees" | "boutiques" | "alertes" | "profil";

function MobileApp() {
  const { auth } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  const { data: alertes } = useQuery({
    queryKey: ["alertes-count", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fraud-alerts`).then(r => r.json()),
    enabled: !!auth.grossisteId,
    refetchInterval: 60000,
  });
  const alertCount = (alertes || []).filter((a: any) => a.risque === "eleve" || a.risque === "critique").length;

  if (!auth.grossisteId) return <Login />;

  const tabs: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: "dashboard", icon: "📊", label: "Accueil" },
    { id: "tournees", icon: "🚚", label: "Tournées" },
    { id: "boutiques", icon: "🏪", label: "Boutiques" },
    { id: "alertes", icon: "🔔", label: "Alertes", badge: alertCount },
    { id: "profil", icon: "👤", label: "Profil" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>LiviPro Grossiste</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{auth.grossisteNom}</div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏭</div>
          {alertCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: "#ef4444", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{alertCount}</div>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 16 }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "tournees" && <Tournees />}
        {tab === "boutiques" && <Boutiques />}
        {tab === "alertes" && <Alertes />}
        {tab === "profil" && <Profil />}
      </div>

      <div style={{ background: "#1e293b", borderTop: "1px solid #334155", display: "flex", position: "sticky", bottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "8px 2px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: tab === t.id ? "#f97316" : "#64748b", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            {t.badge && t.badge > 0 ? <div style={{ position: "absolute", top: 4, right: "50%", transform: "translateX(8px)", width: 16, height: 16, background: "#ef4444", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>{t.badge}</div> : null}
            {tab === t.id && <div style={{ width: 20, height: 3, background: "#f97316", borderRadius: 2, position: "absolute", bottom: 0 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MobileApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
