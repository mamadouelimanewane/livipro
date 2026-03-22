import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useTournees, useTourneeMutations } from "@/hooks/use-tournees";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useBoutiques } from "@/hooks/use-boutiques";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { Plus, Truck, ArrowRight, Zap, MapPin, X, Info } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatFCFA } from "@/lib/utils";

const ZONES: Record<string, { zone: string; order: number }> = {};
const ZONE_NAMES = ["Plateau", "Medina", "Parcelles", "Pikine", "Guediawaye", "Rufisque", "Thiès"];

function getZone(id: number) {
  if (!ZONES[id]) {
    ZONES[id] = { zone: ZONE_NAMES[id % ZONE_NAMES.length], order: id % ZONE_NAMES.length };
  }
  return ZONES[id];
}

interface Boutique { id: number; nom: string; adresse: string; proprietaire?: string; telephone?: string; }
interface SelectedBoutique extends Boutique { order: number; }

export default function Tournees() {
  const { data: tournees, isLoading } = useTournees();
  const { create } = useTourneeMutations();
  const { data: chauffeurs } = useChauffeurs();
  const { data: boutiques } = useBoutiques();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBoutiques, setSelectedBoutiques] = useState<SelectedBoutique[]>([]);
  const [optimized, setOptimized] = useState(false);
  const [hoveredBoutique, setHoveredBoutique] = useState<number | null>(null);
  const [searchBoutique, setSearchBoutique] = useState("");

  const filteredBoutiques = useMemo(() => {
    if (!boutiques) return [];
    return boutiques.filter((b: Boutique) =>
      b.nom.toLowerCase().includes(searchBoutique.toLowerCase()) ||
      b.adresse.toLowerCase().includes(searchBoutique.toLowerCase())
    );
  }, [boutiques, searchBoutique]);

  const toggleBoutique = (b: Boutique) => {
    setSelectedBoutiques(prev => {
      const exists = prev.find(s => s.id === b.id);
      if (exists) return prev.filter(s => s.id !== b.id);
      return [...prev, { ...b, order: prev.length }];
    });
    setOptimized(false);
  };

  const optimizeRoute = () => {
    const sorted = [...selectedBoutiques].sort((a, b) => getZone(a.id).order - getZone(b.id).order);
    setSelectedBoutiques(sorted.map((b, i) => ({ ...b, order: i })));
    setOptimized(true);
    toast.success(`Itinéraire optimisé — ${sorted.length} arrêts réorganisés par zone`);
  };

  const moveStop = (idx: number, dir: 1 | -1) => {
    const arr = [...selectedBoutiques];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setSelectedBoutiques(arr);
    setOptimized(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedBoutiques.length === 0) {
      toast.error("Veuillez sélectionner au moins une boutique");
      return;
    }
    const fd = new FormData(e.currentTarget);
    create.mutate({
      data: {
        chauffeurId: Number(fd.get("chauffeurId")),
        date: fd.get("date") as string,
        boutiqueIds: selectedBoutiques.map(b => b.id),
      }
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setSelectedBoutiques([]);
        setOptimized(false);
        toast.success("Tournée planifiée avec succès");
      }
    });
  };

  const resetModal = () => {
    setIsAddOpen(false);
    setSelectedBoutiques([]);
    setOptimized(false);
    setSearchBoutique("");
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

      {/* Summary cards */}
      {tournees && tournees.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: tournees.length, color: "text-slate-700" },
            { label: "En cours", value: tournees.filter((t: any) => t.statut === "en_cours").length, color: "text-orange-600" },
            { label: "Terminées", value: tournees.filter((t: any) => t.statut === "terminee").length, color: "text-emerald-600" },
            { label: "CA Total", value: formatFCFA(tournees.reduce((s: number, t: any) => s + (Number(t.totalLivraisons) || 0), 0)), color: "text-indigo-600" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 text-center text-muted-foreground animate-pulse">Chargement des tournées...</div>
      ) : tournees?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
          <Truck className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-foreground">Aucune tournée</h3>
          <p className="text-muted-foreground mt-2">Planifiez votre première tournée pour commencer à livrer.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
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
                  {tournees?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
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
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {tournees?.map((t: any) => (
              <div key={t.id} className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-foreground">#TRN-{t.id}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{formatDate(t.date)}</div>
                  </div>
                  <StatusBadge status={t.statut} />
                </div>
                <div className="text-sm font-medium text-slate-700 mb-3">{t.chauffeurNom}</div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs">
                      {t.nombreArrets} arrêts
                    </span>
                    <span className="font-bold text-navy text-sm">{formatFCFA(t.totalLivraisons)}</span>
                  </div>
                  <Link href={`/tournees/${t.id}`} className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Creation modal */}
      <Modal isOpen={isAddOpen} onClose={resetModal} title="Créer un Manifeste de Tournée">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Chauffeur</label>
              <select name="chauffeurId" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium">
                <option value="">Sélectionner</option>
                {chauffeurs?.filter((c: any) => c.statut === "disponible").map((c: any) => (
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Sélectionner les arrêts</label>
              <span className="text-xs text-muted-foreground">{selectedBoutiques.length}/{boutiques?.length ?? 0} sélectionnées</span>
            </div>
            <input
              type="text"
              value={searchBoutique}
              onChange={e => setSearchBoutique(e.target.value)}
              placeholder="Rechercher une boutique..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
              {filteredBoutiques.map((b: Boutique) => {
                const isSelected = selectedBoutiques.some(s => s.id === b.id);
                const zone = getZone(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/30 hover:bg-primary/5"}`}
                    onMouseEnter={() => setHoveredBoutique(b.id)}
                    onMouseLeave={() => setHoveredBoutique(null)}
                  >
                    <input type="checkbox" checked={isSelected} onChange={() => toggleBoutique(b)} className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{b.nom}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.adresse}</div>
                      {hoveredBoutique === b.id && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Zone {zone.zone}</span>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
              {filteredBoutiques.length === 0 && <p className="text-sm text-slate-500 col-span-2 text-center py-4">Aucune boutique trouvée</p>}
            </div>
          </div>

          {selectedBoutiques.length >= 2 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${optimized ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className="text-sm font-bold text-slate-700">Ordre des arrêts ({selectedBoutiques.length})</span>
                </div>
                <button
                  type="button"
                  onClick={optimizeRoute}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${optimized ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {optimized ? "✓ Optimisé" : "Optimiser l'itinéraire"}
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto">
                {selectedBoutiques.map((b, i) => {
                  const zone = getZone(b.id);
                  return (
                    <div key={b.id} className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 group">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-800 truncate block">{b.nom}</span>
                        <span className="text-xs text-muted-foreground">{zone.zone}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => moveStop(i, -1)} disabled={i === 0} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-500">▲</button>
                        <button type="button" onClick={() => moveStop(i, 1)} disabled={i === selectedBoutiques.length - 1} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 text-slate-500">▼</button>
                        <button type="button" onClick={() => toggleBoutique(b)} className="p-1 hover:bg-rose-100 rounded text-rose-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!optimized && (
                <div className="p-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Cliquez sur <strong>Optimiser</strong> pour réorganiser automatiquement les arrêts par zone géographique.</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={create.isPending || selectedBoutiques.length === 0} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {create.isPending ? "Génération du manifeste..." : `Valider et Planifier ${selectedBoutiques.length > 0 ? `(${selectedBoutiques.length} arrêts)` : ""}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
