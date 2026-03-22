import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/Badge";
import { formatFCFA, formatDate } from "@/lib/utils";
import { useListAllTournees, useListGrossistes } from "@workspace/api-client-react";
import { Map, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo } from "react";

export default function Tournees() {
  const { data: tournees, isLoading } = useListAllTournees();
  const { data: grossistes } = useListGrossistes();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterGrossiste, setFilterGrossiste] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filterStatut || filterGrossiste;

  const filteredData = useMemo(() => {
    if (!tournees) return [];
    return tournees.filter(t => {
      const matchSearch = !search ||
        t.grossisteNom.toLowerCase().includes(search.toLowerCase()) ||
        t.chauffeurNom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !filterStatut || t.statut === filterStatut;
      const matchGrossiste = !filterGrossiste || t.grossisteNom === filterGrossiste;
      return matchSearch && matchStatut && matchGrossiste;
    });
  }, [tournees, search, filterStatut, filterGrossiste]);

  const grossisteNames = useMemo(() => {
    return [...new Set(tournees?.map(t => t.grossisteNom) ?? [])];
  }, [tournees]);

  const stats = useMemo(() => ({
    total: filteredData.length,
    enCours: filteredData.filter(t => t.statut === "en_cours").length,
    terminees: filteredData.filter(t => t.statut === "terminee").length,
    ca: filteredData.reduce((s, t) => s + (Number(t.totalLivraisons) || 0), 0),
  }), [filteredData]);

  return (
    <Layout title="Supervision des Tournées">
      <p className="text-slate-500 max-w-lg mb-6">
        Vue globale de toutes les tournées logistiques planifiées et en cours à travers le réseau LiviPro.
      </p>

      {/* Summary KPIs */}
      {!isLoading && tournees && tournees.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-navy" },
            { label: "En cours", value: stats.enCours, color: "text-orange-600" },
            { label: "Terminées", value: stats.terminees, color: "text-emerald-600" },
            { label: "CA Total", value: formatFCFA(stats.ca), color: "text-indigo-600" },
          ].map((s, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold font-display ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher (grossiste, chauffeur)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-sm transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || hasActiveFilters ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-surface border-border text-slate-600 hover:border-primary/40"}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres {hasActiveFilters ? "(actifs)" : ""}
        </button>
      </div>

      {showFilters && (
        <div className="bg-slate-50 border border-border rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Statut</label>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:border-primary outline-none">
              <option value="">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Grossiste</label>
            <select value={filterGrossiste} onChange={e => setFilterGrossiste(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white focus:border-primary outline-none">
              <option value="">Tous les grossistes</option>
              {grossisteNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {hasActiveFilters && (
            <div className="col-span-1 sm:col-span-2 flex justify-end">
              <button onClick={() => { setFilterStatut(""); setFilterGrossiste(""); }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors">
                <X className="w-3.5 h-3.5" /> Réinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-border text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID Tournée</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Grossiste</th>
                <th className="px-6 py-4">Chauffeur</th>
                <th className="px-6 py-4 text-center">Arrêts</th>
                <th className="px-6 py-4 text-right">Total Livraisons</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Chargement des tournées...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Aucune tournée trouvée.</td></tr>
              ) : (
                filteredData.map(tournee => (
                  <tr key={tournee.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">TRN-{tournee.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-navy">{formatDate(tournee.date)}</td>
                    <td className="px-6 py-4"><div className="font-semibold text-navy">{tournee.grossisteNom}</div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {tournee.chauffeurNom.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{tournee.chauffeurNom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {tournee.nombreArrets}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">{formatFCFA(tournee.totalLivraisons)}</span>
                    </td>
                    <td className="px-6 py-4"><Badge variant={tournee.statut}>{tournee.statut}</Badge></td>
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
          <div className="bg-surface rounded-2xl border border-border p-6 text-center text-slate-400">Chargement des tournées...</div>
        ) : filteredData.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center flex flex-col items-center gap-3">
            <Map className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500">Aucune tournée trouvée.</p>
          </div>
        ) : (
          filteredData.map(tournee => (
            <div key={tournee.id} className="bg-surface rounded-2xl border border-border shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">TRN-{tournee.id.toString().padStart(4, '0')}</span>
                  <div className="font-semibold text-navy mt-1">{tournee.grossisteNom}</div>
                  <div className="text-xs text-slate-500">{formatDate(tournee.date)}</div>
                </div>
                <Badge variant={tournee.statut}>{tournee.statut}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{tournee.chauffeurNom.charAt(0)}</div>
                <span className="text-sm font-medium text-slate-700">{tournee.chauffeurNom}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {tournee.nombreArrets} arrêts
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm">{formatFCFA(tournee.totalLivraisons)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
