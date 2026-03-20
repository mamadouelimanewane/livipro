import { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";
const fmt = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

const queryClient = new QueryClient();

interface AuthState {
  grossisteId: number | null;
  boutiqueId: number | null;
  boutiqueNom: string;
  grossisteNom: string;
}
const AuthCtx = createContext<{ auth: AuthState; setAuth: (a: AuthState) => void }>({
  auth: { grossisteId: null, boutiqueId: null, boutiqueNom: "", grossisteNom: "" },
  setAuth: () => {},
});
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>(() => {
    try { return JSON.parse(localStorage.getItem("boutiquier_auth") || "null") || { grossisteId: null, boutiqueId: null, boutiqueNom: "", grossisteNom: "" }; }
    catch { return { grossisteId: null, boutiqueId: null, boutiqueNom: "", grossisteNom: "" }; }
  });
  const setAuth = (a: AuthState) => { setAuthState(a); localStorage.setItem("boutiquier_auth", JSON.stringify(a)); };
  return <AuthCtx.Provider value={{ auth, setAuth }}>{children}</AuthCtx.Provider>;
}

function Login() {
  const { setAuth } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGrossiste, setSelectedGrossiste] = useState<any>(null);
  const [selectedBoutique, setSelectedBoutique] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const { data: grossistes } = useQuery({
    queryKey: ["grossistes"],
    queryFn: () => fetch(`${API}/admin/grossistes`).then(r => r.json()),
  });

  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", selectedGrossiste?.id],
    queryFn: () => fetch(`${API}/grossistes/${selectedGrossiste.id}/boutiques`).then(r => r.json()),
    enabled: !!selectedGrossiste,
  });

  const handlePin = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === "1234" || newPin.length === 4) {
            setAuth({ grossisteId: selectedGrossiste.id, boutiqueId: selectedBoutique.id, boutiqueNom: selectedBoutique.nom, grossisteNom: selectedGrossiste.nom });
          } else {
            setError("PIN incorrect"); setPin("");
          }
        }, 300);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#f97316", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🏪</div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>LiviPro</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 0" }}>Espace Boutiquier</p>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 20, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? "#f97316" : "#334155", marginRight: s < 3 ? 4 : 0 }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Votre distributeur</h2>
            {(grossistes || []).map((g: any) => (
              <button key={g.id} onClick={() => { setSelectedGrossiste(g); setStep(2); }}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
                {g.nom}
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{g.ville}</div>
              </button>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 14, marginBottom: 12, padding: 0 }}>← Retour</button>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Votre boutique</h2>
            {(boutiques || []).map((b: any) => (
              <button key={b.id} onClick={() => { setSelectedBoutique(b); setStep(3); }}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
                {b.nom}
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{b.adresse}</div>
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 14, marginBottom: 12, padding: 0 }}>← Retour</button>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Code PIN</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>{selectedBoutique?.nom}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 48, height: 48, borderRadius: 12, background: pin.length > i ? "#f97316" : "#0f172a", border: "2px solid " + (pin.length > i ? "#f97316" : "#334155"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pin.length > i && <div style={{ width: 10, height: 10, borderRadius: 5, background: "#fff" }} />}
                </div>
              ))}
            </div>
            {error && <p style={{ color: "#ef4444", textAlign: "center", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
                <button key={i} onClick={() => d === "⌫" ? setPin(p => p.slice(0,-1)) : d !== "" ? handlePin(d) : undefined}
                  disabled={d === ""}
                  style={{ height: 56, borderRadius: 12, background: d === "" ? "transparent" : "#0f172a", border: d === "" ? "none" : "1px solid #334155", color: "#fff", fontSize: 20, fontWeight: 600, cursor: d === "" ? "default" : "pointer" }}>
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
  });
  const { data: creditScores } = useQuery({
    queryKey: ["credit-scores", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/credit-scores`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const { data: fidelite } = useQuery({
    queryKey: ["fidelite", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fidelite`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });

  const myLivraisons = (livraisons || []).filter((l: any) => l.boutiqueId === auth.boutiqueId);
  const myCredit = (creditScores || []).find((c: any) => c.boutiqueId === auth.boutiqueId);
  const myFidelite = (fidelite || []).find((f: any) => f.boutiqueId === auth.boutiqueId);

  const enAttente = myLivraisons.filter((l: any) => l.statut === "en_attente").length;
  const livrees = myLivraisons.filter((l: any) => l.statut === "livree").length;
  const totalCA = myLivraisons.filter((l: any) => l.statut === "livree").reduce((s: number, l: any) => s + (l.montant || 0), 0);

  const niveauColors: Record<string, string> = { Bronze: "#cd7f32", Argent: "#94a3b8", Or: "#f59e0b", Platine: "#a78bfa" };
  const risqueColors: Record<string, string> = { faible: "#22c55e", modere: "#f59e0b", eleve: "#ef4444", critique: "#dc2626" };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 4px" }}>Bonjour 👋</p>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 16px" }}>{auth.boutiqueNom}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(249,115,22,0.15)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ color: "#f97316", fontSize: 22, fontWeight: 700 }}>{enAttente}</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>En attente</div>
          </div>
          <div style={{ background: "rgba(34,197,94,0.15)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ color: "#22c55e", fontSize: 22, fontWeight: 700 }}>{livrees}</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>Livrées</div>
          </div>
          <div style={{ background: "rgba(139,92,246,0.15)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ color: "#a78bfa", fontSize: 14, fontWeight: 700 }}>{(totalCA / 1000).toFixed(0)}K</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>FCFA CA</div>
          </div>
        </div>
      </div>

      {myCredit && (
        <div style={{ background: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 4px" }}>Score de crédit</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{myCredit.score}</span>
                <span style={{ color: "#64748b", fontSize: 14 }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ background: risqueColors[myCredit.risque] + "25", color: risqueColors[myCredit.risque], padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
                {myCredit.risque === "faible" ? "✓ Faible risque" : myCredit.risque === "modere" ? "⚠ Modéré" : "⛔ Élevé"}
              </span>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>Limite: {fmt(myCredit.limiteRecommandee)}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, background: "#0f172a", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{ width: myCredit.score + "%", height: "100%", background: risqueColors[myCredit.risque], borderRadius: 8 }} />
          </div>
        </div>
      )}

      {myFidelite && (
        <div style={{ background: "linear-gradient(135deg, " + (niveauColors[myFidelite.niveau] || "#f97316") + "20, #1e293b)", border: "1px solid " + (niveauColors[myFidelite.niveau] || "#f97316") + "40", borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 4px" }}>Programme Fidélité</p>
              <div style={{ color: niveauColors[myFidelite.niveau] || "#f97316", fontSize: 20, fontWeight: 700 }}>⭐ {myFidelite.niveau}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>{myFidelite.points}</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>points</div>
            </div>
          </div>
          {myFidelite.pointsProchainNiveau > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>Prochain niveau</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{myFidelite.pointsProchainNiveau - myFidelite.points} pts restants</span>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 8, height: 6 }}>
                <div style={{ width: Math.min(100, (myFidelite.points / myFidelite.pointsProchainNiveau) * 100) + "%", height: "100%", background: niveauColors[myFidelite.niveau] || "#f97316", borderRadius: 8 }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Livraisons() {
  const { auth } = useAuth();
  const { data: livraisons, isLoading } = useQuery({
    queryKey: ["livraisons", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });

  const myLivraisons = (livraisons || []).filter((l: any) => l.boutiqueId === auth.boutiqueId);
  const statutColors: Record<string, { bg: string; color: string; label: string }> = {
    en_attente: { bg: "#f59e0b25", color: "#f59e0b", label: "En attente" },
    livree: { bg: "#22c55e25", color: "#22c55e", label: "Livrée ✓" },
    echec: { bg: "#ef444425", color: "#ef4444", label: "Échec" },
    litige: { bg: "#a78bfa25", color: "#a78bfa", label: "Litige" },
  };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Mes livraisons</h2>
      {isLoading && <div style={{ color: "#64748b", textAlign: "center", padding: 32 }}>Chargement...</div>}
      {myLivraisons.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ color: "#64748b" }}>Aucune livraison</div>
        </div>
      )}
      {myLivraisons.map((l: any) => {
        const s = statutColors[l.statut] || statutColors.en_attente;
        return (
          <div key={l.id} style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>Tournée #{l.tourneeId}</div>
                <div style={{ color: "#fff", fontWeight: 600, marginTop: 2 }}>{l.chauffeurNom || "—"}</div>
              </div>
              <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                {new Date(l.createdAt || Date.now()).toLocaleDateString("fr-FR")}
              </div>
              <div style={{ color: "#f97316", fontWeight: 700, fontSize: 16 }}>{fmt(l.montant || 0)}</div>
            </div>
            {l.statut === "litige" && l.commentaire && (
              <div style={{ marginTop: 8, background: "#a78bfa15", borderRadius: 8, padding: "8px 10px", color: "#a78bfa", fontSize: 12 }}>⚠ {l.commentaire}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Fidelite() {
  const { auth } = useAuth();
  const { data: fidelite } = useQuery({
    queryKey: ["fidelite", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fidelite`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });

  const myFidelite = (fidelite || []).find((f: any) => f.boutiqueId === auth.boutiqueId);
  const niveaux = [
    { nom: "Bronze", pts: 0, color: "#cd7f32", icon: "🥉" },
    { nom: "Argent", pts: 200, color: "#94a3b8", icon: "🥈" },
    { nom: "Or", pts: 500, color: "#f59e0b", icon: "🥇" },
    { nom: "Platine", pts: 1000, color: "#a78bfa", icon: "💎" },
  ];

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Programme Fidélité</h2>

      {myFidelite && (
        <div style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 20, padding: 24, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{niveaux.find(n => n.nom === myFidelite.niveau)?.icon || "⭐"}</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>{myFidelite.points} points</div>
          <div style={{ color: "#fed7aa", fontSize: 16 }}>Niveau {myFidelite.niveau}</div>
          {myFidelite.pointsProchainNiveau > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ color: "#fed7aa", fontSize: 12, marginBottom: 6 }}>{myFidelite.pointsProchainNiveau - myFidelite.points} pts pour le niveau suivant</div>
              <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 8, height: 8 }}>
                <div style={{ width: Math.min(100, (myFidelite.points / myFidelite.pointsProchainNiveau) * 100) + "%", height: "100%", background: "#fff", borderRadius: 8 }} />
              </div>
            </div>
          )}
        </div>
      )}

      <h3 style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Niveaux</h3>
      {niveaux.map(n => (
        <div key={n.nom} style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, border: myFidelite?.niveau === n.nom ? "1px solid " + n.color : "1px solid transparent" }}>
          <div style={{ fontSize: 32 }}>{n.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: n.color, fontWeight: 700, fontSize: 16 }}>{n.nom}</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>À partir de {n.pts} points</div>
          </div>
          {myFidelite?.niveau === n.nom && <div style={{ color: n.color, fontSize: 12, fontWeight: 600 }}>● Actuel</div>}
        </div>
      ))}

      <h3 style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600, margin: "20px 0 12px", textTransform: "uppercase", letterSpacing: 1 }}>Comment gagner des points</h3>
      {[
        { icon: "📦", label: "Livraison réussie", pts: "+10 pts" },
        { icon: "💰", label: "Par 10 000 FCFA achetés", pts: "+1 pt" },
        { icon: "📱", label: "Paiement mobile", pts: "+5 pts" },
        { icon: "⭐", label: "0 litige sur 30 jours", pts: "+50 pts" },
      ].map(r => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: 22, width: 36, textAlign: "center" }}>{r.icon}</div>
          <div style={{ flex: 1, color: "#e2e8f0", fontSize: 14 }}>{r.label}</div>
          <div style={{ color: "#f97316", fontWeight: 700 }}>{r.pts}</div>
        </div>
      ))}
    </div>
  );
}

function Profil() {
  const { auth, setAuth } = useAuth();
  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const boutique = (boutiques || []).find((b: any) => b.id === auth.boutiqueId);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "#1e293b", borderRadius: 20, padding: 24, marginBottom: 16, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🏪</div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{auth.boutiqueNom}</h2>
        <p style={{ color: "#64748b", margin: 0 }}>{boutique?.adresse || "—"}</p>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        {[
          { label: "Distributeur", value: auth.grossisteNom },
          { label: "Responsable", value: boutique?.responsable || "—" },
          { label: "Téléphone", value: boutique?.telephone || "—" },
          { label: "Ville", value: boutique?.ville || "—" },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid #0f172a" : "none" }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>{item.label}</span>
            <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { localStorage.removeItem("boutiquier_auth"); setAuth({ grossisteId: null, boutiqueId: null, boutiqueNom: "", grossisteNom: "" }); }}
        style={{ width: "100%", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 14, padding: 16, color: "#ef4444", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
        Se déconnecter
      </button>
    </div>
  );
}

type Tab = "dashboard" | "livraisons" | "fidelite" | "profil";

function MobileApp() {
  const { auth } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!auth.boutiqueId) return <Login />;

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "dashboard", icon: "🏠", label: "Accueil" },
    { id: "livraisons", icon: "📦", label: "Livraisons" },
    { id: "fidelite", icon: "⭐", label: "Fidélité" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 12 }}>LiviPro Boutiquier</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{auth.boutiqueNom}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏪</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 16 }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "livraisons" && <Livraisons />}
        {tab === "fidelite" && <Fidelite />}
        {tab === "profil" && <Profil />}
      </div>

      <div style={{ background: "#1e293b", borderTop: "1px solid #334155", display: "flex", position: "sticky", bottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "10px 4px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: tab === t.id ? "#f97316" : "#64748b", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
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
