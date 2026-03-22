import { useState } from "react";
import { Link } from "wouter";
import { useStats } from "@/hooks/use-stats";
import { useLivraisons } from "@/hooks/use-livraisons";
import { useTournees } from "@/hooks/use-tournees";
import { useBoutiques } from "@/hooks/use-boutiques";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import {
  Users, Store, Truck, MapPin, TrendingUp, CheckCircle2,
  AlertTriangle, ArrowRight, Clock, Zap, BarChart3, Package
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useStats();
  const { data: livraisons, isLoading: loadingL } = useLivraisons();
  const { data: tournees, isLoading: loadingT } = useTournees();
  const { data: boutiques } = useBoutiques();

  const isLoading = loadingStats;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Alertes crédit (boutiques avec > 80% de leur limite utilisée)
  const alertesCredit = (boutiques ?? []).filter((b: any) => {
    const pct = b.limiteCredit > 0 ? (b.soldeCredit / b.limiteCredit) * 100 : 0;
    return pct >= 80;
  });

  // Tournées en cours
  const tourneesEnCours = (tournees ?? []).filter((t: any) => t.statut === "en_cours");

  // Livraisons récentes (5 dernières)
  const livraisonsRecentes = (livraisons ?? []).slice(-5).reverse();

  // Top boutiques par CA (livraisons livrées)
  const livraisonsLivrees = (livraisons ?? []).filter((l: any) => l.statut === "livree");
  const topBoutiques: Record<string, number> = {};
  livraisonsLivrees.forEach((l: any) => {
    const n = l.boutique?.nom ?? "—";
    topBoutiques[n] = (topBoutiques[n] ?? 0) + (Number(l.montant) || 0);
  });
  const topBoutiquesList = Object.entries(topBoutiques).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Chart data from real livraisons (group by day)
  const caByDay: Record<string, number> = {};
  livraisonsLivrees.forEach((l: any) => {
    const day = new Date(l.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    caByDay[day] = (caByDay[day] ?? 0) + (Number(l.montant) || 0);
  });
  const chartData = Object.entries(caByDay).slice(-8).map(([name, ca]) => ({ name, ca }));
  if (chartData.length === 0) {
    ["01/03", "05/03", "10/03", "15/03", "20/03", "22/03"].forEach((d, i) => {
      chartData.push({ name: d, ca: [150000, 300000, 250000, 480000, 380000, stats?.chiffreAffairesMensuel ?? 0][i] });
    });
  }

  const kpis = [
    { label: "CA du mois", value: formatFCFA(stats?.chiffreAffairesMensuel), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", href: "/rapports" },
    { label: "Tournées en cours", value: stats?.tourneesEnCours ?? 0, icon: Truck, color: "text-amber-500", bg: "bg-amber-500/10", href: "/tournees" },
    { label: "Livraisons aujourd'hui", value: stats?.livraisonsAujourdHui ?? 0, icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10", href: "/livraisons" },
    { label: "Taux de réussite", value: `${stats?.tauxLivraisonReussi ?? 0}%`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/rapports" },
    { label: "Boutiques clientes", value: stats?.totalBoutiques ?? 0, icon: Store, color: "text-purple-500", bg: "bg-purple-500/10", href: "/boutiques" },
    { label: "Chauffeurs actifs", value: stats?.totalChauffeurs ?? 0, icon: Users, color: "text-rose-500", bg: "bg-rose-500/10", href: "/chauffeurs" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de Bord"
        description="Pilotez vos opérations en temps réel depuis votre tablette ou smartphone."
      />

      {/* Alertes importantes */}
      {alertesCredit.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-800 text-sm">
                {alertesCredit.length} boutique{alertesCredit.length > 1 ? "s" : ""} proche{alertesCredit.length > 1 ? "s" : ""} de la limite crédit
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {alertesCredit.map((b: any) => {
                  const pct = Math.round((b.soldeCredit / b.limiteCredit) * 100);
                  return (
                    <Link key={b.id} href="/boutiques">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer">
                        🏪 {b.nom} — {pct}% utilisé
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.href}>
            <div className="bg-card border border-border/50 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">{kpi.label}</p>
              <h3 className="text-xl font-bold text-foreground">{kpi.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Tournées en cours — live */}
      {tourneesEnCours.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Tournées en cours ({tourneesEnCours.length})
            </h3>
            <Link href="/tournees" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {tourneesEnCours.map((t: any) => (
              <Link key={t.id} href={`/tournees/${t.id}`}>
                <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{t.chauffeurNom}</div>
                      <div className="text-xs text-muted-foreground">{t.nombreArrets} arrêts · {formatFCFA(t.totalLivraisons)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.statut} />
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CA chart */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Évolution du CA</h3>
            <Link href="/rapports" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Rapport complet <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(v: number) => [formatFCFA(v), "CA"]}
                />
                <Area type="monotone" dataKey="ca" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top boutiques */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Top Boutiques
            </h3>
            <Link href="/rapports" className="text-xs font-bold text-primary hover:underline">
              Plus →
            </Link>
          </div>
          {topBoutiquesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Store className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-sm text-muted-foreground">Aucune livraison réussie</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topBoutiquesList.map(([nom, ca], i) => {
                const maxCA = topBoutiquesList[0]?.[1] ?? 1;
                const pct = Math.round((ca / maxCA) * 100);
                return (
                  <div key={nom}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">#{i + 1}</span> {nom}
                      </span>
                      <span className="font-bold text-emerald-600 ml-2 text-xs whitespace-nowrap">{formatFCFA(ca)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Livraisons récentes */}
      {livraisonsRecentes.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Activité récente
            </h3>
            <Link href="/livraisons" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Historique <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {livraisonsRecentes.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${l.statut === "livree" ? "bg-emerald-100 text-emerald-600" : l.statut === "echec" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
                  {l.statut === "livree" ? <CheckCircle2 className="w-4 h-4" /> : l.statut === "echec" ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{l.boutique?.nom ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-navy text-sm">{formatFCFA(l.montant)}</div>
                  <StatusBadge status={l.statut} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Planifier tournée", icon: Truck, href: "/tournees", color: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" },
          { label: "Ajouter boutique", icon: Store, href: "/boutiques", color: "bg-white border border-border text-slate-700 hover:border-primary/40 hover:bg-primary/5" },
          { label: "Voir rapports", icon: BarChart3, href: "/rapports", color: "bg-white border border-border text-slate-700 hover:border-primary/40 hover:bg-primary/5" },
          { label: "Gérer livreurs", icon: Users, href: "/chauffeurs", color: "bg-white border border-border text-slate-700 hover:border-primary/40 hover:bg-primary/5" },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${action.color}`}>
              <action.icon className="w-5 h-5" />
              <span className="text-center leading-tight text-xs">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
