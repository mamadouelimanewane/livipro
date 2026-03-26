import { Layout } from "@/components/layout/Layout";
import { useGetAdminStats, useListGrossistes } from "@workspace/api-client-react";
import { formatFCFA } from "@/lib/utils";
import {
  Building2, Users, Store, Map, Truck, DollarSign, TrendingUp, Activity,
  AlertCircle, CheckCircle2, Clock, Award
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy text-white px-3 py-2 rounded-xl text-xs shadow-lg">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{typeof p.value === "number" && p.value > 1000 ? formatFCFA(p.value) : p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useGetAdminStats();
  const { data: grossistesRaw } = useListGrossistes();

  if (isLoading) {
    return (
      <Layout title="Tableau de Bord">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm animate-pulse h-28" />
          ))}
        </div>
      </Layout>
    );
  }
  if (isError || !stats) {
    return (
      <Layout title="Tableau de Bord">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          Erreur lors du chargement des données.
        </div>
      </Layout>
    );
  }

  const kpis = [
    { title: "CA Mensuel", value: formatFCFA(stats.chiffreAffairesMensuel), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", highlight: true },
    { title: "Grossistes Actifs", value: stats.totalGrossistes, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Chauffeurs", value: stats.totalChauffeurs, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Boutiques Clientes", value: stats.totalBoutiques, icon: Store, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
    { title: "Tournées Total", value: stats.totalTournees, icon: Map, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
    { title: "Tournées En Cours", value: stats.tourneesEnCours, icon: Activity, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { title: "Livraisons Aujourd'hui", value: stats.livraisonsAujourdHui, icon: Truck, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
    { title: "Taux de Réussite", value: `${stats.tauxLivraisonReussi}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  // Per-grossiste chart data from API
  const grossistes = grossistesRaw ?? [];
  const caData = grossistes.map((g: any) => ({
    name: (g.nom as string).split(" ")[0],
    fullName: g.nom,
    ca: g.chiffreAffairesMensuel ?? 0,
    tournees: g.nombreTournees ?? 0,
    boutiques: g.nombreBoutiques ?? 0,
  }));

  // Simulated monthly trend (last 6 months)
  const months = ["Oct", "Nov", "Déc", "Jan", "Fév", "Mar"];
  const trendData = months.map((m, i) => ({
    mois: m,
    ca: Math.round(stats.chiffreAffairesMensuel * (0.6 + (i * 0.08) + (Math.sin(i) * 0.05))),
    livraisons: Math.round(stats.livraisonsAujourdHui * 28 * (0.7 + i * 0.06)),
  }));

  // Donut data for statuts
  const statutData = [
    { name: "Livrées", value: Math.round(stats.tauxLivraisonReussi), color: "#10b981" },
    { name: "Échecs", value: Math.round((100 - stats.tauxLivraisonReussi) * 0.6), color: "#ef4444" },
    { name: "Litiges", value: Math.round((100 - stats.tauxLivraisonReussi) * 0.4), color: "#f59e0b" },
  ];

  const alerts = [
    { icon: Activity, color: "text-orange-500", bg: "bg-orange-50", title: `${stats.tourneesEnCours} tournée${stats.tourneesEnCours > 1 ? "s" : ""} en cours`, sub: "Suivi en temps réel actif" },
    { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", title: `${stats.tauxLivraisonReussi}% de taux de réussite`, sub: stats.tauxLivraisonReussi >= 80 ? "Excellent performance globale" : "Amélioration recommandée" },
    { icon: Award, color: "text-violet-500", bg: "bg-violet-50", title: `${stats.totalChauffeurs} chauffeur${stats.totalChauffeurs > 1 ? "s" : ""} actif${stats.totalChauffeurs > 1 ? "s" : ""}`, sub: `Sur ${stats.totalGrossistes} réseaux de distribution` },
  ];

  return (
    <Layout title="Vue d'Ensemble">
      {/* KPIs */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} variants={item}
            className={`bg-white p-5 rounded-2xl border ${kpi.border ?? "border-border"} shadow-sm hover:shadow-md transition-all duration-200 group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} group-hover:scale-110 transition-transform duration-200`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              {kpi.highlight && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">★ Clé</span>}
            </div>
            <p className="text-xs font-medium text-slate-500 mb-1">{kpi.title}</p>
            <h3 className="text-xl font-display font-bold text-navy">{kpi.value}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* CA Trend line chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-navy font-display">Tendance du CA</h3>
              <p className="text-xs text-slate-400 mt-0.5">6 derniers mois</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-100">
              <TrendingUp className="w-3 h-3" />+{Math.round(trendData[5].ca / trendData[0].ca * 100 - 100)}% vs Oct
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ca" name="CA (FCFA)" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, fill: "#f97316" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart taux réussite */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-base font-bold text-navy font-display mb-1">Statuts Livraisons</h3>
          <p className="text-xs text-slate-400 mb-4">Répartition globale</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={statutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {statutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {statutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-500">{d.name}</span>
                </div>
                <span className="font-bold text-navy">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-grossiste bar chart + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CA par grossiste */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-navy font-display">Performance par Distributeur</h3>
              <p className="text-xs text-slate-400 mt-0.5">CA et boutiques — ce mois</p>
            </div>
          </div>
          {caData.length === 0 ? (
            <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={caData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ca" name="CA (FCFA)" radius={[6, 6, 0, 0]}>
                  {caData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Grossiste mini table */}
          {caData.length > 0 && (
            <div className="mt-4 space-y-2">
              {caData.map((g: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium text-navy flex-1 truncate">{g.fullName}</span>
                  <span className="text-sm font-bold text-navy">{formatFCFA(g.ca)}</span>
                  {g.boutiques > 0 && <span className="text-xs text-slate-400">{g.boutiques} boutiques</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts panel */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-base font-bold text-navy font-display mb-4">Indicateurs Clés</h3>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${a.bg}`} style={{ borderColor: "transparent" }}>
                <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}>
                  <a.icon className={`w-4 h-4 ${a.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick stat */}
          <div className="mt-4 p-4 bg-navy rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-slate-300">Aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold font-display">{stats.livraisonsAujourdHui}</p>
            <p className="text-xs text-slate-400 mt-0.5">livraison{stats.livraisonsAujourdHui > 1 ? "s" : ""} effectuée{stats.livraisonsAujourdHui > 1 ? "s" : ""}</p>
            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(stats.tauxLivraisonReussi, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
