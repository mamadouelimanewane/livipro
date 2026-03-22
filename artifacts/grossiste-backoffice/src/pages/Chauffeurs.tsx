import { useState } from "react";
import { useChauffeurs, useChauffeurMutations } from "@/hooks/use-chauffeurs";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Users, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { Chauffeur } from "@workspace/api-client-react";

export default function Chauffeurs() {
  const { data: chauffeurs, isLoading } = useChauffeurs();
  const { create, update, remove } = useChauffeurMutations();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Chauffeur | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nom: fd.get("nom") as string,
      prenom: fd.get("prenom") as string,
      telephone: fd.get("telephone") as string,
      permis: fd.get("permis") as string,
    };

    if (editingItem) {
      update.mutate(
        { chauffeurId: editingItem.id, data: { ...data, statut: fd.get("statut") as any } },
        { onSuccess: () => { setEditingItem(null); toast.success("Chauffeur modifié"); } }
      );
    } else {
      create.mutate({ data }, { onSuccess: () => { setIsAddOpen(false); toast.success("Chauffeur ajouté"); } });
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <Users className="w-16 h-16 text-slate-200 mb-4" />
      <h3 className="text-xl font-bold text-foreground">Aucun chauffeur</h3>
      <p className="text-muted-foreground mt-2">Vous n'avez pas encore ajouté de chauffeur à votre flotte.</p>
    </div>
  );

  return (
    <div>
      <PageHeader 
        title="Flotte de Chauffeurs" 
        description="Gérez vos livreurs et suivez leur disponibilité."
        action={
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> Ajouter un chauffeur
          </button>
        }
      />

      {isLoading ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 text-center text-muted-foreground animate-pulse">Chargement des chauffeurs...</div>
      ) : chauffeurs?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"><EmptyState /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Nom complet</th>
                    <th className="px-6 py-4">Téléphone</th>
                    <th className="px-6 py-4">Permis</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chauffeurs?.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{c.prenom} {c.nom}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.telephone}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.permis}</td>
                      <td className="px-6 py-4"><StatusBadge status={c.statut} /></td>
                      <td className="px-6 py-4 flex items-center justify-end gap-2">
                        <button onClick={() => setEditingItem(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {chauffeurs?.map(c => (
              <div key={c.id} className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-bold text-foreground text-base">{c.prenom} {c.nom}</div>
                  <StatusBadge status={c.statut} />
                </div>
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.telephone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Permis: {c.permis}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => setEditingItem(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression">
        <p className="text-muted-foreground mb-6">Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible et supprimera également les tournées associées.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
          <button onClick={() => {
            remove.mutate({ chauffeurId: deleteId! }, { onSuccess: () => { setDeleteId(null); toast.success("Supprimé"); } });
          }} className="px-5 py-2.5 font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-colors">
            {remove.isPending ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={isAddOpen || !!editingItem} onClose={() => { setIsAddOpen(false); setEditingItem(null); }} title={editingItem ? "Modifier le chauffeur" : "Nouveau Chauffeur"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Prénom</label>
              <input name="prenom" defaultValue={editingItem?.prenom} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nom</label>
              <input name="nom" defaultValue={editingItem?.nom} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Téléphone</label>
            <input name="telephone" defaultValue={editingItem?.telephone} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Numéro de Permis</label>
            <input name="permis" defaultValue={editingItem?.permis} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          
          {editingItem && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Statut</label>
              <select name="statut" defaultValue={editingItem.statut} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium">
                <option value="disponible">Disponible</option>
                <option value="en_tournee">En Tournée</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={create.isPending || update.isPending} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
              {create.isPending || update.isPending ? "Enregistrement..." : (editingItem ? "Enregistrer les modifications" : "Créer le chauffeur")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
