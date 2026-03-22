import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA, formatDate } from "@/lib/utils";
import {
  FileText, Truck, CheckCircle2, AlertTriangle, Clock, XCircle,
  Download, RefreshCw, ArrowUpDown, Eye, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  rapproche:     { label: "Rapproché",      color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", icon: CheckCircle2 },
  ecart:         { label: "Écart détecté",  color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",   icon: AlertTriangle },
  en_cours:      { label: "En cours",       color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200",    icon: Clock },
  non_rapproche: { label: "Non rapproché",  color: "text-rose-700",    bg: "bg-rose-50",     border: "border-rose-200",    icon: XCircle },
  annulee:       { label: "Annulée",        color: "text-slate-500",   bg: "bg-slate-50",    border: "border-slate-200",   icon: XCircle },
};

const FILTERS = [
  { id: "all",           label: "Toutes" },
  { id: "rapproche",     label: "Rapprochés" },
  { id: "ecart",         label: "Écarts" },
  { id: "non_rapproche", label: "Non rapprochés" },
  { id: "en_cours",      label: "En cours" },
];

function KpiCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 items-start shadow-sm">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Rapprochement() {
  const { grossisteId } = useGrossiste();
  const [filter, setFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("dateBc");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["rapprochement", grossisteId],
    queryFn: () => fetch(`/api/grossistes/${grossisteId}/rapprochement`).then(r => r.json()),
    enabled: !!grossisteId,
    refetchInterval: 60000,
  });

  const { data: bls } = useQuery({
    queryKey: ["bons-livraison", grossisteId],
    queryFn: () => fetch(`/api/grossistes/${grossisteId}/bons-livraison`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const rows: any[] = data?.rows ?? [];
  const totaux = data?.totaux ?? {};

  const filtered = rows.filter(r => filter === "all" || r.statut === filter);

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] ?? "";
    const bv = b[sortField] ?? "";
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const headers = ["N° BC", "Boutique", "Date BC", "Montant BC", "N° BL", "Date BL", "Montant BL", "Écart", "Méthode Paiement", "Statut"];
    const csvRows = sorted.map(r => [
      r.numeroBc, r.boutiqueNom,
      r.dateBc ? new Date(r.dateBc).toLocaleDateString("fr-FR") : "",
      r.montantBc,
      r.numeroBl ?? "",
      r.dateBl ? new Date(r.dateBl).toLocaleDateString("fr-FR") : "",
      r.montantBl,
      r.ecart,
      r.methodePaiement ?? "",
      STATUT_CONFIG[r.statut]?.label ?? r.statut,
    ]);
    const csv = [headers, ...csvRows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rapprochement-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <ArrowUpDown className={cn("w-3.5 h-3.5 ml-1 inline", sortField === field ? "text-primary" : "text-slate-400")} />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapprochement BC / BL"
        description="Réconciliation des bons de commande boutiques avec les bons de livraison chauffeurs."
        actions={
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={FileText}     label="Bons de commande"  value={totaux.totalBc ?? 0}      sub={`${formatFCFA(totaux.montantTotalBc ?? 0)}`}     color="bg-blue-100 text-blue-600" />
        <KpiCard icon={Truck}        label="Bons de livraison" value={totaux.totalBl ?? 0}      sub={`${formatFCFA(totaux.montantTotalBl ?? 0)}`}     color="bg-violet-100 text-violet-600" />
        <KpiCard icon={CheckCircle2} label="Rapprochés"        value={totaux.rapproches ?? 0}   sub={totaux.totalBc ? `${Math.round((totaux.rapproches / totaux.totalBc) * 100)}%` : "—"} color="bg-emerald-100 text-emerald-600" />
        <KpiCard icon={AlertTriangle} label="Écarts / Alertes" value={(totaux.ecarts ?? 0) + (totaux.nonRapproches ?? 0)} sub={`${totaux.ecarts ?? 0} écarts · ${totaux.nonRapproches ?? 0} manquants`} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Tabs filtre */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cn("px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border",
              filter === f.id ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-primary/30")}>
            {f.label}
            {f.id !== "all" && <span className="ml-1.5 text-xs opacity-70">({rows.filter(r => r.statut === f.id).length})</span>}
          </button>
        ))}
      </div>

      {/* Tableau desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Chargement...
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">Aucune donnée de rapprochement</p>
            <p className="text-sm mt-1">Les bons de commande et de livraison apparaîtront ici.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {[
                  { label: "N° BC", field: "numeroBc" },
                  { label: "Boutique", field: "boutiqueNom" },
                  { label: "Date BC", field: "dateBc" },
                  { label: "Montant BC", field: "montantBc" },
                  { label: "N° BL", field: "numeroBl" },
                  { label: "Montant BL", field: "montantBl" },
                  { label: "Écart", field: "ecart" },
                  { label: "Paiement", field: "methodePaiement" },
                  { label: "Statut", field: "statut" },
                ].map(col => (
                  <th key={col.field}
                    className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => toggleSort(col.field)}>
                    {col.label}<SortIcon field={col.field} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((row) => {
                const cfg = STATUT_CONFIG[row.statut];
                const Icon = cfg?.icon ?? Clock;
                return (
                  <tr key={row.commandeId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded-lg">{row.numeroBc}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{row.boutiqueNom}</p>
                      <p className="text-xs text-slate-400">{row.nbItems} article(s)</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {row.dateBc ? new Date(row.dateBc).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatFCFA(row.montantBc)}</td>
                    <td className="px-4 py-3">
                      {row.numeroBl ? (
                        <span className="font-mono font-bold text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-lg">{row.numeroBl}</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {row.montantBl > 0 ? formatFCFA(row.montantBl) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {row.ecart !== 0 && row.numeroBl ? (
                        <span className={cn("font-bold text-sm", row.ecart > 0 ? "text-emerald-600" : "text-rose-600")}>
                          {row.ecart > 0 ? "+" : ""}{formatFCFA(Math.abs(row.ecart))}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {row.methodePaiement ? (
                        <span className="text-xs font-medium capitalize text-slate-600">
                          {row.methodePaiement === "mobile_money" ? "📱 Mobile" : row.methodePaiement === "especes" ? "💵 Espèces" : "💳 Crédit"}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border", cfg?.bg, cfg?.color, cfg?.border)}>
                        <Icon className="w-3 h-3" />{cfg?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Chargement...
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">Aucun rapprochement</p>
          </div>
        ) : sorted.map((row) => {
          const cfg = STATUT_CONFIG[row.statut];
          const Icon = cfg?.icon ?? Clock;
          const isOpen = expanded === row.commandeId;
          return (
            <div key={row.commandeId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button className="w-full p-4 text-left" onClick={() => setExpanded(isOpen ? null : row.commandeId)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{row.numeroBc}</span>
                      {row.numeroBl && <span className="font-mono text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">{row.numeroBl}</span>}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{row.boutiqueNom}</p>
                    <p className="text-xs text-slate-400">{new Date(row.dateBc).toLocaleDateString("fr-FR")} · {row.nbItems} article(s)</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border", cfg?.bg, cfg?.color, cfg?.border)}>
                      <Icon className="w-3 h-3" />{cfg?.label}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1 ml-auto" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1 ml-auto" />}
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-600 font-semibold mb-1">BON DE COMMANDE</p>
                      <p className="font-bold text-slate-800">{formatFCFA(row.montantBc)}</p>
                      <p className="text-xs text-slate-500">{new Date(row.dateBc).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className={cn("rounded-xl p-3", row.numeroBl ? "bg-violet-50" : "bg-slate-50")}>
                      <p className={cn("text-xs font-semibold mb-1", row.numeroBl ? "text-violet-600" : "text-slate-400")}>BON DE LIVRAISON</p>
                      {row.numeroBl ? <>
                        <p className="font-bold text-slate-800">{formatFCFA(row.montantBl)}</p>
                        <p className="text-xs text-slate-500">{new Date(row.dateBl).toLocaleDateString("fr-FR")}</p>
                      </> : <p className="text-slate-400 text-sm font-medium">Non encore livré</p>}
                    </div>
                  </div>
                  {row.ecart !== 0 && row.numeroBl && (
                    <div className={cn("rounded-xl px-4 py-2.5 text-sm font-semibold flex justify-between", row.ecart > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                      <span>Écart de rapprochement</span>
                      <span>{row.ecart > 0 ? "+" : ""}{formatFCFA(Math.abs(row.ecart))}</span>
                    </div>
                  )}
                  {row.methodePaiement && (
                    <p className="text-xs text-slate-500 text-center">
                      Paiement : {row.methodePaiement === "mobile_money" ? "📱 Mobile Money" : row.methodePaiement === "especes" ? "💵 Espèces" : "💳 Crédit"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bons de Livraison section */}
      {(bls ?? []).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-violet-600" /> Bons de Livraison émis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(bls ?? []).slice(0, 6).map((bl: any) => (
              <div key={bl.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono font-bold text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-lg">{bl.numeroBl}</span>
                    <p className="font-semibold text-slate-800 mt-2">{bl.boutique?.nom ?? "—"}</p>
                    <p className="text-xs text-slate-400">{bl.boutique?.adresse}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Livrée
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Montant</p>
                    <p className="font-bold text-slate-800">{formatFCFA(Number(bl.montantTotal) || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Date livraison</p>
                    <p className="text-sm font-medium text-slate-700">{bl.createdAt ? new Date(bl.createdAt).toLocaleDateString("fr-FR") : "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Paiement</p>
                    <p className="text-sm font-medium text-slate-700 capitalize">
                      {bl.methodePaiement === "mobile_money" ? "📱 Mobile" : bl.methodePaiement === "especes" ? "💵 Cash" : "💳 Crédit"}
                    </p>
                  </div>
                </div>
                {bl.preuves?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400">{bl.preuves.length} preuve(s) de livraison disponible(s)</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
