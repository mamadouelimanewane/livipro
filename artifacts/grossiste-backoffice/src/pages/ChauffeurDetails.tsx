import { useParams, Link } from "wouter";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useChauffeurStats } from "@/hooks/use-chauffeur-stats";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Truck, Phone, CreditCard, CheckCircle2, XCircle, TrendingUp, MapPin, Trophy } from "lucide-react";
import { formatDate, formatFCFA } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ChauffeurDetails() {
  const params = useParams();
  const chauffeurId = Number(params.id);
  const { data: chauffeurs } = useChauffeurs();
  const { data: stats, isLoading } = useChauffeurStats(chauffeurId);

  const chauffeur = chauffeurs?.find(c => c.id === chauffeurId);

  if (isLoading || !chauffeur) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="h-28 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const chartData = (stats?.dernieresTournees ?? []).slice(0, 8).reverse().map((t, i) => ({
    name: formatDate(t.date).slice(0, 5),
    ca: t.ca,
    reussies: t.reussies,
    arrets: t.nombreArrets,
  }));

  return (
    <div>
      <Link href="/chauffeurs" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux chauffeurs
      </Link>

      {/* Chauffeur header */}
      <div className="bg-gradient-to-br from-navy to-slate-800 rounded-2xl p-6 mb-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-2xl font-bold">
              {chauffeur.prenom.charAt(0)}{chauffeur.nom.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{chauffeur.prenom} {chauffeur.nom}</h1>
              <div className="flex items-center gap-4 mt-1.5 text-slate-300 text-sm">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {chauffeur.telephone}</span>
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Permis {chauffeur.permis}</span>
              </div>
              <div className="mt-2"><StatusBadge status={chauffeur.statut} /></div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400 mb-1">CA {stats?.moisLabel}</div>
            <div className="text-2xl font-bold text-primary">{formatFCFA(stats?.caMois ?? 0)}</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tournées", value: stats?.totalTournees ?? 0, icon: Truck, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "CA Total", value: formatFCFA(stats?.totalCA ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Taux de Réussite", value: `${stats?.tauxReussite ?? 0}%`, icon: CheckCircle2, color: stats?.tauxReussite >= 80 ? "text-emerald-600" : "text-amber-600", bg: stats?.tauxReussite >= 80 ? "bg-emerald-50" : "bg-amber-50" },
          { label: "Meilleur Tour", value: formatFCFA(stats?.meilleurCA ?? 0), icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">{kpi.label}</p>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar taux réussite */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Performance globale</h3>
          <span className="text-sm font-bold text-primary">{stats?.tauxReussite ?? 0}% de réussite</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${(stats?.tauxReussite ?? 0) >= 80 ? "bg-emerald-500" : (stats?.tauxReussite ?? 0) >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
            style={{ width: `${stats?.tauxReussite ?? 0}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-600">{stats?.totalReussies ?? 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Livrées</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-500">{(stats?.totalArrets ?? 0) - (stats?.totalReussies ?? 0)}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Échecs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-700">{stats?.totalArrets ?? 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> Total arrêts</div>
          </div>
        </div>
      </div>

      {/* CA chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Évolution du CA (8 dernières tournées)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(v: number) => [formatFCFA(v), "CA Tournée"]}
                />
                <Bar dataKey="ca" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent tournées table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="font-bold text-foreground">Historique des Tournées</h3>
        </div>
        {(stats?.dernieresTournees ?? []).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucune tournée effectuée</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Arrêts</th>
                    <th className="px-5 py-3">Livrées</th>
                    <th className="px-5 py-3">CA</th>
                    <th className="px-5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.dernieresTournees.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium">{formatDate(t.date)}</td>
                      <td className="px-5 py-3 text-slate-600">{t.nombreArrets} boutiques</td>
                      <td className="px-5 py-3">
                        <span className={`font-bold ${t.reussies === t.nombreArrets ? "text-emerald-600" : "text-amber-600"}`}>
                          {t.reussies}/{t.nombreArrets}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-navy">{formatFCFA(t.ca)}</td>
                      <td className="px-5 py-3"><StatusBadge status={t.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-slate-100">
              {stats?.dernieresTournees.map(t => (
                <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{formatDate(t.date)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t.reussies}/{t.nombreArrets} livrées
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-navy text-sm">{formatFCFA(t.ca)}</div>
                    <StatusBadge status={t.statut} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
