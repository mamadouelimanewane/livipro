import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/Badge";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { useListAllLivraisons } from "@workspace/api-client-react";
import { PackageCheck, Search } from "lucide-react";
import { useState } from "react";

export default function Livraisons() {
  const { data: livraisons, isLoading } = useListAllLivraisons();
  const [search, setSearch] = useState("");

  const filteredData = livraisons?.filter(l => 
    l.boutiqueNom.toLowerCase().includes(search.toLowerCase()) || 
    l.grossisteNom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Historique des Livraisons">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-slate-500 max-w-lg">
          Registre global de toutes les livraisons effectuées aux boutiques par les différents grossistes.
        </p>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher (boutique, grossiste)..." 
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
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Chargement des livraisons...</td>
                </tr>
              ) : filteredData?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                    <PackageCheck className="w-12 h-12 mb-3 text-slate-300" />
                    Aucune livraison trouvée.
                  </td>
                </tr>
              ) : (
                filteredData?.map((livraison) => (
                  <tr key={livraison.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs w-max">
                          LIV-{livraison.id.toString().padStart(5, '0')}
                        </span>
                        <span className="text-xs text-slate-500">{formatDateTime(livraison.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-navy font-medium">{livraison.grossisteNom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                        🏪 {livraison.boutiqueNom}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-navy text-base">
                        {formatFCFA(livraison.montantTotal)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={livraison.methodePaiement}>{livraison.methodePaiement}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={livraison.statut}>{livraison.statut}</Badge>
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
