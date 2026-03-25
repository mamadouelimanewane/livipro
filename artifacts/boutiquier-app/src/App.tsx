import { useState, useEffect, useRef, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SignaturePad from "signature_pad";

const API = (import.meta.env.VITE_API_BASE_URL || "") + "/api";
const fmt = (v: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

// ─── AUTH CONTEXT ────────────────────────────────────────────────────────────

interface AuthState {
  grossisteId: number | null;
  boutiqueId: number | null;
  boutiqueNom: string;
  grossisteNom: string;
  token: string | null;
}

const EMPTY_AUTH: AuthState = { grossisteId: null, boutiqueId: null, boutiqueNom: "", grossisteNom: "", token: null };

const AuthCtx = createContext<{
  auth: AuthState;
  setAuth: (a: AuthState) => void;
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}>({
  auth: EMPTY_AUTH,
  setAuth: () => {},
  authFetch: (url, opts) => fetch(url, opts),
});
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>(() => {
    try { return JSON.parse(localStorage.getItem("boutiquier_auth") || "null") || EMPTY_AUTH; }
    catch { return EMPTY_AUTH; }
  });

  const setAuth = (a: AuthState) => {
    setAuthState(a);
    localStorage.setItem("boutiquier_auth", JSON.stringify(a));
  };

  // Fetch wrapper qui injecte le Bearer token automatiquement
  const authFetch = (url: string, opts: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts.headers as Record<string, string> || {}),
    };
    if (auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`;
    }
    return fetch(url, { ...opts, headers });
  };

  return <AuthCtx.Provider value={{ auth, setAuth, authFetch }}>{children}</AuthCtx.Provider>;
}

// ─── CART CONTEXT ─────────────────────────────────────────────────────────────

interface CartItem { produitId: number; nom: string; unite: string; prix: number; quantite: number; }
const CartCtx = createContext<{
  cart: CartItem[];
  add: (p: CartItem) => void;
  remove: (id: number) => void;
  update: (id: number, q: number) => void;
  clear: () => void;
}>({ cart: [], add: () => {}, remove: () => {}, update: () => {}, clear: () => {} });
function useCart() { return useContext(CartCtx); }

function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const add = (p: CartItem) => setCart(c => {
    const existing = c.find(x => x.produitId === p.produitId);
    if (existing) return c.map(x => x.produitId === p.produitId ? { ...x, quantite: x.quantite + p.quantite } : x);
    return [...c, p];
  });
  const remove = (id: number) => setCart(c => c.filter(x => x.produitId !== id));
  const update = (id: number, q: number) => setCart(c => c.map(x => x.produitId === id ? { ...x, quantite: q } : x));
  const clear = () => setCart([]);
  return <CartCtx.Provider value={{ cart, add, remove, update, clear }}>{children}</CartCtx.Provider>;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  card: { background: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12 } as React.CSSProperties,
  h2: { color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 16, margin: "0 0 16px" } as React.CSSProperties,
  badge: (color: string) => ({ background: color + "25", color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 } as React.CSSProperties),
  btn: (color = "#f97316") => ({ background: color, color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" } as React.CSSProperties),
  btnOutline: { background: "none", border: "1px solid #334155", borderRadius: 12, padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#94a3b8", cursor: "pointer" } as React.CSSProperties,
  input: { width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" } as React.CSSProperties,
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" } as React.CSSProperties,
};

const statusMap: Record<string, { color: string; label: string; icon: string }> = {
  en_attente: { color: "#f59e0b", label: "En attente", icon: "⏳" },
  livree: { color: "#22c55e", label: "Livrée", icon: "✅" },
  echec: { color: "#ef4444", label: "Échec", icon: "❌" },
  litige: { color: "#a78bfa", label: "Litige", icon: "⚠️" },
  confirmee: { color: "#3b82f6", label: "Confirmée", icon: "✓" },
  en_preparation: { color: "#f97316", label: "En préparation", icon: "📦" },
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────

function Login() {
  const { setAuth } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGrossiste, setSelectedGrossiste] = useState<any>(null);
  const [selectedBoutique, setSelectedBoutique] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: grossistes } = useQuery({ queryKey: ["g"], queryFn: () => fetch(`${API}/admin/grossistes`).then(r => r.json()) });
  const { data: boutiques } = useQuery({
    queryKey: ["b", selectedGrossiste?.id],
    queryFn: () => fetch(`${API}/grossistes/${selectedGrossiste.id}/boutiques`).then(r => r.json()),
    enabled: !!selectedGrossiste,
  });

  const handlePin = async (digit: string) => {
    if (pin.length >= 4 || loading) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/auth/boutiquier`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grossisteId: selectedGrossiste.id,
            boutiqueId: selectedBoutique.id,
            pin: newPin,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "PIN incorrect. Veuillez réessayer.");
          setPin("");
          setLoading(false);
          return;
        }
        setAuth({
          grossisteId: selectedGrossiste.id,
          boutiqueId: selectedBoutique.id,
          boutiqueNom: selectedBoutique.nom,
          grossisteNom: selectedGrossiste.nom,
          token: data.token,
        });
      } catch {
        setError("Erreur de connexion. Vérifiez votre réseau.");
        setPin("");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36, boxShadow: "0 8px 32px #f9731640" }}>🏪</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>LiviPro</h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>Espace Boutiquier</p>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 24, padding: 28, width: "100%", maxWidth: 380, border: "1px solid #334155" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? "#f97316" : "#334155", transition: "background 0.3s" }} />)}
        </div>

        {step === 1 && <>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Étape 1/3 — Sélectionnez votre distributeur</p>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Votre distributeur</h2>
          {(grossistes || []).map((g: any) => (
            <button key={g.id} onClick={() => { setSelectedGrossiste(g); setStep(2); }}
              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: "16px", color: "#fff", cursor: "pointer", marginBottom: 8, textAlign: "left", transition: "border-color 0.2s" }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{g.nom}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>📍 {g.ville}</div>
            </button>
          ))}
        </>}

        {step === 2 && <>
          <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>← Retour</button>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Étape 2/3 — {selectedGrossiste?.nom}</p>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Votre boutique</h2>
          {(boutiques || []).map((b: any) => (
            <button key={b.id} onClick={() => { setSelectedBoutique(b); setStep(3); setPin(""); setError(""); }}
              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 14, padding: 16, color: "#fff", cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{b.nom}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>👤 {b.proprietaire}</div>
            </button>
          ))}
        </>}

        {step === 3 && <>
          <button onClick={() => { setStep(2); setPin(""); setError(""); }} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>← Retour</button>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>Étape 3/3</p>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Code PIN</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>{selectedBoutique?.nom}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f97316", fontSize: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                Vérification en cours…
              </div>
            ) : [0,1,2,3].map(i => (
              <div key={i} style={{ width: 52, height: 52, borderRadius: 14, background: pin.length > i ? "#f97316" : "#0f172a", border: "2px solid " + (pin.length > i ? "#f97316" : "#334155"), display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {pin.length > i && <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fff" }} />}
              </div>
            ))}
          </div>
          {error && <p style={{ color: "#ef4444", textAlign: "center", fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
              <button key={i} onClick={() => d === "⌫" ? (loading ? null : setPin(p => p.slice(0,-1))) : d !== "" ? handlePin(d) : undefined}
                disabled={d === ""}
                style={{ height: 60, borderRadius: 14, background: d === "" ? "transparent" : "#0f172a", border: d === "" ? "none" : "1px solid #334155", color: "#fff", fontSize: 22, fontWeight: 600, cursor: d === "" ? "default" : "pointer", transition: "background 0.1s" }}>
                {d}
              </button>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────

function Dashboard({ setTab }: { setTab: (t: string) => void }) {
  const { auth } = useAuth();
  const { data: livraisons } = useQuery({
    queryKey: ["livraisons", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!auth.grossisteId, refetchInterval: 30000,
  });
  const { data: fidelite } = useQuery({
    queryKey: ["fidelite", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fidelite`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const { data: creditScores } = useQuery({
    queryKey: ["credit", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/credit-scores`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const { data: commandes } = useQuery({
    queryKey: ["commandes-boutique", auth.boutiqueId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/boutiques/${auth.boutiqueId}/commandes`).then(r => r.json()),
    enabled: !!auth.boutiqueId,
  });

  const myLivraisons = (livraisons || []).filter((l: any) => l.boutiqueId === auth.boutiqueId);
  const myFidelite = (fidelite || []).find((f: any) => f.boutiqueId === auth.boutiqueId);
  const myCredit = (creditScores || []).find((c: any) => c.boutiqueId === auth.boutiqueId);
  const enCours = myLivraisons.filter((l: any) => l.statut === "en_attente");
  const livrees = myLivraisons.filter((l: any) => l.statut === "livree");
  const caTotal = livrees.reduce((s: number, l: any) => s + (Number(l.montant) || 0), 0);
  const commandesEnCours = (commandes || []).filter((c: any) => ["en_attente", "confirmee", "en_preparation"].includes(c.statut));

  const niveauColors: Record<string, string> = { Bronze: "#cd7f32", Argent: "#94a3b8", Or: "#f59e0b", Platine: "#a78bfa" };
  const niveauIcons: Record<string, string> = { Bronze: "🥉", Argent: "🥈", Or: "🥇", Platine: "💎" };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Hero card */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: 22, padding: 22, marginBottom: 16, border: "1px solid #334155" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 4px" }}>Bonjour 👋</p>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>{auth.boutiqueNom}</h2>
            <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>{auth.grossisteNom}</p>
          </div>
          {myFidelite && (
            <div style={{ background: "#f9731620", borderRadius: 12, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{niveauIcons[myFidelite.niveau] || "⭐"}</div>
              <div style={{ color: niveauColors[myFidelite.niveau] || "#f97316", fontSize: 11, fontWeight: 700 }}>{myFidelite.niveau}</div>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "En route", value: enCours.length, color: "#f59e0b", icon: "🚚" },
            { label: "Livrées", value: livrees.length, color: "#22c55e", icon: "✅" },
            { label: "CA Total", value: (caTotal / 1000).toFixed(0) + "K", color: "#a78bfa", icon: "💰" },
          ].map(k => (
            <div key={k.label} style={{ background: k.color + "15", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ color: k.color, fontSize: 20, fontWeight: 800 }}>{k.value}</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Livraison en route */}
      {enCours.length > 0 && (
        <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b40", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#f59e0b", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14 }}>Livraison en cours</span>
          </div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>🚚 Votre livreur est en route</div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Livraison #{enCours[0]?.tourneeId} • {fmt(enCours[0]?.montant || 0)}</div>
          <button onClick={() => setTab("suivi")} style={{ ...S.btn("#f59e0b"), marginTop: 12, padding: "10px 16px", fontSize: 13 }}>
            📍 Voir sur la carte
          </button>
        </div>
      )}

      {/* Commandes en cours */}
      {commandesEnCours.length > 0 && (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ ...S.row, marginBottom: 12 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>📋 Commandes en cours</span>
            <button onClick={() => setTab("commander")} style={{ color: "#f97316", background: "none", border: "none", fontSize: 13, cursor: "pointer" }}>Voir →</button>
          </div>
          {commandesEnCours.slice(0, 2).map((c: any) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #334155" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>Commande #{c.id}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{c.items?.length || 0} article(s)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f97316", fontWeight: 700 }}>{fmt(Number(c.montantTotal))}</div>
                <span style={S.badge(statusMap[c.statut]?.color || "#64748b")}>{statusMap[c.statut]?.icon} {statusMap[c.statut]?.label || c.statut}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score fidélité */}
      {myFidelite && (
        <div style={{ background: `linear-gradient(135deg, ${niveauColors[myFidelite.niveau] || "#f97316"}15, #1e293b)`, border: `1px solid ${niveauColors[myFidelite.niveau] || "#f97316"}40`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ ...S.row, marginBottom: 10 }}>
            <div>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 2px" }}>Programme Fidélité</p>
              <div style={{ color: niveauColors[myFidelite.niveau] || "#f97316", fontSize: 18, fontWeight: 700 }}>{niveauIcons[myFidelite.niveau]} {myFidelite.niveau}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{myFidelite.points}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>points</div>
            </div>
          </div>
          {myFidelite.pointsProchainNiveau > 0 && <>
            <div style={{ ...S.row, marginBottom: 6 }}>
              <span style={{ color: "#64748b", fontSize: 12 }}>Prochain niveau</span>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>{myFidelite.pointsProchainNiveau - myFidelite.points} pts</span>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 6, height: 8 }}>
              <div style={{ width: Math.min(100, (myFidelite.points / myFidelite.pointsProchainNiveau) * 100) + "%", height: "100%", background: niveauColors[myFidelite.niveau] || "#f97316", borderRadius: 6, transition: "width 1s" }} />
            </div>
          </>}
        </div>
      )}

      {/* Crédit */}
      {myCredit && (
        <div style={{ ...S.card }}>
          <div style={{ ...S.row }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px" }}>Score Crédit</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ color: "#fff", fontSize: 30, fontWeight: 800 }}>{myCredit.score}</span>
                <span style={{ color: "#475569", fontSize: 14 }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={S.badge(myCredit.risque === "faible" ? "#22c55e" : myCredit.risque === "modere" ? "#f59e0b" : "#ef4444")}>
                {myCredit.risque === "faible" ? "✓ Faible" : myCredit.risque === "modere" ? "⚠ Modéré" : "⛔ Élevé"}
              </span>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>Limite: {fmt(myCredit.limiteRecommandee)}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, background: "#0f172a", borderRadius: 6, height: 8 }}>
            <div style={{ width: myCredit.score + "%", height: "100%", background: myCredit.risque === "faible" ? "#22c55e" : myCredit.risque === "modere" ? "#f59e0b" : "#ef4444", borderRadius: 6 }} />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
        {[
          { icon: "🛒", label: "Passer une commande", tab: "commander", color: "#f97316" },
          { icon: "💰", label: "Mon Wallet", tab: "wallet", color: "#22c55e" },
          { icon: "📦", label: "Mes livraisons", tab: "livraisons", color: "#3b82f6" },
          { icon: "💬", label: "Chat", tab: "chat", color: "#a78bfa" },
        ].map(a => (
          <button key={a.tab} onClick={() => setTab(a.tab)}
            style={{ background: a.color + "15", border: "1px solid " + a.color + "30", borderRadius: 14, padding: "16px 12px", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CATALOGUE / COMMANDER ────────────────────────────────────────────────────

function Commander() {
  const { auth, authFetch } = useAuth();
  const { cart, add, remove, update, clear } = useCart();
  const qc = useQueryClient();
  const [view, setView] = useState<"catalogue" | "panier" | "confirmation">("catalogue");
  const [subTab, setSubTab] = useState<"catalogue" | "mes-commandes">("catalogue");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: produits, isLoading } = useQuery({
    queryKey: ["produits", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/produits`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });

  const createCommande = useMutation({
    mutationFn: (data: any) => authFetch(`${API}/grossistes/${auth.grossisteId}/commandes`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commandes-boutique"] });
      setSuccess(true); clear(); setView("catalogue");
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const filteredProduits = (produits || []).filter((p: any) =>
    p.nom.toLowerCase().includes(search.toLowerCase()) || p.categorie.toLowerCase().includes(search.toLowerCase())
  );
  const cartTotal = cart.reduce((s, i) => s + i.prix * i.quantite, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantite, 0);

  const categories = [...new Set((produits || []).map((p: any) => p.categorie))];
  const [activeCateg, setActiveCateg] = useState<string>("all");

  const displayProduits = filteredProduits.filter((p: any) => activeCateg === "all" || p.categorie === activeCateg);

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ color: "#22c55e", fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Commande envoyée !</h2>
      <p style={{ color: "#94a3b8" }}>Votre distributeur va traiter votre commande.</p>
    </div>
  );

  if (view === "panier") return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setView("catalogue")} style={{ ...S.btnOutline, width: "auto", padding: "8px 12px" }}>← Catalogue</button>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Mon Panier ({cartCount})</h2>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48 }}>🛒</div>
          <div style={{ color: "#64748b", marginTop: 12 }}>Votre panier est vide</div>
        </div>
      ) : <>
        {cart.map(item => (
          <div key={item.produitId} style={{ ...S.card }}>
            <div style={{ ...S.row, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{item.nom}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{fmt(item.prix)} / {item.unite}</div>
              </div>
              <button onClick={() => remove(item.produitId)} style={{ background: "#ef444420", border: "none", borderRadius: 8, width: 32, height: 32, color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => update(item.produitId, Math.max(1, item.quantite - 1))}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "#334155", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, minWidth: 32, textAlign: "center" }}>{item.quantite}</span>
                <button onClick={() => update(item.produitId, item.quantite + 1)}
                  style={{ width: 36, height: 36, borderRadius: 10, background: "#f97316", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
              </div>
              <div style={{ color: "#f97316", fontWeight: 800, fontSize: 17 }}>{fmt(item.prix * item.quantite)}</div>
            </div>
          </div>
        ))}

        <div style={{ ...S.card, background: "#0f172a" }}>
          <div style={{ ...S.row, marginBottom: 12 }}>
            <span style={{ color: "#94a3b8", fontSize: 15 }}>Total commande</span>
            <span style={{ color: "#f97316", fontSize: 22, fontWeight: 800 }}>{fmt(cartTotal)}</span>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes pour votre distributeur (optionnel)"
            style={{ ...S.input, height: 80, resize: "none", marginBottom: 12 }} />
          <button onClick={() => createCommande.mutate({ boutiqueId: auth.boutiqueId, items: cart.map(i => ({ produitId: i.produitId, quantite: i.quantite })), notes })}
            disabled={createCommande.isPending}
            style={S.btn()}>
            {createCommande.isPending ? "Envoi en cours..." : "✅ Confirmer la commande"}
          </button>
        </div>
      </>}
    </div>
  );

  if (subTab === "mes-commandes") return (
    <div style={{ padding: "0 0 16px" }}>
      <div style={{ display: "flex", gap: 6, padding: "0 16px 14px", borderBottom: "1px solid #1e293b" }}>
        <button onClick={() => setSubTab("catalogue")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "#1e293b", color: "#94a3b8", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>🛒 Catalogue</button>
        <button style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "#f97316", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>📋 Mes commandes</button>
      </div>
      <MesCommandes />
    </div>
  );

  return (
    <div style={{ padding: "0 0 16px" }}>
      <div style={{ padding: "0 16px", marginBottom: 12 }}>
        {/* Sub-tab switcher */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "#f97316", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>🛒 Catalogue</button>
          <button onClick={() => setSubTab("mes-commandes")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "#1e293b", color: "#94a3b8", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>📋 Mes commandes</button>
        </div>
        <div style={{ ...S.row, marginBottom: 14 }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>🛒 Catalogue</h2>
          {cart.length > 0 && (
            <button onClick={() => setView("panier")}
              style={{ background: "#f97316", border: "none", borderRadius: 20, padding: "8px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              🛒 {cartCount} — {fmt(cartTotal)}
            </button>
          )}
        </div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
            style={{ ...S.input, paddingLeft: 40 }} />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>🔍</span>
        </div>
        <PromoBanner onApply={(code) => { alert(`Code "${code}" copié ! Il sera appliqué à votre prochaine commande.`); }} />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setActiveCateg("all")} style={{ background: activeCateg === "all" ? "#f97316" : "#1e293b", border: "none", borderRadius: 20, padding: "6px 14px", color: activeCateg === "all" ? "#fff" : "#94a3b8", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 600 }}>Tout</button>
          {categories.map((c: any) => (
            <button key={c} onClick={() => setActiveCateg(c)} style={{ background: activeCateg === c ? "#f97316" : "#1e293b", border: "none", borderRadius: 20, padding: "6px 14px", color: activeCateg === c ? "#fff" : "#94a3b8", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 600 }}>{c}</button>
          ))}
        </div>
      </div>

      {isLoading ? <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Chargement du catalogue...</div> :
        displayProduits.length === 0 ? <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Aucun produit trouvé</div> :
          <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {displayProduits.map((p: any) => {
              const inCart = cart.find(c => c.produitId === p.id);
              return (
                <div key={p.id} style={{ background: "#1e293b", borderRadius: 16, padding: 14, border: inCart ? "1px solid #f97316" : "1px solid #334155" }}>
                  <div style={{ background: "#0f172a", borderRadius: 10, height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 10 }}>
                    {p.categorie === "Boissons" ? "🥤" : p.categorie === "Alimentaire" ? "🥫" : p.categorie === "Hygiène" ? "🧴" : "📦"}
                  </div>
                  <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{p.nom}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>{p.categorie} • {p.unite}</div>
                  {p.stockDisponible < 10 && p.stockDisponible > 0 && <div style={{ color: "#f59e0b", fontSize: 10, marginBottom: 6 }}>⚠ Plus que {p.stockDisponible}</div>}
                  {p.stockDisponible === 0 && <div style={{ color: "#ef4444", fontSize: 10, marginBottom: 6 }}>Rupture de stock</div>}
                  <div style={{ color: "#f97316", fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{fmt(Number(p.prixUnitaire))}</div>
                  {inCart ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <button onClick={() => inCart.quantite <= 1 ? remove(p.id) : update(p.id, inCart.quantite - 1)}
                        style={{ width: 30, height: 30, borderRadius: 8, background: "#334155", border: "none", color: "#fff", cursor: "pointer" }}>−</button>
                      <span style={{ color: "#fff", fontWeight: 700 }}>{inCart.quantite}</span>
                      <button onClick={() => update(p.id, inCart.quantite + 1)}
                        style={{ width: 30, height: 30, borderRadius: 8, background: "#f97316", border: "none", color: "#fff", cursor: "pointer" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => p.stockDisponible > 0 && add({ produitId: p.id, nom: p.nom, unite: p.unite, prix: Number(p.prixUnitaire), quantite: 1 })}
                      disabled={p.stockDisponible === 0}
                      style={{ width: "100%", background: p.stockDisponible === 0 ? "#334155" : "#f97316", border: "none", borderRadius: 10, padding: "8px", color: p.stockDisponible === 0 ? "#64748b" : "#fff", fontWeight: 700, cursor: p.stockDisponible === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>
                      + Ajouter
                    </button>
                  )}
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ─── MES COMMANDES (BONS DE COMMANDE) ────────────────────────────────────────

function MesCommandes() {
  const { auth, authFetch } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [showCertForm, setShowCertForm] = useState(false);
  const [conformite, setConformite] = useState(true);
  const [remarques, setRemarques] = useState("");
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [certDone, setCertDone] = useState<Record<number, boolean>>({});
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  const { data: commandes, isLoading, refetch } = useQuery({
    queryKey: ["mes-commandes", auth.boutiqueId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/boutiques/${auth.boutiqueId}/commandes`).then(r => r.json()),
    enabled: !!auth.boutiqueId,
    refetchInterval: 30000,
  });

  const { data: livraisonsData } = useQuery({
    queryKey: ["boutique-livraisons", auth.grossisteId, auth.boutiqueId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/boutiques/${auth.boutiqueId}/livraisons`).then(r => r.json()),
    enabled: !!auth.boutiqueId && selected?.statut === "livree",
  });

  // Trouver la livraison à certifier: statut livree, pas encore certifiée
  const livraisonACertifier = (livraisonsData || []).find((l: any) => l.statut === "livree" && !l.certifiee && !certDone[l.id]);

  useEffect(() => {
    if (!showCertForm) return;
    const timer = setTimeout(() => {
      const canvas = document.getElementById("cert-sig-canvas") as HTMLCanvasElement;
      if (canvas && !sigPadRef.current) {
        sigCanvasRef.current = canvas;
        sigPadRef.current = new SignaturePad(canvas, { penColor: "#f97316", backgroundColor: "rgba(0,0,0,0)" });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [showCertForm]);

  const clearSig = () => { sigPadRef.current?.clear(); };

  const handleCertifier = async () => {
    if (!livraisonACertifier) return;
    const sigData = sigPadRef.current?.isEmpty() ? null : sigPadRef.current?.toDataURL("image/png");
    if (!sigData) { alert("Veuillez signer pour certifier la réception."); return; }
    setCertSubmitting(true);
    try {
      const res = await authFetch(`${API}/grossistes/${auth.grossisteId}/livraisons/${livraisonACertifier.id}/reception`, {
        method: "PATCH",
        body: JSON.stringify({ signatureReception: sigData, conformite: conformite ? "conforme" : "avec_reserves", remarquesReception: remarques }),
      });
      if (res.ok) {
        setCertDone(prev => ({ ...prev, [livraisonACertifier.id]: true }));
        setShowCertForm(false);
        setRemarques("");
        setConformite(true);
        sigPadRef.current = null;
        qc.invalidateQueries({ queryKey: ["mes-commandes"] });
        qc.invalidateQueries({ queryKey: ["boutique-livraisons"] });
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur: " + (err.error || "Certification échouée"));
      }
    } catch (e) { alert("Erreur réseau: " + String(e)); }
    finally { setCertSubmitting(false); }
  };

  const exportBC = (c: any) => {
    const lines = [
      `BON DE COMMANDE — ${`BC-${String(c.id).padStart(5, "0")}`}`,
      `Date : ${new Date(c.createdAt).toLocaleDateString("fr-FR")}`,
      `Boutique : ${auth.boutiqueNom}`,
      `Distributeur : ${auth.grossisteNom}`,
      ``,
      `ARTICLES`,
      ...(c.items || []).map((it: any) => `  ${it.produit?.nom || "Produit"} — ${it.quantite} × ${fmt(Number(it.prixUnitaire))} = ${fmt(it.quantite * Number(it.prixUnitaire))}`),
      ``,
      `TOTAL : ${fmt(Number(c.montantTotal))}`,
      `Statut : ${statusMap[c.statut]?.label || c.statut}`,
      c.notes ? `Notes : ${c.notes}` : "",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BC-${String(c.id).padStart(5, "0")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const list = commandes || [];

  if (selected) {
    const bc = selected;
    const statCfg = statusMap[bc.statut] || { color: "#64748b", label: bc.statut, icon: "•" };
    const subtotal = (bc.items || []).reduce((s: number, it: any) => s + it.quantite * Number(it.prixUnitaire), 0);

    return (
      <div style={{ padding: "0 16px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setSelected(null)} style={{ background: "#1e293b", border: "none", borderRadius: 10, padding: "8px 14px", color: "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>← Retour</button>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>Bon de Commande</h2>
        </div>

        {/* BC Header card */}
        <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid #334155" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ background: "#f9731620", borderRadius: 10, padding: "6px 12px", display: "inline-block", marginBottom: 8 }}>
                <span style={{ color: "#f97316", fontWeight: 800, fontFamily: "monospace", fontSize: 15, letterSpacing: 1 }}>BC-{String(bc.id).padStart(5, "0")}</span>
              </div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{auth.boutiqueNom}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>via {auth.grossisteNom}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={S.badge(statCfg.color)}>{statCfg.icon} {statCfg.label}</span>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>{new Date(bc.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #334155", paddingTop: 14 }}>
            <div style={{ ...S.row }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Montant total</span>
              <span style={{ color: "#f97316", fontSize: 24, fontWeight: 800 }}>{fmt(Number(bc.montantTotal))}</span>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div style={{ ...S.card }}>
          <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Détail des Articles</div>
          {(bc.items || []).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "16px 0" }}>Aucun article</p>
          ) : (bc.items || []).map((it: any, i: number, arr: any[]) => (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #0f172a" : "none" }}>
              <div style={{ flex: 1, marginRight: 8 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{it.produit?.nom || `Produit #${it.produitId}`}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  {it.quantite} {it.produit?.unite || "unité(s)"} × {fmt(Number(it.prixUnitaire))}
                </div>
              </div>
              <div style={{ color: "#f97316", fontWeight: 700, fontSize: 15 }}>{fmt(it.quantite * Number(it.prixUnitaire))}</div>
            </div>
          ))}
          <div style={{ borderTop: "2px solid #334155", marginTop: 4, paddingTop: 14 }}>
            <div style={{ ...S.row }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Sous-total</span>
              <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{fmt(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {bc.notes && (
          <div style={{ ...S.card, background: "#f9731610", border: "1px solid #f9731630" }}>
            <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Notes</p>
            <p style={{ color: "#e2e8f0", fontSize: 14, margin: 0 }}>{bc.notes}</p>
          </div>
        )}

        {/* Workflow */}
        <div style={{ ...S.card }}>
          <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Suivi de la commande</p>
          {["en_attente", "confirmee", "en_preparation", "livree"].map((s, i) => {
            const cfg = statusMap[s] || { color: "#64748b", label: s, icon: "•" };
            const isActive = bc.statut === s;
            const isDone = ["en_attente", "confirmee", "en_preparation", "livree"].indexOf(bc.statut) > i;
            const isAnnulee = bc.statut === "annulee";
            return (
              <div key={s} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i < 3 ? 12 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: isAnnulee ? "#ef444420" : (isActive || isDone) ? cfg.color + "25" : "#0f172a", border: `2px solid ${isAnnulee ? "#ef4444" : (isActive || isDone) ? cfg.color : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    {isAnnulee ? "✕" : isDone ? "✓" : isActive ? cfg.icon : "○"}
                  </div>
                  {i < 3 && <div style={{ width: 2, height: 20, background: isDone ? "#22c55e40" : "#1e293b", marginTop: 2 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ color: (isActive || isDone) && !isAnnulee ? "#e2e8f0" : "#475569", fontWeight: isActive ? 700 : 400, fontSize: 14 }}>
                    {cfg.label}
                  </div>
                  {isActive && <div style={{ color: "#64748b", fontSize: 11 }}>Statut actuel</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── CERTIFICATION RÉCEPTION ─── */}
        {bc.statut === "livree" && (
          <div style={{ ...S.card, border: livraisonACertifier ? "1px solid #22c55e40" : "1px solid #334155", background: certDone[livraisonACertifier?.id] ? "#22c55e10" : "#1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{certDone[livraisonACertifier?.id] ? "✅" : "🏪"}</span>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>Certification de réception</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>
                    {certDone[livraisonACertifier?.id] ? "Réception certifiée" : livraisonACertifier ? `BL-${String(livraisonACertifier.id).padStart(5, "0")} trouvé` : "Aucune livraison à certifier"}
                  </div>
                </div>
              </div>
              {livraisonACertifier && !certDone[livraisonACertifier.id] && (
                <button onClick={() => setShowCertForm(!showCertForm)} style={{ background: showCertForm ? "#334155" : "#22c55e20", border: "1px solid " + (showCertForm ? "#475569" : "#22c55e50"), borderRadius: 10, padding: "6px 14px", color: showCertForm ? "#94a3b8" : "#22c55e", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  {showCertForm ? "Annuler" : "Certifier ✍️"}
                </button>
              )}
            </div>

            {showCertForm && livraisonACertifier && (
              <div style={{ borderTop: "1px solid #334155", paddingTop: 16 }}>
                {/* Conformité toggle */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Conformité de la livraison</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setConformite(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${conformite ? "#22c55e" : "#334155"}`, background: conformite ? "#22c55e15" : "transparent", color: conformite ? "#22c55e" : "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      ✓ Conforme
                    </button>
                    <button onClick={() => setConformite(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${!conformite ? "#f97316" : "#334155"}`, background: !conformite ? "#f9731615" : "transparent", color: !conformite ? "#f97316" : "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      ⚠ Avec réserves
                    </button>
                  </div>
                </div>

                {/* Remarques */}
                {!conformite && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Remarques / Réserves</div>
                    <textarea
                      value={remarques}
                      onChange={e => setRemarques(e.target.value)}
                      placeholder="Décrivez les problèmes constatés..."
                      rows={3}
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0", fontSize: 14, padding: "10px 12px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>
                )}

                {/* Signature pad */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Signature du responsable</div>
                  <div style={{ background: "#0f172a", borderRadius: 12, border: "1px solid #334155", overflow: "hidden", position: "relative" }}>
                    <canvas
                      id="cert-sig-canvas"
                      width={400}
                      height={130}
                      style={{ width: "100%", height: 130, cursor: "crosshair", touchAction: "none" }}
                    />
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <button onClick={clearSig} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "4px 10px", color: "#64748b", cursor: "pointer", fontSize: 12 }}>Effacer</button>
                    </div>
                    <div style={{ position: "absolute", bottom: 8, left: 12, color: "#334155", fontSize: 12, pointerEvents: "none" }}>Signez ici</div>
                  </div>
                </div>

                {/* Submit */}
                <button onClick={handleCertifier} disabled={certSubmitting} style={{ ...S.btn("#22c55e"), width: "100%", textAlign: "center", opacity: certSubmitting ? 0.7 : 1 }}>
                  {certSubmitting ? "Certification en cours..." : "✅ Certifier la réception"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <button onClick={() => exportBC(bc)} style={{ ...S.btnOutline, width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          📄 Télécharger le bon de commande
        </button>
        <button onClick={() => setSelected(null)} style={S.btn()}>← Retour à mes commandes</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ ...S.row, marginBottom: 16 }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>📋 Mes Commandes</h2>
        <button onClick={() => refetch()} style={{ background: "none", border: "1px solid #334155", borderRadius: 10, padding: "6px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>↻ Actualiser</button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Chargement...</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>Aucune commande passée</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Vos bons de commande apparaîtront ici.</div>
        </div>
      ) : list.map((c: any) => {
        const statCfg = statusMap[c.statut] || { color: "#64748b", label: c.statut, icon: "•" };
        return (
          <button key={c.id} onClick={() => setSelected(c)}
            style={{ ...S.card, width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid #334155", background: "#1e293b" }}>
            <div style={{ ...S.row, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#f9731615", color: "#f97316", borderRadius: 8, padding: "4px 8px", fontFamily: "monospace", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>
                  BC-{String(c.id).padStart(5, "0")}
                </span>
              </div>
              <span style={S.badge(statCfg.color)}>{statCfg.icon} {statCfg.label}</span>
            </div>
            <div style={{ ...S.row }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700 }}>{fmt(Number(c.montantTotal))}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
                  {(c.items || []).length} article(s) · {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <span style={{ color: "#64748b", fontSize: 20 }}>›</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── SUIVI LIVRAISON (MAP) ────────────────────────────────────────────────────

function SuiviLivraison() {
  const { auth } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);

  const { data: livraisons } = useQuery({
    queryKey: ["livraisons", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!auth.grossisteId, refetchInterval: 15000,
  });
  const { data: geo } = useQuery({
    queryKey: ["geo", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/geo`).then(r => r.json()),
    enabled: !!auth.grossisteId, refetchInterval: 10000,
  });

  const myLivraisons = (livraisons || []).filter((l: any) => l.boutiqueId === auth.boutiqueId);
  const enCours = myLivraisons.find((l: any) => l.statut === "en_attente");

  // Dakar coordinates as default center (with slight random offsets for demo)
  const dakarCoords = [14.6928, -17.4467];
  const mockLivreurPos = [14.6928 + (Math.random() - 0.5) * 0.05, -17.4467 + (Math.random() - 0.5) * 0.05];
  const mockBoutiquePos = [14.6928 + (Math.random() - 0.5) * 0.03, -17.4467 + (Math.random() - 0.5) * 0.03];

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    import("leaflet").then(L => {
      import("leaflet/dist/leaflet.css");
      const map = L.map(mapRef.current!).setView(dakarCoords as [number, number], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      // Livreur marker
      const livreurIcon = L.divIcon({
        className: "", html: `<div style="background:#f97316;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid #fff;box-shadow:0 4px 12px #f9731660;">🚚</div>`,
        iconSize: [44, 44], iconAnchor: [22, 22],
      });
      const boutiqueIcon = L.divIcon({
        className: "", html: `<div style="background:#3b82f6;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid #fff;box-shadow:0 4px 12px #3b82f660;">🏪</div>`,
        iconSize: [40, 40], iconAnchor: [20, 20],
      });

      // Use real geo data if available, otherwise demo positions
      const geoData = (geo || []);
      const livreurCoords: [number, number] = geoData.length > 0
        ? [parseFloat(geoData[0].lat), parseFloat(geoData[0].lng)]
        : mockLivreurPos as [number, number];

      L.marker(livreurCoords, { icon: livreurIcon }).addTo(map)
        .bindPopup(`<b>Votre livreur</b><br/>${geoData[0]?.prenom || "Chauffeur"} ${geoData[0]?.nom || ""}`);
      L.marker(mockBoutiquePos as [number, number], { icon: boutiqueIcon }).addTo(map)
        .bindPopup(`<b>Votre boutique</b><br/>${auth.boutiqueNom}`).openPopup();

      // Draw route line
      const line = L.polyline([livreurCoords, mockBoutiquePos as [number, number]], { color: "#f97316", weight: 3, dashArray: "8,6", opacity: 0.8 }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [40, 40] });

      leafletRef.current = map;
    }).catch(() => {});
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, []);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h2 style={S.h2}>📍 Suivi de livraison</h2>

      {!enCours ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛵</div>
          <div style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>Aucune livraison en cours</div>
          <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>La carte s'activera lorsque votre livreur sera en route.</div>
        </div>
      ) : (
        <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b40", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 4 }}>🚚 Livreur en route</div>
          <div style={{ color: "#e2e8f0", fontSize: 14 }}>Montant : {fmt(enCours.montant || 0)}</div>
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} style={{ width: "100%", height: 320, borderRadius: 16, overflow: "hidden", border: "1px solid #334155", marginBottom: 16 }} />

      {/* Status steps */}
      <div style={S.card}>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Étapes de livraison</div>
        {[
          { label: "Commande confirmée", done: true, icon: "✅" },
          { label: "En préparation", done: true, icon: "📦" },
          { label: "Livreur en route", done: !!enCours, icon: "🚚" },
          { label: "Livré", done: myLivraisons.some((l: any) => l.statut === "livree"), icon: "🏪" },
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #1e293b" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: step.done ? "#22c55e20" : "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {step.done ? step.icon : "○"}
            </div>
            <span style={{ color: step.done ? "#e2e8f0" : "#475569", fontSize: 14, fontWeight: step.done ? 600 : 400 }}>{step.label}</span>
            {step.done && <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 12 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WALLET ────────────────────────────────────────────────────────────────────

function Wallet() {
  const { auth, authFetch } = useAuth();
  const [methode, setMethode] = useState("especes");
  const [montant, setMontant] = useState("");
  const [desc, setDesc] = useState("");
  const qc = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet", auth.boutiqueId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/wallet/boutique/${auth.boutiqueId}`).then(r => r.json()),
    enabled: !!auth.boutiqueId, refetchInterval: 30000,
  });

  const addTx = useMutation({
    mutationFn: (data: any) => authFetch(`${API}/grossistes/${auth.grossisteId}/wallet/boutique/${auth.boutiqueId}`, {
      method: "POST", body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wallet"] }); setMontant(""); setDesc(""); },
  });

  const solde = wallet?.solde ?? 0;
  const transactions = wallet?.transactions ?? [];
  const methodes = [
    { id: "especes", label: "💵 Espèces" },
    { id: "mobile_money", label: "📱 Wave / Orange Money" },
    { id: "credit", label: "💳 Crédit" },
  ];

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Solde card */}
      <div style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: 24, padding: 28, marginBottom: 20, textAlign: "center", boxShadow: "0 8px 32px #22c55e30" }}>
        <p style={{ color: "#dcfce7", fontSize: 14, margin: "0 0 8px" }}>Solde Wallet</p>
        <div style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>{fmt(solde)}</div>
        <p style={{ color: "#bbf7d0", fontSize: 13, marginTop: 8 }}>{auth.boutiqueNom}</p>
      </div>

      {/* Méthodes de paiement */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Mode de paiement</p>
        <div style={{ display: "flex", gap: 8 }}>
          {methodes.map(m => (
            <button key={m.id} onClick={() => setMethode(m.id)}
              style={{ flex: 1, background: methode === m.id ? "#22c55e" : "#1e293b", border: "none", borderRadius: 12, padding: "10px 8px", color: methode === m.id ? "#fff" : "#94a3b8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enregistrer un paiement */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Enregistrer un paiement</p>
        <input value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant (FCFA)" type="number"
          style={{ ...S.input, marginBottom: 10 }} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optionnel)"
          style={{ ...S.input, marginBottom: 14 }} />
        <button onClick={() => addTx.mutate({ type: "credit", montant: Number(montant), description: desc || "Paiement", methodePaiement: methode })}
          disabled={!montant || addTx.isPending}
          style={S.btn("#22c55e")}>
          {addTx.isPending ? "Enregistrement..." : "✅ Enregistrer le paiement"}
        </button>
      </div>

      {/* Historique */}
      <div>
        <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Historique des transactions</p>
        {isLoading ? <div style={{ textAlign: "center", color: "#64748b", padding: 24 }}>Chargement...</div> :
          transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 36 }}>💳</div>
              <div style={{ color: "#64748b", marginTop: 8 }}>Aucune transaction</div>
            </div>
          ) : transactions.map((tx: any) => (
            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: tx.type === "credit" ? "#22c55e20" : "#ef444420", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {tx.type === "credit" ? "⬆️" : "⬇️"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{tx.description}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{new Date(tx.createdAt).toLocaleDateString("fr-FR")} • {tx.methodePaiement}</div>
              </div>
              <div style={{ color: tx.type === "credit" ? "#22c55e" : "#ef4444", fontWeight: 800, fontSize: 15 }}>
                {tx.type === "credit" ? "+" : "−"}{fmt(Number(tx.montant))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

function Chat() {
  const { auth } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/messages`).then(r => r.json()),
    enabled: !!auth.grossisteId, refetchInterval: 5000,
  });

  const sendMsg = useMutation({
    mutationFn: (data: any) => fetch(`${API}/grossistes/${auth.grossisteId}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); setMsg(""); },
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const myMessages = (messages || []).filter((m: any) =>
    (m.expediteurType === "boutique" && m.expediteurId === auth.boutiqueId) ||
    (m.destinataireType === "boutique" && m.destinataireId === auth.boutiqueId)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <div style={{ padding: "0 16px 12px" }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>💬 Chat avec le distributeur</h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{auth.grossisteNom}</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {myMessages.length === 0 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ color: "#64748b", marginTop: 12 }}>Démarrez la conversation</div>
          </div>
        )}
        {myMessages.map((m: any) => {
          const isMine = m.expediteurType === "boutique";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{ maxWidth: "75%", background: isMine ? "#f97316" : "#1e293b", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px" }}>
                <div style={{ color: "#fff", fontSize: 14 }}>{m.contenu}</div>
                <div style={{ color: isMine ? "#fed7aa" : "#64748b", fontSize: 10, marginTop: 4, textAlign: "right" }}>
                  {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 16px", background: "#0f172a", borderTop: "1px solid #1e293b" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && msg.trim()) { sendMsg.mutate({ expediteurType: "boutique", expediteurId: auth.boutiqueId, destinataireType: "grossiste", destinataireId: auth.grossisteId, contenu: msg }); } }}
            placeholder="Votre message..."
            style={{ ...S.input, flex: 1 }} />
          <button onClick={() => msg.trim() && sendMsg.mutate({ expediteurType: "boutique", expediteurId: auth.boutiqueId, destinataireType: "grossiste", destinataireId: auth.grossisteId, contenu: msg })}
            disabled={!msg.trim() || sendMsg.isPending}
            style={{ background: "#f97316", border: "none", borderRadius: 12, width: 48, height: 48, cursor: "pointer", fontSize: 20 }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ─── LIVRAISONS ────────────────────────────────────────────────────────────────

function Livraisons() {
  const { auth } = useAuth();
  const [filter, setFilter] = useState("all");
  const { data: livraisons, isLoading } = useQuery({
    queryKey: ["livraisons", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });

  const myLivraisons = (livraisons || []).filter((l: any) => l.boutiqueId === auth.boutiqueId);
  const filtered = filter === "all" ? myLivraisons : myLivraisons.filter((l: any) => l.statut === filter);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <h2 style={S.h2}>📦 Mes Livraisons</h2>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 4 }}>
        {["all", "en_attente", "livree", "echec", "litige"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ background: filter === s ? "#f97316" : "#1e293b", border: "none", borderRadius: 20, padding: "6px 14px", color: filter === s ? "#fff" : "#94a3b8", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 600 }}>
            {s === "all" ? "Toutes" : statusMap[s]?.label || s} ({s === "all" ? myLivraisons.length : myLivraisons.filter((l: any) => l.statut === s).length})
          </button>
        ))}
      </div>
      {isLoading && <div style={{ color: "#64748b", textAlign: "center", padding: 32 }}>Chargement...</div>}
      {filtered.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48 }}>📦</div>
          <div style={{ color: "#64748b", marginTop: 12 }}>Aucune livraison</div>
        </div>
      )}
      {filtered.map((l: any) => {
        const s = statusMap[l.statut] || { color: "#64748b", label: l.statut, icon: "?" };
        return (
          <div key={l.id} style={{ ...S.card }}>
            <div style={{ ...S.row, marginBottom: 10 }}>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>Tournée #{l.tourneeId}</div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{l.chauffeurNom || "—"}</div>
              </div>
              <span style={S.badge(s.color)}>{s.icon} {s.label}</span>
            </div>
            <div style={{ ...S.row }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                {new Date(l.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={{ color: "#f97316", fontWeight: 800, fontSize: 17 }}>{fmt(Number(l.montant) || 0)}</div>
            </div>
            {l.methodePaiement && (
              <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
                💳 {l.methodePaiement === "especes" ? "Espèces" : l.methodePaiement === "mobile_money" ? "Mobile Money" : "Crédit"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── FIDÉLITÉ ──────────────────────────────────────────────────────────────────

function Fidelite() {
  const { auth } = useAuth();
  const { data: fidelite } = useQuery({
    queryKey: ["fidelite", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/innovations/fidelite`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const myFidelite = (fidelite || []).find((f: any) => f.boutiqueId === auth.boutiqueId);
  const niveaux = [
    { nom: "Bronze", pts: 0, color: "#cd7f32", icon: "🥉", avantages: ["Livraison prioritaire J+1", "Support client dédié"] },
    { nom: "Argent", pts: 200, color: "#94a3b8", icon: "🥈", avantages: ["Livraison prioritaire J+1", "Remise 2%", "Support client dédié"] },
    { nom: "Or", pts: 500, color: "#f59e0b", icon: "🥇", avantages: ["Livraison express", "Remise 5%", "Compte dédié", "Crédit étendu"] },
    { nom: "Platine", pts: 1000, color: "#a78bfa", icon: "💎", avantages: ["Livraison express", "Remise 10%", "Gestionnaire dédié", "Crédit VIP", "Accès préférentiel"] },
  ];

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {myFidelite && (
        <div style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 24, padding: 28, marginBottom: 20, textAlign: "center", boxShadow: "0 8px 32px #f9731640" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{niveaux.find(n => n.nom === myFidelite.niveau)?.icon || "⭐"}</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 800 }}>{myFidelite.points} pts</div>
          <div style={{ color: "#fed7aa", fontSize: 16, fontWeight: 600, marginTop: 4 }}>Niveau {myFidelite.niveau}</div>
          {myFidelite.pointsProchainNiveau > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ ...S.row, marginBottom: 6 }}>
                <span style={{ color: "#fed7aa", fontSize: 13 }}>Progression</span>
                <span style={{ color: "#fff", fontSize: 13 }}>{myFidelite.pointsProchainNiveau - myFidelite.points} pts restants</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 8, height: 10, overflow: "hidden" }}>
                <div style={{ width: Math.min(100, (myFidelite.points / myFidelite.pointsProchainNiveau) * 100) + "%", height: "100%", background: "#fff", borderRadius: 8 }} />
              </div>
            </div>
          )}
        </div>
      )}

      {niveaux.map(n => (
        <div key={n.nom} style={{ ...S.card, border: myFidelite?.niveau === n.nom ? `1px solid ${n.color}` : "1px solid transparent" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 28 }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: n.color, fontWeight: 700, fontSize: 16 }}>{n.nom}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>À partir de {n.pts} points</div>
            </div>
            {myFidelite?.niveau === n.nom && <span style={S.badge(n.color)}>● Actuel</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {n.avantages.map(a => <span key={a} style={{ background: n.color + "20", color: n.color, fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>✓ {a}</span>)}
          </div>
        </div>
      ))}

      <div style={{ ...S.card, marginTop: 8 }}>
        <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Comment gagner des points</p>
        {[
          { icon: "📦", label: "Par livraison réussie", pts: "+10 pts" },
          { icon: "💰", label: "Par 10 000 FCFA achetés", pts: "+1 pt" },
          { icon: "📱", label: "Paiement Mobile Money", pts: "+5 pts bonus" },
          { icon: "⭐", label: "0 litige sur 30 jours", pts: "+50 pts" },
          { icon: "🛒", label: "Commande en ligne", pts: "+3 pts" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0f172a" }}>
            <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{r.icon}</span>
            <span style={{ flex: 1, color: "#e2e8f0", fontSize: 14 }}>{r.label}</span>
            <span style={{ color: "#f97316", fontWeight: 700, fontSize: 13 }}>{r.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFIL ────────────────────────────────────────────────────────────────────

function Profil() {
  const { auth, setAuth } = useAuth();
  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", auth.grossisteId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!auth.grossisteId,
  });
  const boutique = (boutiques || []).find((b: any) => b.id === auth.boutiqueId);
  const creditPct = boutique ? Math.round((Number(boutique.soldeCredit) / Math.max(1, Number(boutique.limiteCredit))) * 100) : 0;

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: 22, padding: 28, marginBottom: 16, textAlign: "center", border: "1px solid #334155" }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36, boxShadow: "0 4px 20px #f9731640" }}>🏪</div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{auth.boutiqueNom}</h2>
        <p style={{ color: "#64748b", margin: 0 }}>{boutique?.adresse || "—"}</p>
      </div>

      {boutique && (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Informations</p>
          {[
            { label: "Distributeur", value: auth.grossisteNom, icon: "🏭" },
            { label: "Propriétaire", value: boutique.proprietaire, icon: "👤" },
            { label: "Téléphone", value: boutique.telephone, icon: "📞" },
            { label: "Statut", value: boutique.statut === "actif" ? "✅ Actif" : "⏸ Suspendu", icon: "📊" },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #0f172a" : "none" }}>
              <span style={{ color: "#64748b", fontSize: 14 }}>{item.icon} {item.label}</span>
              <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {boutique && (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ ...S.row, marginBottom: 12 }}>
            <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Limite de Crédit</p>
            <span style={{ color: creditPct >= 80 ? "#ef4444" : "#22c55e", fontWeight: 700, fontSize: 14 }}>{creditPct}% utilisé</span>
          </div>
          <div style={{ ...S.row, marginBottom: 10 }}>
            <span style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 800 }}>{fmt(Number(boutique.soldeCredit))}</span>
            <span style={{ color: "#64748b", fontSize: 13 }}>/ {fmt(Number(boutique.limiteCredit))}</span>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, height: 10, overflow: "hidden" }}>
            <div style={{ width: creditPct + "%", height: "100%", background: creditPct >= 80 ? "#ef4444" : creditPct >= 60 ? "#f59e0b" : "#22c55e", borderRadius: 8, transition: "width 1s" }} />
          </div>
          {creditPct >= 80 && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>⚠ Limite de crédit presque atteinte. Effectuez un paiement.</p>}
        </div>
      )}

      <button onClick={() => { localStorage.removeItem("boutiquier_auth"); setAuth({ grossisteId: null, boutiqueId: null, boutiqueNom: "", grossisteNom: "" }); }}
        style={{ width: "100%", background: "#ef444420", border: "1px solid #ef444440", borderRadius: 14, padding: 16, color: "#ef4444", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        🚪 Se déconnecter
      </button>
    </div>
  );
}

// ─── DOCUMENTS BOUTIQUIER ─────────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  facture: { icon: "🧾", label: "Facture", color: "#f97316" },
  devis: { icon: "📋", label: "Devis", color: "#3b82f6" },
  bon_commande: { icon: "🛒", label: "Bon de Commande", color: "#8b5cf6" },
  bon_livraison: { icon: "📦", label: "Bon de Livraison", color: "#22c55e" },
  contrat: { icon: "📜", label: "Contrat", color: "#f59e0b" },
  autre: { icon: "📄", label: "Autre", color: "#64748b" },
};

function DocumentsBoutiquier() {
  const { auth } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: docs = [], isLoading, refetch } = useQuery({
    queryKey: ["boutique-documents", auth.grossisteId, auth.boutiqueId],
    queryFn: () => fetch(`${API}/grossistes/${auth.grossisteId}/documents?boutiqueId=${auth.boutiqueId}`).then(r => r.json()),
    enabled: !!auth.grossisteId && !!auth.boutiqueId,
    refetchInterval: 60000,
  });

  const filtered = docs.filter((d: any) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (search && !d.nom.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const downloadDoc = (doc: any) => {
    const a = document.createElement("a");
    a.href = `${API}/grossistes/${auth.grossisteId}/documents/${doc.id}/download`;
    a.download = doc.nom;
    a.click();
  };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>📂 Mes Documents</h2>
        <button onClick={() => refetch()} style={{ background: "none", border: "1px solid #334155", borderRadius: 10, padding: "6px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>↻ Actualiser</button>
      </div>

      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16, marginTop: -8 }}>
        Factures, devis et documents partagés par votre distributeur
      </p>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher..."
          style={{ flex: 1, minWidth: 140, background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 14 }}
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "10px 14px", color: "#e2e8f0", fontSize: 13 }}>
          <option value="all">Tous types</option>
          {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <div style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Aucun document</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Votre distributeur n'a pas encore partagé de documents.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((doc: any) => {
            const t = DOC_TYPE_LABELS[doc.type] || DOC_TYPE_LABELS.autre;
            return (
              <div key={doc.id} style={{ ...S.card, background: "#1e293b", border: "1px solid #334155" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>{t.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.nom}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ background: t.color + "20", color: t.color, borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{t.label}</span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                    {doc.description && <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{doc.description}</div>}
                  </div>
                </div>
                <button onClick={() => downloadDoc(doc)} style={{ ...S.btn("#f97316"), padding: "10px 16px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  ⬇️ Télécharger
                </button>
              </div>
            );
          })}
          <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 4 }}>{filtered.length} document(s)</div>
        </div>
      )}
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

interface Notif { id: number; titre: string; message: string; type: string; lu: boolean; createdAt: string; }

const NOTIF_ICONS: Record<string, string> = {
  livraison: "📦", paiement: "💰", promotion: "🎁", alerte: "⚠️", info: "ℹ️", commande: "🛒"
};

function Notifications() {
  const { auth } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([
    { id: 1, titre: "Nouvelle livraison prévue", message: "Votre commande #BC-2024-0042 est en cours de préparation.", type: "livraison", lu: false, createdAt: new Date(Date.now() - 20 * 60000).toISOString() },
    { id: 2, titre: "Promotion spéciale !", message: "Utilisez le code PROMO10 pour 10% de réduction sur votre prochaine commande.", type: "promotion", lu: false, createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: 3, titre: "Paiement confirmé", message: "Votre règlement de 45 000 FCFA a bien été enregistré.", type: "paiement", lu: true, createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
    { id: 4, titre: "Livreur en route", message: "Ibrahima Sow est en chemin vers votre boutique. Temps estimé : 25 min.", type: "livraison", lu: true, createdAt: new Date(Date.now() - 180 * 60000).toISOString() },
    { id: 5, titre: "Rappel de solde", message: "Votre solde crédit est de 12 000 FCFA. Réglez avant le 30 pour maintenir votre limite.", type: "alerte", lu: false, createdAt: new Date(Date.now() - 240 * 60000).toISOString() },
  ]);

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, lu: true })));
  const markOne = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, lu: true } : x));
  const unread = notifs.filter(n => !n.lu).length;

  function ago(d: string) {
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return "À l'instant";
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
    if (s < 86400) return `il y a ${Math.floor(s / 3600)}h`;
    return new Date(d).toLocaleDateString("fr-FR");
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>🔔 Notifications</h2>
          {unread > 0 && <p style={{ color: "#f97316", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{unread} non lue(s)</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "8px 14px", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Tout marquer lu
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifs.map(n => (
          <div key={n.id} onClick={() => markOne(n.id)} style={{ background: n.lu ? "#1e293b" : "#1e293b", border: n.lu ? "1px solid #1e293b" : "1px solid #f97316", borderRadius: 16, padding: 16, cursor: "pointer", opacity: n.lu ? 0.7 : 1, position: "relative" }}>
            {!n.lu && <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: 4, background: "#f97316" }} />}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{NOTIF_ICONS[n.type] || "📩"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.titre}</div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>{n.message}</div>
                <div style={{ color: "#475569", fontSize: 11, marginTop: 8 }}>{ago(n.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROMOS BANNER ────────────────────────────────────────────────────────────

const DEMO_PROMOS = [
  { id: 1, code: "PROMO10", description: "10% de réduction sur votre prochaine commande", reduction: 10, type: "pourcentage", dateExpiration: new Date(Date.now() + 7 * 86400000).toISOString() },
  { id: 2, code: "BIENVENUE", description: "Remise de 2 500 FCFA pour les nouveaux clients", reduction: 2500, type: "montant_fixe", dateExpiration: new Date(Date.now() + 30 * 86400000).toISOString() },
];

function PromoBanner({ onApply }: { onApply: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  if (DEMO_PROMOS.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "linear-gradient(135deg, #f9731620, #f97316)", border: "1px solid #f97316", borderRadius: 14, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎁</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Codes promo disponibles</div>
            <div style={{ color: "#fed7aa", fontSize: 12 }}>{DEMO_PROMOS.length} offre(s) active(s) — Appuyez pour voir</div>
          </div>
        </div>
        <span style={{ color: "#fff", fontSize: 18 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
          {DEMO_PROMOS.map(p => (
            <div key={p.id} style={{ padding: "12px 16px", borderTop: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ background: "#f97316", color: "#fff", borderRadius: 8, padding: "2px 10px", fontSize: 12, fontWeight: 800, fontFamily: "monospace" }}>{p.code}</span>
                  <span style={{ color: "#f97316", fontWeight: 700, fontSize: 14 }}>
                    -{p.type === "pourcentage" ? `${p.reduction}%` : `${p.reduction.toLocaleString("fr-FR")} FCFA`}
                  </span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>{p.description}</div>
                <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>Expire le {new Date(p.dateExpiration).toLocaleDateString("fr-FR")}</div>
              </div>
              <button onClick={() => { onApply(p.code); setOpen(false); }} style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Utiliser
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "commander" | "suivi" | "livraisons" | "wallet" | "chat" | "fidelite" | "profil" | "documents" | "notifications";

function MobileApp() {
  const { auth } = useAuth();
  const { cart } = useCart();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!auth.boutiqueId) return <Login />;

  const cartCount = cart.reduce((s, i) => s + i.quantite, 0);

  const bottomTabs = [
    { id: "dashboard", icon: "🏠", label: "Accueil" },
    { id: "commander", icon: "🛒", label: "Commander", badge: cartCount },
    { id: "livraisons", icon: "📦", label: "Livraisons" },
    { id: "wallet", icon: "💰", label: "Wallet" },
    { id: "profil", icon: "👤", label: "Profil" },
  ] as { id: Tab; icon: string; label: string; badge?: number }[];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>LiviPro Boutiquier</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{auth.boutiqueNom}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTab("notifications")} style={{ width: 38, height: 38, borderRadius: 19, background: tab === "notifications" ? "#f9731630" : "#1e293b", border: tab === "notifications" ? "1.5px solid #f97316" : "none", cursor: "pointer", fontSize: 18, position: "relative" }}>
            🔔
            <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, background: "#f97316", display: "block" }} />
          </button>
          <button onClick={() => setTab("chat")} style={{ width: 38, height: 38, borderRadius: 19, background: tab === "chat" ? "#1e293b" : "#1e293b", border: "none", cursor: "pointer", fontSize: 18 }}>💬</button>
          <button onClick={() => setTab("documents")} style={{ width: 38, height: 38, borderRadius: 19, background: tab === "documents" ? "#f9731625" : "#1e293b", border: tab === "documents" ? "1.5px solid #f97316" : "none", cursor: "pointer", fontSize: 18 }}>📂</button>
          <button onClick={() => setTab("fidelite")} style={{ width: 38, height: 38, borderRadius: 19, background: "#f9731620", border: "none", cursor: "pointer", fontSize: 18 }}>⭐</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 16, paddingBottom: 80 }}>
        {tab === "dashboard" && <Dashboard setTab={setTab} />}
        {tab === "commander" && <Commander />}
        {tab === "suivi" && <SuiviLivraison />}
        {tab === "livraisons" && <Livraisons />}
        {tab === "wallet" && <Wallet />}
        {tab === "chat" && <Chat />}
        {tab === "fidelite" && <Fidelite />}
        {tab === "profil" && <Profil />}
        {tab === "documents" && <DocumentsBoutiquier />}
        {tab === "notifications" && <Notifications />}
      </div>

      {/* Bottom Nav */}
      <div style={{ background: "#1e293b", borderTop: "1px solid #334155", display: "flex", position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 20 }}>
        {bottomTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "10px 4px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            {t.badge ? <span style={{ position: "absolute", top: 6, right: "50%", transform: "translateX(50%) translateX(10px)", background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span> : null}
            <span style={{ fontSize: 10, color: tab === t.id ? "#f97316" : "#64748b", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            {tab === t.id && <div style={{ position: "absolute", bottom: 0, width: 24, height: 3, background: "#f97316", borderRadius: "2px 2px 0 0" }} />}
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
        <CartProvider>
          <MobileApp />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
