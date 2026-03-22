import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, CreditCard, Wallet, ArrowUpRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;
const fmt = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

function ScoreBadge({ score, risque }: { score: number; risque: string }) {
  const cfg = risque === "faible" ? "bg-green-100 text-green-700 border-green-200"
    : risque === "modere" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : risque === "eleve" ? "bg-orange-100 text-orange-700 border-orange-200"
    : "bg-red-100 text-red-700 border-red-200";
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
            stroke={risque === "faible" ? "#22c55e" : risque === "modere" ? "#eab308" : risque === "eleve" ? "#f97316" : "#ef4444"}
            strokeDasharray={`${score} 100`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{score}</span>
      </div>
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border capitalize", cfg)}>{risque}</span>
    </div>
  );
}

function NiveauBadge({ niveau }: { niveau: string }) {
  const cfg = niveau === "Platine" ? "bg-purple-100 text-purple-700"
    : niveau === "Or" ? "bg-yellow-100 text-yellow-700"
    : niveau === "Argent" ? "bg-slate-100 text-slate-600"
    : "bg-orange-100 text-orange-700";
  const emojis: Record<string, string> = { Platine: "💎", Or: "🥇", Argent: "🥈", Bronze: "🥉" };
  return <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", cfg)}>{emojis[niveau]} {niveau}</span>;
}

export default function CreditFinance() {
  const { grossisteId } = useGrossiste();
  const [tab, setTab] = useState<"credit" | "cashflow" | "fidelite">("credit");

  const { data: credits = [], isLoading: loadingCredit } = useQuery({
    queryKey: ["credit-scores", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/credit-scores`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: cashflow, isLoading: loadingCashflow } = useQuery({
    queryKey: ["cashflow", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/cashflow-prevision`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: fidelite = [], isLoading: loadingFidelite } = useQuery({
    queryKey: ["fidelite", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/fidelite`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const tabs = [
    { id: "credit", label: "Scores Crédit", icon: CreditCard },
    { id: "cashflow", label: "Trésorerie", icon: Wallet },
    { id: "fidelite", label: "Fidélité", icon: ArrowUpRight },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Finance & Crédit</h1>
          <p className="text-slate-500 mt-1 text-sm">Scoring automatique, trésorerie prévisionnelle et programme de fidélité</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Calculé en </span>temps réel
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex-shrink-0",
              tab === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 border border-border hover:border-primary/30")}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "credit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Risque Faible", val: credits.filter((c: any) => c.risque === "faible").length, color: "text-green-600", bg: "bg-green-50" },
              { label: "Risque Modéré", val: credits.filter((c: any) => c.risque === "modere").length, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Risque Élevé", val: credits.filter((c: any) => c.risque === "eleve").length, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Critique", val: credits.filter((c: any) => c.risque === "critique").length, color: "text-red-600", bg: "bg-red-50" },
            ].map(k => (
              <div key={k.label} className={cn("rounded-2xl p-4", k.bg)}>
                <div className={cn("text-2xl font-bold", k.color)}>{k.val}</div>
                <div className="text-sm text-slate-600 mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          {loadingCredit ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-border">
                      <tr>
                        {["Boutique", "Score", "Risque", "Limite Actuelle", "Limite Recommandée", "Solde Dû", "CA Total", "Taux Réussite", "Dernière Livraison"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {credits.map((c: any) => (
                        <tr key={c.boutiqueId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 text-sm">{c.boutiqueNom}</div>
                            <div className="text-xs text-slate-400">{c.proprietaire}</div>
                          </td>
                          <td className="px-4 py-3"><ScoreBadge score={c.score} risque={c.risque} /></td>
                          <td className="px-4 py-3 capitalize text-sm font-medium">{c.risque}</td>
                          <td className="px-4 py-3 text-sm">{fmt(c.limiteActuelle)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm font-semibold text-primary">{fmt(c.limiteRecommandee)}
                              {c.limiteRecommandee > c.limiteActuelle ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-orange-600">{fmt(c.soldeCredit)}</td>
                          <td className="px-4 py-3 text-sm">{fmt(c.caTotal)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${c.tauxReussite}%`, background: c.tauxReussite >= 75 ? "#22c55e" : c.tauxReussite >= 50 ? "#f97316" : "#ef4444" }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">{c.tauxReussite}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{c.derniereLivraison ? new Date(c.derniereLivraison).toLocaleDateString("fr-FR") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {credits.map((c: any) => (
                  <div key={c.boutiqueId} className="bg-white rounded-2xl border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-slate-900">{c.boutiqueNom}</div>
                        <div className="text-xs text-slate-400">{c.proprietaire}</div>
                      </div>
                      <ScoreBadge score={c.score} risque={c.risque} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">Limite actuelle</div>
                        <div className="font-medium text-slate-700">{fmt(c.limiteActuelle)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">Limite recommandée</div>
                        <div className="flex items-center gap-1 font-semibold text-primary">
                          {fmt(c.limiteRecommandee)}
                          {c.limiteRecommandee > c.limiteActuelle ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">Solde dû</div>
                        <div className="font-semibold text-orange-600">{fmt(c.soldeCredit)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">CA Total</div>
                        <div className="font-medium text-slate-700">{fmt(c.caTotal)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.tauxReussite}%`, background: c.tauxReussite >= 75 ? "#22c55e" : c.tauxReussite >= 50 ? "#f97316" : "#ef4444" }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{c.tauxReussite}%</span>
                      </div>
                      <span className="text-xs text-slate-400">{c.derniereLivraison ? new Date(c.derniereLivraison).toLocaleDateString("fr-FR") : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "cashflow" && (
        <div className="space-y-6">
          {loadingCashflow ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : cashflow ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-border p-5">
                  <div className="text-sm text-slate-500 mb-1">Encaissé (historique)</div>
                  <div className="text-2xl font-bold text-slate-900">{fmt(cashflow.encaissTotal)}</div>
                  <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paiements confirmés</div>
                </div>
                <div className="bg-white rounded-2xl border border-border p-5">
                  <div className="text-sm text-slate-500 mb-1">Crédit en cours</div>
                  <div className="text-2xl font-bold text-orange-600">{fmt(cashflow.creditEnCours)}</div>
                  <div className="text-xs text-slate-400 mt-1">{cashflow.boutiquesEnCredit?.length ?? 0} boutique(s) concernée(s)</div>
                </div>
                <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
                  <div className="text-sm text-primary font-semibold mb-1">Prévision semaine prochaine</div>
                  <div className="text-2xl font-bold text-primary">{fmt(cashflow.previsionSemaine)}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Basé sur la tendance</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-bold text-slate-900 mb-4">Évolution du flux de trésorerie (6 semaines + prévision)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={cashflow.semaines} barGap={2}>
                    <XAxis dataKey="semaine" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000).toFixed(0) + "k"} />
                    <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={l => `Semaine ${l}`} />
                    <Bar dataKey="encaisse" name="Encaissé" stackId="a" fill="#22c55e" radius={[0,0,0,0]}>
                      {cashflow.semaines?.map((s: any, i: number) => (
                        <Cell key={i} fill={s.isPrevision ? "#bbf7d0" : "#22c55e"} />
                      ))}
                    </Bar>
                    <Bar dataKey="credit" name="Crédit différé" stackId="a" fill="#f97316" radius={[4,4,0,0]}>
                      {cashflow.semaines?.map((s: any, i: number) => (
                        <Cell key={i} fill={s.isPrevision ? "#fed7aa" : "#f97316"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Encaissé (espèces + mobile)</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Crédit différé</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Prévision</span>
                </div>
              </div>

              {(cashflow.boutiquesEnCredit?.length ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Boutiques en crédit différé</h3>
                  <div className="space-y-2">
                    {cashflow.boutiquesEnCredit.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{b.nom}</div>
                          <div className="text-xs text-slate-500">{b.proprietaire}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">{fmt(b.solde)}</div>
                          <div className="text-xs text-slate-400">Solde dû</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {tab === "fidelite" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "💎 Platine", val: fidelite.filter((f: any) => f.niveau === "Platine").length, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "🥇 Or", val: fidelite.filter((f: any) => f.niveau === "Or").length, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "🥈 Argent", val: fidelite.filter((f: any) => f.niveau === "Argent").length, color: "text-slate-600", bg: "bg-slate-50" },
              { label: "🥉 Bronze", val: fidelite.filter((f: any) => f.niveau === "Bronze").length, color: "text-orange-600", bg: "bg-orange-50" },
            ].map(k => (
              <div key={k.label} className={cn("rounded-2xl p-4", k.bg)}>
                <div className={cn("text-2xl font-bold", k.color)}>{k.val}</div>
                <div className="text-sm text-slate-600 mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          {loadingFidelite ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-primary/5 to-orange-50 border-b border-border">
                <p className="text-sm text-slate-600">Les points sont calculés automatiquement : <strong>10 pts</strong> par livraison réussie, <strong>1 pt</strong> par 10 000 FCFA, <strong>5 pts</strong> pour paiement mobile, <strong>50 pts</strong> bonus 0 litige.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {fidelite.map((f: any, i: number) => (
                  <div key={f.boutiqueId} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className="text-lg font-bold text-slate-300 w-6 text-center flex-shrink-0">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{f.boutiqueNom}</div>
                      <div className="text-xs text-slate-400 truncate">{f.proprietaire} · {f.totalLivraisons} livraisons · CA {fmt(f.caTotal)}</div>
                      {f.prochainNiveau && (
                        <div className="mt-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                            <span>{f.points} pts</span>
                            <span>Prochain : {f.prochainNiveau} pts</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (f.points / f.prochainNiveau) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <NiveauBadge niveau={f.niveau} />
                      <div className="text-xs text-slate-400 mt-1">{f.remisePct > 0 ? `−${f.remisePct}% remise` : "Pas de remise"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
