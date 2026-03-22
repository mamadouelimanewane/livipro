import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/Badge";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { useListAllLivraisons } from "@workspace/api-client-react";
import { PackageCheck, Search, Download, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo } from "react";

function exportCSV(rows: any[]) {
  if (!rows.length) return;
  const headers = ["ID", "Date", "Grossiste", "Boutique", "Montant (FCFA)", "Paiement", "Statut"];
  const lines = rows.map(l => [
    `LIV-${String(l.id).padStart(5, "0")}`,
    formatDateTime(l.createdAt),
    l.grossisteNom,
    l.boutiqueNom,
    l.montantTotal,
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
  const { data: livraisons, isLoading } = useListAllLivraisons();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterPaiement, setFilterPaiement] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filterStatut || filterPaiement || filterDateFrom || filterDateTo;

  const filteredData = useMemo(() => {
    if (!livraisons) return [];
    return livraisons.filter(l => {
      const matchSearch = !search ||
        l.boutiqueNom.toLowerCase().includes(search.toLowerCase()) ||
        l.grossisteNom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !filterStatut || l.statut === filterStatut;
      const matchPaiement = !filterPaiement || l.methodePaiement === filterPaiement;
      const matchDateFrom = !filterDateFrom || new Date(l.createdAt) >= new Date(filterDateFrom);
      const matchDateTo = !filterDateTo || new Date(l.createdAt) <= new Date(filterDateTo + "T23:59:59");
      return matchSearch && matchStatut && matchPaiement && matchDateFrom && matchDateTo;
    });
  }, [livraisons, search, filterStatut, filterPaiement, filterDateFrom, filterDateTo]);

  const resetFilters = () => {
    setFilterStatut(""); setFilterPaiement(""); setFilterDateFrom(""); setFilterDateTo(""); setSearch("");
  };

  return (
    <Layout title="Historique des Livraisons">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher (boutique, grossiste)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-sm transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || hasActiveFilters ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-surface border-border text-slate-600 hover:border-primary/40"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres {hasActiveFilters ? `(actifs)` : ""}
          </button>
          <button
            onClick={() => exportCSV(filteredData)}
            disabled={!filteredData.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-sm font-semibold transition-all shadow-sm disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-slate-50 border border-border rounded-2xl p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Statut</label>
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
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Du</label>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:border-primary outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Au</label>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:border-primary outline-none" />
          </div>
          {hasActiveFilters && (
            <div className="col-span-2 md:col-span-4 flex justify-end">
              <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors">
                <X className="w-3.5 h-3.5" /> Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary bar */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
          <span><strong className="text-navy">{filteredData.length}</strong> livraison{filteredData.length > 1 ? "s" : ""} affichée{filteredData.length > 1 ? "s" : ""}</span>
          <span className="font-bold text-emerald-600">
            Total: {formatFCFA(filteredData.reduce((s, l) => s + (Number(l.montantTotal) || 0), 0))}
          </span>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-border text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID / Date</th>
                <th className="px-6 py-4">Grossiste</th>
                <th className="px-6 py-4">Boutique Cliente</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Chargement des livraisons...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Aucune livraison trouvée.</td></tr>
              ) : (
                filteredData.map(livraison => (
                  <tr key={livraison.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs w-max">
                          LIV-{livraison.id.toString().padStart(5, '0')}
                        </span>
                        <span className="text-xs text-slate-500">{formatDateTime(livraison.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="text-navy font-medium">{livraison.grossisteNom}</div></td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                        🏪 {livraison.boutiqueNom}
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-bold text-navy text-base">{formatFCFA(livraison.montantTotal)}</span></td>
                    <td className="px-6 py-4"><Badge variant={livraison.methodePaiement}>{livraison.methodePaiement}</Badge></td>
                    <td className="px-6 py-4"><Badge variant={livraison.statut}>{livraison.statut}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-surface rounded-2xl border border-border p-6 text-center text-slate-400">Chargement des livraisons...</div>
        ) : filteredData.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center flex flex-col items-center gap-3">
            <PackageCheck className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500">Aucune livraison trouvée.</p>
          </div>
        ) : (
          filteredData.map(livraison => (
            <div key={livraison.id} className="bg-surface rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">
                    LIV-{livraison.id.toString().padStart(5, '0')}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDateTime(livraison.createdAt)}</div>
                </div>
                <Badge variant={livraison.statut}>{livraison.statut}</Badge>
              </div>
              <div className="font-semibold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block text-sm mb-2">
                🏪 {livraison.boutiqueNom}
              </div>
              <div className="text-xs text-slate-500 mb-3">Via {livraison.grossisteNom}</div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <Badge variant={livraison.methodePaiement}>{livraison.methodePaiement}</Badge>
                <span className="font-bold text-navy text-base">{formatFCFA(livraison.montantTotal)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
