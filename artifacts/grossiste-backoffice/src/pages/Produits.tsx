import { useState } from "react";
import { useProduits, useProduitMutations } from "@/hooks/use-produits";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/utils";
import type { Produit } from "@workspace/api-client-react";

export default function Produits() {
  const { data: produits, isLoading } = useProduits();
  const { create, update, remove } = useProduitMutations();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produit | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nom: fd.get("nom") as string,
      categorie: fd.get("categorie") as string,
      prixUnitaire: Number(fd.get("prixUnitaire")),
      unite: fd.get("unite") as string,
      stockDisponible: Number(fd.get("stockDisponible")),
    };

    if (editingItem) {
      update.mutate(
        { produitId: editingItem.id, data },
        { onSuccess: () => { setEditingItem(null); toast.success("Produit modifié"); } }
      );
    } else {
      create.mutate({ data }, { onSuccess: () => { setIsAddOpen(false); toast.success("Produit ajouté"); } });
    }
  };

  return (
    <div>
      <PageHeader 
        title="Catalogue Produits" 
        description="Gérez votre inventaire et ajustez vos prix de gros."
        action={
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> Nouveau Produit
          </button>
        }
      />

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de l'inventaire...</div>
        ) : produits?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Package className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-foreground">Aucun produit</h3>
            <p className="text-muted-foreground mt-2">Votre catalogue est actuellement vide.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Produit & Catégorie</th>
                  <th className="px-6 py-4">Prix Unitaire</th>
                  <th className="px-6 py-4">Unité de Vente</th>
                  <th className="px-6 py-4">Stock Disponible</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produits?.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{p.nom}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{p.categorie}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-navy">{formatFCFA(p.prixUnitaire)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.unite}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${p.stockDisponible < 10 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {p.stockDisponible} en stock
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2 mt-1">
                      <button onClick={() => setEditingItem(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmer la suppression">
        <p className="text-muted-foreground mb-6">Êtes-vous sûr de vouloir retirer ce produit du catalogue ?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
          <button onClick={() => {
            remove.mutate({ produitId: deleteId! }, { onSuccess: () => { setDeleteId(null); toast.success("Supprimé"); } });
          }} className="px-5 py-2.5 font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-colors">
            {remove.isPending ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={isAddOpen || !!editingItem} onClose={() => { setIsAddOpen(false); setEditingItem(null); }} title={editingItem ? "Modifier le produit" : "Nouveau Produit"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Produit</label>
            <input name="nom" defaultValue={editingItem?.nom} required placeholder="Ex: Lait Nido" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Catégorie</label>
            <input name="categorie" defaultValue={editingItem?.categorie} required placeholder="Ex: Agroalimentaire" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Prix Unitaire (FCFA)</label>
              <input type="number" name="prixUnitaire" defaultValue={editingItem?.prixUnitaire} required min="0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Unité de Vente</label>
              <input name="unite" defaultValue={editingItem?.unite} required placeholder="Ex: Carton de 12" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Stock Disponible</label>
            <input type="number" name="stockDisponible" defaultValue={editingItem?.stockDisponible} required min="0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={create.isPending || update.isPending} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
              {create.isPending || update.isPending ? "Enregistrement..." : (editingItem ? "Enregistrer les modifications" : "Ajouter au catalogue")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
