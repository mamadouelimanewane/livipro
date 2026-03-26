import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/Badge";
import { formatFCFA, formatDate } from "@/lib/utils";
import { useListAllTournees } from "@workspace/api-client-react";
import { Map, MapPin, Search } from "lucide-react";
import { useState } from "react";

export default function Tournees() {
  const { data: tournees, isLoading } = useListAllTournees();
  const [search, setSearch] = useState("");

  const filteredData = tournees?.filter(t => 
    t.grossisteNom.toLowerCase().includes(search.toLowerCase()) || 
    t.chauffeurNom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Supervision des Tournées">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-slate-500 max-w-lg">
          Vue globale de toutes les tournées logistiques planifiées et en cours à travers le réseau LiviPro.
        </p>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher (grossiste, chauffeur)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
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
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Chargement des tournées...</td>
                </tr>
              ) : filteredData?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                    <Map className="w-12 h-12 mb-3 text-slate-300" />
                    Aucune tournée trouvée.
                  </td>
                </tr>
              ) : (
                filteredData?.map((tournee) => (
                  <tr key={tournee.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">TRN-{tournee.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-navy">
                      {formatDate(tournee.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy">{tournee.grossisteNom}</div>
                    </td>
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
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                        {formatFCFA(tournee.totalLivraisons)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={tournee.statut}>{tournee.statut}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
