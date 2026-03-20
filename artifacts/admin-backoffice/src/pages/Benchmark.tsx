import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Cell } from "recharts";
import { TrendingUp, Globe, Users, Store, Award, Leaf, Smartphone, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;
const fmt = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

function ESGRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 40, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="54" textAnchor="middle" className="text-xl font-bold" fill="#1e293b" style={{ fontSize: 20, fontWeight: 700 }}>{score}</text>
      </svg>
      <span className="text-xs font-semibold text-slate-600 text-center">{label}</span>
    </div>
  );
}

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#eab308"];

export default function Benchmark() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-benchmark"],
    queryFn: () => fetch(`${BASE}api/admin/benchmark`).then(r => r.json()),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { grossistes = [], moyennes = {}, totalChauffeurs = 0, totalBoutiques = 0, totalCA = 0 } = data ?? {};

  const radarData = ["Emplois", "Boutiques", "Paiement digital", "Taux livraison"].map((name, i) => {
    const keys = ["jobsScore", "boutiquesScore", "digitalScore", "livraisonScore"];
    const entry: any = { name };
    grossistes.forEach((g: any) => { entry[g.nom] = g[keys[i]] ?? 0; });
    return entry;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Benchmark & Impact ESG</h1>
        <p className="text-slate-500 mt-1">Comparaison inter-distributeurs · Score d'impact social et environnemental</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Emplois créés", val: totalChauffeurs, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Boutiques servies", val: totalBoutiques, icon: Store, color: "text-green-600", bg: "bg-green-50" },
          { label: "CA total généré", val: fmt(totalCA), icon: TrendingUp, color: "text-primary", bg: "bg-orange-50" },
          { label: "Score ESG moyen", val: `${moyennes.esgScore ?? 0}/100`, icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(k => (
          <div key={k.label} className={cn("rounded-2xl p-4 flex items-center gap-3", k.bg)}>
            <k.icon className={cn("w-8 h-8 shrink-0", k.color)} />
            <div>
              <div className={cn("text-xl font-bold", k.color)}>{k.val}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold text-slate-900 mb-4">Classement ESG</h2>
          <div className="space-y-3">
            {grossistes.map((g: any, i: number) => (
              <div key={g.grossisteId} className={cn("rounded-xl p-4 border", i === 0 ? "border-primary/30 bg-primary/5" : "border-border")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-lg font-bold", i === 0 ? "text-primary" : "text-slate-400")}>#{i + 1}</span>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {g.nom}
                        {i === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                        {g.statut !== "actif" && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{g.statut}</span>}
                      </div>
                      <div className="text-xs text-slate-400">{g.ville} · {g.chauffeurs} chauffeurs · {g.boutiques} boutiques</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-2xl font-bold", g.esgScore >= 70 ? "text-green-600" : g.esgScore >= 40 ? "text-yellow-600" : "text-red-500")}>{g.esgScore}</div>
                    <div className="text-xs text-slate-400">Score ESG</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[
                    { label: "Livraison", val: g.tauxReussite + "%", color: g.tauxReussite >= 70 ? "#22c55e" : "#f97316" },
                    { label: "Digital", val: g.paiementDigital + "%", color: "#3b82f6" },
                    { label: "Litiges", val: g.tauxLitige + "%", color: g.tauxLitige > 10 ? "#ef4444" : "#22c55e" },
                    { label: "CA", val: (g.caTotal / 1000000).toFixed(1) + "M", color: "#f97316" },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className="text-sm font-bold" style={{ color: m.color }}>{m.val}</div>
                      <div className="text-xs text-slate-400">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold text-slate-900 mb-4">Radar de performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              {grossistes.map((g: any, i: number) => (
                <Radar key={g.grossisteId} name={g.nom} dataKey={g.nom} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15} />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-bold text-slate-900 mb-1">CA par distributeur</h2>
        <p className="text-slate-500 text-sm mb-4">Chiffre d'affaires total généré via LiviPro par réseau</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={grossistes} barSize={40}>
            <XAxis dataKey="nom" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000000).toFixed(1) + "M"} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="caTotal" name="CA Total" radius={[6, 6, 0, 0]}>
              {grossistes.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <Leaf className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-bold text-lg mb-2">Impact Social</h3>
          <div className="text-3xl font-bold mb-1">{totalChauffeurs}</div>
          <p className="text-green-100 text-sm">emplois de chauffeurs-livreurs soutenus par LiviPro</p>
          <div className="mt-3 text-3xl font-bold">{totalBoutiques}</div>
          <p className="text-green-100 text-sm">boutiques approvisionnées régulièrement</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <Smartphone className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-bold text-lg mb-2">Digitalisation</h3>
          <div className="text-3xl font-bold mb-1">{moyennes.paiementDigital ?? 0}%</div>
          <p className="text-blue-100 text-sm">des paiements effectués via mobile money (Wave, Orange)</p>
          <div className="mt-3 text-sm text-blue-100">
            {moyennes.paiementDigital >= 50 ? "✅ Objectif digitalisation atteint" : "⏳ En progression vers 50%"}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-primary rounded-2xl p-6 text-white">
          <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-bold text-lg mb-2">Qualité de Service</h3>
          <div className="text-3xl font-bold mb-1">{moyennes.tauxReussite ?? 0}%</div>
          <p className="text-orange-100 text-sm">taux de livraison réussie sur l'ensemble du réseau</p>
          <div className="mt-3 text-sm text-orange-100">
            {moyennes.tauxReussite >= 80 ? "🏆 Excellence opérationnelle" : moyennes.tauxReussite >= 60 ? "📈 Bon niveau — marge de progression" : "⚠️ Amélioration nécessaire"}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-border p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-600" /> Méthodologie Score ESG LiviPro</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Emplois créés", pct: "30%", desc: "Chauffeurs actifs × 10 pts (max 100)" },
            { label: "Boutiques servies", pct: "30%", desc: "Boutiques × 5 pts (max 100)" },
            { label: "Paiement digital", pct: "20%", desc: "% transactions mobile money" },
            { label: "Qualité livraison", pct: "20%", desc: "Taux de réussite des livraisons" },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl p-3 border border-border">
              <div className="font-bold text-primary text-lg">{m.pct}</div>
              <div className="font-semibold text-slate-700 text-sm">{m.label}</div>
              <div className="text-xs text-slate-400 mt-1">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
