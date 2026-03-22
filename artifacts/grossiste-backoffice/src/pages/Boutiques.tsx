import { useState } from "react";
import { useBoutiques, useBoutiqueMutations } from "@/hooks/use-boutiques";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Store, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/utils";
import type { Boutique } from "@workspace/api-client-react";

export default function Boutiques() {
  const { data: boutiques, isLoading } = useBoutiques();
  const { create, update, remove } = useBoutiqueMutations();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Boutique | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nom: fd.get("nom") as string,
      proprietaire: fd.get("proprietaire") as string,
      adresse: fd.get("adresse") as string,
      telephone: fd.get("telephone") as string,
      limiteCredit: Number(fd.get("limiteCredit")),
    };

    if (editingItem) {
      update.mutate(
        { boutiqueId: editingItem.id, data: { ...data, statut: fd.get("statut") as any } },
        { onSuccess: () => { setEditingItem(null); toast.success("Boutique modifiée"); } }
      );
    } else {
      create.mutate({ data }, { onSuccess: () => { setIsAddOpen(false); toast.success("Boutique ajoutée"); } });
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <Store className="w-16 h-16 text-slate-200 mb-4" />
      <h3 className="text-xl font-bold text-foreground">Aucune boutique</h3>
      <p className="text-muted-foreground mt-2">Vous n'avez pas encore de clients dans votre réseau.</p>
    </div>
  );

  return (
    <div>
      <PageHeader 
        title="Réseau de Boutiques" 
        description="Gérez vos clients détaillants et leurs encours de crédit B2B."
        action={
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> Ajouter une boutique
          </button>
        }
      />

      {isLoading ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 text-center text-muted-foreground animate-pulse">Chargement des boutiques...</div>
      ) : boutiques?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"><EmptyState /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Boutique & Propriétaire</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 w-64">Utilisation du Crédit (LiviKredit)</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {boutiques?.map(b => {
                    const percentage = Math.min(100, Math.max(0, (b.soldeCredit / (b.limiteCredit || 1)) * 100));
                    const isCritical = percentage > 85;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground text-base">{b.nom}</div>
                          <div className="text-muted-foreground mt-0.5">{b.proprietaire}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-foreground font-medium">{b.telephone}</div>
                          <div className="text-muted-foreground text-xs mt-0.5 truncate max-w-[200px]">{b.adresse}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className={isCritical ? "text-red-600" : "text-slate-600"}>{formatFCFA(b.soldeCredit)}</span>
                            <span className="text-slate-400">/ {formatFCFA(b.limiteCredit)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={b.statut} /></td>
                        <td className="px-6 py-4 flex items-center justify-end gap-2 h-full mt-2">
                          <button onClick={() => setEditingItem(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {boutiques?.map(b => {
              const percentage = Math.min(100, Math.max(0, (b.soldeCredit / (b.limiteCredit || 1)) * 100));
              const isCritical = percentage > 85;
              return (
                <div key={b.id} className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-foreground text-base">{b.nom}</div>
                      <div className="text-muted-foreground text-sm">{b.proprietaire}</div>
                    </div>
                    <StatusBadge status={b.statut} />
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {b.telephone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.adresse}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className={isCritical ? "text-red-600" : "text-slate-600"}>Crédit: {formatFCFA(b.soldeCredit)}</span>
                      <span className="text-slate-400">/ {formatFCFA(b.limiteCredit)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button onClick={() => setEditingItem(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression">
        <p className="text-muted-foreground mb-6">Êtes-vous sûr de vouloir retirer cette boutique de votre réseau ?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
          <button onClick={() => {
            remove.mutate({ boutiqueId: deleteId! }, { onSuccess: () => { setDeleteId(null); toast.success("Supprimé"); } });
          }} className="px-5 py-2.5 font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-colors">
            {remove.isPending ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isAddOpen || !!editingItem} onClose={() => { setIsAddOpen(false); setEditingItem(null); }} title={editingItem ? "Modifier la boutique" : "Nouvelle Boutique"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nom de l'enseigne</label>
            <input name="nom" defaultValue={editingItem?.nom} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Propriétaire / Gérant</label>
            <input name="proprietaire" defaultValue={editingItem?.proprietaire} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Téléphone</label>
            <input name="telephone" defaultValue={editingItem?.telephone} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Adresse complète</label>
            <input name="adresse" defaultValue={editingItem?.adresse} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Limite de Crédit (FCFA)</label>
            <input type="number" name="limiteCredit" defaultValue={editingItem?.limiteCredit} required min="0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          
          {editingItem && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Statut</label>
              <select name="statut" defaultValue={editingItem.statut} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium">
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={create.isPending || update.isPending} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
              {create.isPending || update.isPending ? "Enregistrement..." : (editingItem ? "Enregistrer les modifications" : "Créer la boutique")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
