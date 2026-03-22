import { useState, useMemo } from "react";
import { useLivraisons } from "@/hooks/use-livraisons";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Search, SlidersHorizontal, X, Download } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

function exportCSV(rows: any[]) {
  if (!rows.length) return;
  const headers = ["ID", "Date", "Tournée", "Boutique", "Montant (FCFA)", "Paiement", "État"];
  const lines = rows.map(l => [
    l.id,
    formatDate(l.createdAt),
    `TRN-${l.tourneeId}`,
    l.boutique?.nom ?? "—",
    l.montant,
    l.methodePaiement,
    l.statut,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `livraisons_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Livraisons() {
  const { data: livraisons, isLoading } = useLivraisons();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterPaiement, setFilterPaiement] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filterStatut || filterPaiement;

  const filteredData = useMemo(() => {
    if (!livraisons) return [];
    return livraisons.filter((l: any) => {
      const boutiqueNom = l.boutique?.nom ?? "";
      const matchSearch = !search || boutiqueNom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !filterStatut || l.statut === filterStatut;
      const matchPaiement = !filterPaiement || l.methodePaiement === filterPaiement;
      return matchSearch && matchStatut && matchPaiement;
    });
  }, [livraisons, search, filterStatut, filterPaiement]);

  const totalCA = useMemo(() => filteredData.reduce((s: number, l: any) => s + (Number(l.montant) || 0), 0), [filteredData]);

  return (
    <div>
      <PageHeader
        title="Journal des Livraisons"
        description="Historique complet des dépôts et encaissements réalisés."
      />

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par boutique..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || hasActiveFilters ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-border text-slate-600 hover:border-primary/40"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres {hasActiveFilters ? "(actifs)" : ""}
          </button>
          <button
            onClick={() => exportCSV(filteredData)}
            disabled={!filteredData.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-sm font-semibold transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-slate-50 border border-border rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">État</label>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:border-primary outline-none">
              <option value="">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="livree">Livrée</option>
              <option value="echec">Échec</option>
              <option value="litige">Litige</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Paiement</label>
            <select value={filterPaiement} onChange={e => setFilterPaiement(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:border-primary outline-none">
              <option value="">Tous</option>
              <option value="especes">Espèces</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="credit">Crédit</option>
            </select>
          </div>
          {hasActiveFilters && (
            <div className="col-span-1 sm:col-span-2 flex justify-end">
              <button onClick={() => { setFilterStatut(""); setFilterPaiement(""); }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors">
                <X className="w-3.5 h-3.5" /> Réinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between mb-4 text-sm">
          <span className="text-muted-foreground"><strong className="text-foreground">{filteredData.length}</strong> résultat{filteredData.length > 1 ? "s" : ""}</span>
          <span className="font-bold text-emerald-600">Total: {formatFCFA(totalCA)}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 text-center text-muted-foreground animate-pulse">Chargement de l'historique...</div>
      ) : filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-card border border-border/50 rounded-2xl p-16 text-center">
          <MapPin className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-foreground">Aucune livraison</h3>
          <p className="text-muted-foreground mt-2">Aucune entrée ne correspond à vos critères.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Date de saisie</th>
                    <th className="px-6 py-4">N° Tournée</th>
                    <th className="px-6 py-4">Boutique Livrée</th>
                    <th className="px-6 py-4">Facture (FCFA)</th>
                    <th className="px-6 py-4">Paiement</th>
                    <th className="px-6 py-4">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(l.createdAt)}</td>
                      <td className="px-6 py-4 font-bold text-slate-500">#TRN-{l.tourneeId}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{l.boutique?.nom ?? "—"}</td>
                      <td className="px-6 py-4 font-bold text-navy">{formatFCFA(l.montant)}</td>
                      <td className="px-6 py-4"><StatusBadge status={l.methodePaiement} /></td>
                      <td className="px-6 py-4"><StatusBadge status={l.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredData.map((l: any) => (
              <div key={l.id} className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-bold text-foreground">{l.boutique?.nom ?? "—"}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDate(l.createdAt)} · #TRN-{l.tourneeId}</div>
                  </div>
                  <StatusBadge status={l.statut} />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                  <StatusBadge status={l.methodePaiement} />
                  <span className="font-bold text-navy">{formatFCFA(l.montant)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
