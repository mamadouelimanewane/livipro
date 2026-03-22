import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery } from "@tanstack/react-query";

const API = (import.meta.env.VITE_API_BASE_URL || "") + "/api";

export default function Login() {
  const { login } = useGrossiste();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGrossiste, setSelectedGrossiste] = useState<{ id: number; nom: string } | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: grossistes, isLoading: gLoading } = useQuery({
    queryKey: ["grossistes-login"],
    queryFn: () => fetch(`${API}/admin/grossistes`).then(r => r.json()),
  });

  const handlePin = async (digit: string) => {
    if (pin.length >= 4 || loading) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setLoading(true);
      setError("");
      const result = await login(selectedGrossiste!.id, newPin);
      if (!result.success) {
        setError(result.error || "Code incorrect");
        setPin("");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-white font-bold text-3xl tracking-tight">LiviPro</span>
          </div>
          <p className="text-slate-400 text-sm">Backoffice Grossiste</p>
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          {step === 1 && (
            <>
              <h2 className="text-white text-xl font-bold mb-1">Sélectionnez votre espace</h2>
              <p className="text-slate-400 text-sm mb-6">Choisissez votre compte grossiste</p>
              {gLoading ? (
                <p className="text-slate-400 text-center py-8">Chargement…</p>
              ) : (
                <div className="space-y-3">
                  {(grossistes || []).map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => { setSelectedGrossiste(g); setStep(2); setPin(""); setError(""); }}
                      className="w-full text-left p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-orange-500 transition-colors group"
                    >
                      <p className="text-white font-semibold group-hover:text-orange-400 transition-colors">{g.nom}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{g.telephone || "—"}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => { setStep(1); setPin(""); setError(""); }}
                className="text-orange-500 text-sm mb-5 hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                ← Retour
              </button>
              <h2 className="text-white text-xl font-bold mb-1">Code d'accès</h2>
              <p className="text-slate-400 text-sm mb-1">{selectedGrossiste?.nom}</p>
              <p className="text-slate-500 text-xs mb-6">Les 4 derniers chiffres de votre téléphone</p>

              {/* PIN dots */}
              <div className="flex gap-3 justify-center mb-8">
                {loading ? (
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" opacity=".25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Vérification en cours…
                  </div>
                ) : [0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: pin.length > i ? "#f97316" : "#0f172a",
                      border: `2px solid ${pin.length > i ? "#f97316" : "#334155"}`,
                    }}
                  >
                    {pin.length > i && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-center text-sm mb-4">{error}</p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((d, i) => (
                  <button
                    key={i}
                    disabled={d === "" || loading}
                    onClick={() => {
                      if (d === "⌫") { if (!loading) setPin(p => p.slice(0, -1)); }
                      else if (d !== "") handlePin(d);
                    }}
                    className="h-16 rounded-2xl text-white text-2xl font-semibold transition-colors disabled:opacity-0 disabled:pointer-events-none"
                    style={{
                      background: d === "" ? "transparent" : "#0f172a",
                      border: d === "" ? "none" : "1px solid #334155",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
