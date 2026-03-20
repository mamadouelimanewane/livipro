import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { 
  useListGrossistes, 
  useCreateGrossiste, 
  useUpdateGrossiste, 
  useDeleteGrossiste,
} from "@workspace/api-client-react";
import type { Grossiste } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Grossistes() {
  const { data: grossistes, isLoading } = useListGrossistes();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGrossiste, setEditingGrossiste] = useState<Grossiste | null>(null);

  const createMutation = useCreateGrossiste({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/grossistes"] });
        setIsCreateModalOpen(false);
        toast({ title: "Succès", description: "Grossiste créé avec succès." });
      },
      onError: () => toast({ title: "Erreur", description: "Échec de la création.", variant: "destructive" })
    }
  });

  const updateMutation = useUpdateGrossiste({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/grossistes"] });
        setEditingGrossiste(null);
        toast({ title: "Succès", description: "Grossiste mis à jour avec succès." });
      },
      onError: () => toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" })
    }
  });

  const deleteMutation = useDeleteGrossiste({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/grossistes"] });
        toast({ title: "Succès", description: "Grossiste supprimé." });
      },
      onError: () => toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" })
    }
  });

  const filteredData = grossistes?.filter(g => 
    g.nom.toLowerCase().includes(search.toLowerCase()) || 
    g.ville.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Gestion des Grossistes">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un grossiste, une ville..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-5 h-5" /> Ajouter un Grossiste
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-border text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nom du Grossiste</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Inscrit le</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Chargement des grossistes...</td>
                </tr>
              ) : filteredData?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                    <Building2 className="w-12 h-12 mb-3 text-slate-300" />
                    Aucun grossiste trouvé.
                  </td>
                </tr>
              ) : (
                filteredData?.map((grossiste) => (
                  <tr key={grossiste.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="font-bold text-navy text-base">{grossiste.nom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3 h-3" /> {grossiste.telephone}</div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs"><Mail className="w-3 h-3" /> {grossiste.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium text-navy"><MapPin className="w-3 h-3 text-primary" /> {grossiste.ville}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[200px]" title={grossiste.adresse}>{grossiste.adresse}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={grossiste.statut}>{grossiste.statut}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(grossiste.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingGrossiste(grossiste)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm("Êtes-vous sûr de vouloir supprimer ce grossiste ?")) {
                              deleteMutation.mutate({ id: grossiste.id });
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Nouveau Grossiste"
      >
        <GrossisteForm 
          onSubmit={(data) => createMutation.mutate({ data })}
          isPending={createMutation.isPending}
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal 
        isOpen={!!editingGrossiste} 
        onClose={() => setEditingGrossiste(null)} 
        title="Modifier Grossiste"
      >
        {editingGrossiste && (
          <GrossisteForm 
            initialData={editingGrossiste}
            isEdit
            onSubmit={(data) => updateMutation.mutate({ id: editingGrossiste.id, data })}
            isPending={updateMutation.isPending}
          />
        )}
      </Modal>
    </Layout>
  );
}

// Simple uncontrolled form component for Grossiste
function GrossisteForm({ initialData, onSubmit, isPending, isEdit = false }: any) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-navy">Nom de l'entreprise *</label>
        <input required name="nom" defaultValue={initialData?.nom} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ex: SN Distribution" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-navy">Téléphone *</label>
          <input required name="telephone" defaultValue={initialData?.telephone} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="+221 77 000 00 00" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-navy">Email *</label>
          <input required type="email" name="email" defaultValue={initialData?.email} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="contact@sndist.com" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-1">
          <label className="text-sm font-semibold text-navy">Ville *</label>
          <input required name="ville" defaultValue={initialData?.ville} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Dakar" />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-semibold text-navy">Adresse *</label>
          <input required name="adresse" defaultValue={initialData?.adresse} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Zone Industrielle..." />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-1">
          <label className="text-sm font-semibold text-navy">Statut</label>
          <select name="statut" defaultValue={initialData?.statut} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white">
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>
      )}

      <div className="pt-4 border-t border-border mt-6">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
        >
          {isPending ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le grossiste"}
        </button>
      </div>
    </form>
  );
}
