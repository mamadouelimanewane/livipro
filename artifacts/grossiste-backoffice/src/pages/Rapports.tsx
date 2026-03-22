import { useState, useMemo } from "react";
import { useLivraisons } from "@/hooks/use-livraisons";
import { useTournees } from "@/hooks/use-tournees";
import { useBoutiques } from "@/hooks/use-boutiques";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA, formatDate, formatShortDate } from "@/lib/utils";
import { BarChart3, Download, TrendingUp, CheckCircle2, Package, Users, Calendar, Trophy } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

type Period = "today" | "7d" | "30d" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Aujourd'hui",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  all: "Tout le temps",
};

function isInPeriod(dateStr: string, period: Period): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (period === "7d") {
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  }
  if (period === "30d") {
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  return true;
}

const STATUS_COLORS: Record<string, string> = {
  livree: "#10b981",
  en_attente: "#94a3b8",
  echec: "#f43f5e",
  litige: "#f59e0b",
};

function exportCSV(data: any[], period: Period) {
  const headers = ["Date", "Boutique", "Tournée", "Chauffeur", "Montant (FCFA)", "Paiement", "Statut"];
  const lines = data.map(l => [
    formatDate(l.createdAt),
    l.boutique?.nom ?? "—",
    `TRN-${l.tourneeId}`,
    l.chauffeurNom ?? "—",
    l.montant,
    l.methodePaiement,
    l.statut,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapport_${PERIOD_LABELS[period].replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Rapports() {
  const { data: livraisons, isLoading: loadingL } = useLivraisons();
  const { data: tournees } = useTournees();
  const { data: boutiques } = useBoutiques();
  const { data: chauffeurs } = useChauffeurs();
  const [period, setPeriod] = useState<Period>("30d");

  // Build a map: tourneeId → chauffeurNom
  const tourneeMap = useMemo(() => {
    const m: Record<number, string> = {};
    (tournees ?? []).forEach((t: any) => { m[t.id] = t.chauffeurNom ?? "Inconnu"; });
    return m;
  }, [tournees]);

  // Filter livraisons by period
  const filtered = useMemo(() => {
    if (!livraisons) return [];
    return livraisons.filter((l: any) => isInPeriod(l.createdAt, period)).map((l: any) => ({
      ...l,
      chauffeurNom: tourneeMap[l.tourneeId] ?? "Inconnu",
    }));
  }, [livraisons, period, tourneeMap]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filtered.length;
    const reussies = filtered.filter((l: any) => l.statut === "livree");
    const ca = reussies.reduce((s: number, l: any) => s + (Number(l.montant) || 0), 0);
    const tauxReussite = total > 0 ? Math.round((reussies.length / total) * 100) : 0;
    const caParLivraison = reussies.length > 0 ? Math.round(ca / reussies.length) : 0;
    return { total, caTotal: ca, tauxReussite, caParLivraison, nbReussies: reussies.length };
  }, [filtered]);

  // Top boutiques by CA
  const topBoutiques = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((l: any) => l.statut === "livree").forEach((l: any) => {
      const nom = l.boutique?.nom ?? "—";
      map[nom] = (map[nom] ?? 0) + (Number(l.montant) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([nom, ca]) => ({ nom, ca }));
  }, [filtered]);

  // Top chauffeurs by CA
  const topChauffeurs = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((l: any) => l.statut === "livree").forEach((l: any) => {
      const nom = l.chauffeurNom ?? "Inconnu";
      map[nom] = (map[nom] ?? 0) + (Number(l.montant) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nom, ca]) => ({ nom, ca }));
  }, [filtered]);

  // Statut distribution
  const statutDist = useMemo(() => {
    const map: Record<string, number> = { livree: 0, en_attente: 0, echec: 0, litige: 0 };
    filtered.forEach((l: any) => { if (l.statut in map) map[l.statut]++; });
    return Object.entries(map).map(([statut, count]) => ({ statut, count }));
  }, [filtered]);

  // Paiement distribution
  const paiementDist = useMemo(() => {
    const map: Record<string, number> = { especes: 0, mobile_money: 0, credit: 0 };
    filtered.filter((l: any) => l.statut === "livree").forEach((l: any) => {
      if (l.methodePaiement in map) map[l.methodePaiement]++;
    });
    return Object.entries(map).map(([mode, count]) => ({ mode, count }));
  }, [filtered]);

  // CA evolution (by day for 7/30d, or by tournée for "all")
  const caEvolution = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter((l: any) => l.statut === "livree").forEach((l: any) => {
      const day = formatShortDate(l.createdAt);
      map[day] = (map[day] ?? 0) + (Number(l.montant) || 0);
    });
    return Object.entries(map).slice(-14).map(([day, ca]) => ({ day, ca }));
  }, [filtered]);

  const isLoading = loadingL;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Rapports & Analytics"
        description="Analysez vos performances commerciales et logistiques en détail."
        action={
          <button
            onClick={() => exportCSV(filtered, period)}
            disabled={!filtered.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-sm font-bold transition-all shadow-sm disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Exporter le rapport
          </button>
        }
      />

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
          <Calendar className="w-3.5 h-3.5" /> Période :
        </span>
        {(["today", "7d", "30d", "all"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "CA Collecté", value: formatFCFA(kpis.caTotal), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", sub: `${kpis.nbReussies} livraisons réussies` },
          { label: "Taux de Réussite", value: `${kpis.tauxReussite}%`, icon: CheckCircle2, color: kpis.tauxReussite >= 80 ? "text-emerald-600" : "text-amber-600", bg: kpis.tauxReussite >= 80 ? "bg-emerald-50" : "bg-amber-50", sub: `${kpis.nbReussies}/${kpis.total} opérations` },
          { label: "Total Livraisons", value: kpis.total, icon: Package, color: "text-blue-600", bg: "bg-blue-50", sub: "sur la période sélectionnée" },
          { label: "Panier Moyen", value: formatFCFA(kpis.caParLivraison), icon: Trophy, color: "text-purple-600", bg: "bg-purple-50", sub: "par livraison réussie" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* CA Evolution chart */}
      {caEvolution.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Évolution du CA
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={caEvolution} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(v: number) => [formatFCFA(v), "CA"]}
                />
                <Area type="monotone" dataKey="ca" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gradCA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top boutiques */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Top Boutiques (CA)
          </h3>
          {topBoutiques.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Aucune donnée sur cette période</p>
          ) : (
            <div className="space-y-3">
              {topBoutiques.map((b, i) => {
                const maxCA = topBoutiques[0]?.ca ?? 1;
                const pct = Math.round((b.ca / maxCA) * 100);
                return (
                  <div key={b.nom}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-500"}`}>{i + 1}</span>
                        <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{b.nom}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 ml-2">{formatFCFA(b.ca)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top chauffeurs */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Top Chauffeurs (CA)
          </h3>
          {topChauffeurs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Aucune donnée sur cette période</p>
          ) : (
            <div className="space-y-3">
              {topChauffeurs.map((c, i) => {
                const maxCA = topChauffeurs[0]?.ca ?? 1;
                const pct = Math.round((c.ca / maxCA) * 100);
                return (
                  <div key={c.nom}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {c.nom.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{c.nom}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 ml-2">{formatFCFA(c.ca)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Statut distribution */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Répartition des Statuts
          </h3>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {statutDist.map(({ statut, count }) => {
                const total = filtered.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const labels: Record<string, string> = { livree: "Livrée", en_attente: "En attente", echec: "Échec", litige: "Litige" };
                const colors: Record<string, string> = { livree: "bg-emerald-500", en_attente: "bg-slate-400", echec: "bg-rose-500", litige: "bg-amber-500" };
                return (
                  <div key={statut}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-medium text-foreground">{labels[statut] ?? statut}</span>
                      <span className="font-bold text-slate-600">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[statut] ?? "bg-slate-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Paiement distribution */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" /> Modes de Paiement (livrées)
          </h3>
          {filtered.filter((l: any) => l.statut === "livree").length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Aucune données</p>
          ) : (
            <div className="space-y-3">
              {paiementDist.map(({ mode, count }) => {
                const totalPaid = paiementDist.reduce((s, p) => s + p.count, 0);
                const pct = totalPaid > 0 ? Math.round((count / totalPaid) * 100) : 0;
                const labels: Record<string, string> = { especes: "💵 Espèces", mobile_money: "📱 Mobile Money", credit: "💳 Crédit" };
                const colors: Record<string, string> = { especes: "bg-emerald-500", mobile_money: "bg-blue-500", credit: "bg-purple-500" };
                return (
                  <div key={mode}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-medium text-foreground">{labels[mode] ?? mode}</span>
                      <span className="font-bold text-slate-600">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[mode] ?? "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
