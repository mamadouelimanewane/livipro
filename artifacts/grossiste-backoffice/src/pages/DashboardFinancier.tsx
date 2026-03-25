import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertTriangle, Download, FileText, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export default function DashboardFinancier() {
  const { grossisteId, authFetch } = useGrossiste();
  const [periode, setPeriode] = useState("30");

  const { data: stats } = useQuery({
    queryKey: ["stats", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/stats`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: commandes } = useQuery({
    queryKey: ["commandes", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/commandes`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: transactions } = useQuery({
    queryKey: ["wallet-stats", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/wallet/grossiste/${grossisteId}`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: factureStats } = useQuery({
    queryKey: ["facture-stats", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/factures/stats`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: factures } = useQuery({
    queryKey: ["factures", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/factures`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const commandesList: any[] = commandes || [];

  const caParMois = commandesList.reduce((acc: Record<string, number>, c: any) => {
    const mois = new Date(c.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    acc[mois] = (acc[mois] || 0) + parseFloat(c.montantTotal || "0");
    return acc;
  }, {});
  const caData = Object.entries(caParMois).slice(-6).map(([mois, ca]) => ({ mois, ca }));

  const statutData = [
    { name: "Livrées", value: commandesList.filter(c => c.statut === "livree").length },
    { name: "En attente", value: commandesList.filter(c => c.statut === "en_attente").length },
    { name: "Annulées", value: commandesList.filter(c => c.statut === "annulee").length },
    { name: "En prép.", value: commandesList.filter(c => c.statut === "en_preparation").length },
  ].filter(d => d.value > 0);

  const totalCA = commandesList.reduce((s, c) => s + parseFloat(c.montantTotal || "0"), 0);
  const caLivrees = commandesList.filter(c => c.statut === "livree").reduce((s, c) => s + parseFloat(c.montantTotal || "0"), 0);
  const panier = commandesList.length > 0 ? totalCA / commandesList.length : 0;

  const exportCSV = (type: string) => {
    window.open(`/api/grossistes/${grossisteId}/export/${type}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Financier"
        subtitle="Analyse complète de votre activité commerciale"
        icon={<DollarSign className="w-5 h-5" />}
      >
        <div className="flex items-center gap-2">
          <select
            value={periode}
            onChange={e => setPeriode(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
          </select>
          <button
            onClick={() => exportCSV("commandes")}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </PageHeader>

      {/* KPIs financiers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Chiffre d'affaires total", value: formatFCFA(totalCA), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%" },
          { label: "CA encaissé (livrées)", value: formatFCFA(caLivrees), icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", trend: "+8%" },
          { label: "Panier moyen", value: formatFCFA(panier), icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50", trend: "+3%" },
          { label: "Factures en retard", value: factureStats?.enRetard || 0, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", trend: factureStats?.enRetard > 0 ? "Urgent" : "OK" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.bg} ${kpi.color}`}>{kpi.trend}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Évolution du CA (6 derniers mois)</h3>
          {caData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={caData}>
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [formatFCFA(v), "CA"]} />
                <Bar dataKey="ca" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">Aucune donnée disponible</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Répartition des commandes</h3>
          {statutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statutData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">Aucune commande</div>
          )}
        </div>
      </div>

      {/* Factures récentes */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Factures récentes</h3>
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-600 font-bold">{formatFCFA(factureStats?.payees || 0)} payées</span>
            <span className="text-amber-600 font-bold">{formatFCFA(factureStats?.enAttente || 0)} en attente</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {(factures || []).slice(0, 5).map((f: any) => (
            <div key={f.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-slate-800 text-sm">{f.numero}</p>
                <p className="text-xs text-slate-500">{f.boutique?.nom || "Global"} — {f.periode}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{formatFCFA(parseFloat(f.montantTTC || "0"))}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  f.statut === "payee" ? "bg-emerald-100 text-emerald-700" :
                  f.statut === "en_retard" ? "bg-rose-100 text-rose-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{f.statut}</span>
              </div>
            </div>
          ))}
          {(!factures || factures.length === 0) && (
            <div className="py-10 text-center text-slate-400 text-sm">Aucune facture générée</div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Export Commandes CSV", type: "commandes", icon: ShoppingCartIcon },
          { label: "Export Livraisons CSV", type: "livraisons", icon: TruckIcon },
          { label: "Export Transactions CSV", type: "transactions", icon: CreditCard },
        ].map((exp, i) => (
          <button
            key={i}
            onClick={() => exportCSV(exp.type)}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-primary hover:shadow-sm transition group"
          >
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary">{exp.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
}
function TruckIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
