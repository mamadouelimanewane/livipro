import { useState } from "react";
import { Link } from "wouter";
import { useTournees, useTourneeMutations } from "@/hooks/use-tournees";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useBoutiques } from "@/hooks/use-boutiques";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { Plus, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatFCFA } from "@/lib/utils";

export default function Tournees() {
  const { data: tournees, isLoading } = useTournees();
  const { create } = useTourneeMutations();
  const { data: chauffeurs } = useChauffeurs();
  const { data: boutiques } = useBoutiques();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const boutiqueIds = fd.getAll("boutiqueIds").map(id => Number(id));
    
    if (boutiqueIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une boutique");
      return;
    }

    create.mutate({
      data: {
        chauffeurId: Number(fd.get("chauffeurId")),
        date: fd.get("date") as string,
        boutiqueIds,
      }
    }, { 
      onSuccess: () => { setIsAddOpen(false); toast.success("Tournée planifiée avec succès"); } 
    });
  };

  return (
    <div>
      <PageHeader 
        title="Gestion des Tournées" 
        description="Planifiez et suivez les parcours de vos livreurs en direct."
        action={
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> Planifier une tournée
          </button>
        }
      />

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement des tournées...</div>
        ) : tournees?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Truck className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-foreground">Aucune tournée</h3>
            <p className="text-muted-foreground mt-2">Planifiez votre première tournée pour commencer à livrer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">ID & Date</th>
                  <th className="px-6 py-4">Chauffeur assigné</th>
                  <th className="px-6 py-4">Arrêts</th>
                  <th className="px-6 py-4">Valeur Transportée</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tournees?.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">#TRN-{t.id}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{formatDate(t.date)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{t.chauffeurNom}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg">{t.nombreArrets} boutiques</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-navy">{formatFCFA(t.totalLivraisons)}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.statut} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/tournees/${t.id}`} className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Créer un Manifeste de Tournée">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Chauffeur</label>
              <select name="chauffeurId" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium">
                <option value="">Sélectionner</option>
                {chauffeurs?.filter(c => c.statut === "disponible").map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Date Prévue</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Sélectionner les arrêts (Boutiques)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {boutiques?.map(b => (
                <label key={b.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-colors">
                  <input type="checkbox" name="boutiqueIds" value={b.id} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary accent-primary" />
                  <div>
                    <div className="text-sm font-bold text-foreground">{b.nom}</div>
                    <div className="text-xs text-muted-foreground truncate w-32">{b.adresse}</div>
                  </div>
                </label>
              ))}
              {boutiques?.length === 0 && <p className="text-sm text-slate-500 col-span-2">Aucune boutique disponible.</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={create.isPending} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
              {create.isPending ? "Génération du manifeste..." : "Valider et Planifier"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
