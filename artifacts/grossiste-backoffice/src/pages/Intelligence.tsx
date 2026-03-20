import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Brain, AlertTriangle, TrendingUp, TrendingDown, MessageSquare, Check, Clock, Plus, X, RefreshCw, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;
const fmt = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

function ConfianceBadge({ c }: { c: string }) {
  const cfg = c === "elevee" ? "bg-green-100 text-green-700" : c === "moyenne" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500";
  const labels: Record<string, string> = { elevee: "Haute confiance", moyenne: "Confiance moyenne", faible: "Données insuffisantes" };
  return <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cfg)}>{labels[c] ?? c}</span>;
}

function SeveriteBadge({ s }: { s: string }) {
  const cfg = s === "critique" ? "bg-red-100 text-red-700 border-red-200" : s === "eleve" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-yellow-100 text-yellow-700 border-yellow-200";
  return <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border uppercase", cfg)}>{s}</span>;
}

function StatutBadge({ s }: { s: string }) {
  const cfg = s === "confirme" ? "bg-blue-100 text-blue-700" : s === "planifie" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600";
  const labels: Record<string, string> = { recu: "Reçu", confirme: "Confirmé", planifie: "Planifié" };
  return <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cfg)}>{labels[s] ?? s}</span>;
}

function SimulateWhatsAppModal({ grossisteId, onClose, onSuccess }: { grossisteId: number; onClose: () => void; onSuccess: () => void }) {
  const [nom, setNom] = useState("Boutique Diallo");
  const [tel, setTel] = useState("+221 77 " + Math.floor(1000000 + Math.random() * 9000000));
  const [produits, setProduits] = useState([{ nom: "Lait Nido", qte: 10 }, { nom: "Sucre 50kg", qte: 3 }]);
  const [saving, setSaving] = useState(false);

  const message = `Bonjour, je voudrais commander :\n${produits.map(p => `- ${p.qte}x ${p.nom}`).join("\n")}\nMerci`;
  const montant = produits.reduce((s, p) => s + p.qte * 15000, 0);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/whatsapp-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numerotelephone: tel, nomBoutique: nom, message, produits, montantEstime: montant }),
    });
    setSaving(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900"><MessageSquare className="w-5 h-5 text-green-500" /> Simuler une commande WhatsApp</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Nom de la boutique</label>
            <input className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" value={nom} onChange={e => setNom(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Numéro WhatsApp</label>
            <input className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" value={tel} onChange={e => setTel(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Produits commandés</label>
            <div className="space-y-2">
              {produits.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Produit" value={p.nom} onChange={e => setProduits(prev => prev.map((x, j) => j === i ? { ...x, nom: e.target.value } : x))} />
                  <input type="number" className="w-16 border border-border rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-center" value={p.qte} onChange={e => setProduits(prev => prev.map((x, j) => j === i ? { ...x, qte: parseInt(e.target.value) || 1 } : x))} />
                  <button onClick={() => setProduits(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500"><Minus className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setProduits(prev => [...prev, { nom: "", qte: 1 }])} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Ajouter un produit</button>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">Message WhatsApp généré :</div>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans">{message}</pre>
            <div className="text-xs font-bold text-green-700 mt-2">Montant estimé : {fmt(montant)}</div>
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border text-slate-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-slate-50">Annuler</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-green-500 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-green-600 disabled:opacity-50">
            {saving ? "Envoi..." : "Simuler réception"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Intelligence() {
  const { grossisteId } = useGrossiste();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"demand" | "fraude" | "whatsapp">("demand");
  const [showSimulate, setShowSimulate] = useState(false);

  const { data: demand = [], isLoading: loadingDemand } = useQuery({
    queryKey: ["demand-forecast", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/demand-forecast`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: fraude, isLoading: loadingFraude } = useQuery({
    queryKey: ["fraud-alerts", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/fraud-alerts`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: whatsappOrders = [], isLoading: loadingWA } = useQuery({
    queryKey: ["whatsapp-orders", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/whatsapp-orders`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/whatsapp-orders/${id}/statut`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-orders", grossisteId] }),
  });

  const tabs = [
    { id: "demand", label: "Prévision Demande", icon: Brain },
    { id: "fraude", label: "Alertes Fraude", count: fraude?.totalAlertes, icon: AlertTriangle },
    { id: "whatsapp", label: "Commandes WhatsApp", count: whatsappOrders.filter((o: any) => o.statut === "recu").length, icon: MessageSquare },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Intelligence IA</h1>
          <p className="text-slate-500 mt-1">Prévision de la demande, détection de fraude et commandes WhatsApp</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-xl text-sm font-semibold">
          <Brain className="w-4 h-4" /> Moteur IA LiviPro
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
              tab === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 border border-border hover:border-primary/30")}>
            <t.icon className="w-4 h-4" />{t.label}
            {(t as any).count > 0 && <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-bold", tab === t.id ? "bg-white/20 text-white" : "bg-red-500 text-white")}>{(t as any).count}</span>}
          </button>
        ))}
      </div>

      {tab === "demand" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
            <Brain className="w-4 h-4 inline mr-2" />
            Les prévisions sont calculées par régression linéaire sur l'historique des 8 dernières semaines par boutique. La confiance augmente avec le volume de données.
          </div>
          {loadingDemand ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : demand.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Pas assez de données</p>
              <p className="text-sm">Au moins 2 livraisons par boutique sont nécessaires pour calculer les prévisions.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-slate-100">
                {demand.map((d: any) => (
                  <div key={d.boutiqueId} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{d.boutiqueNom}</span>
                          <ConfianceBadge c={d.confiance} />
                        </div>
                        <div className="text-xs text-slate-400">{d.adresse}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-slate-500">{d.commandesRecentes} commandes analysées</span>
                          <span className="flex items-center gap-1 font-semibold" style={{ color: d.tendance >= 0 ? "#22c55e" : "#ef4444" }}>
                            {d.tendance >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {d.tendance >= 0 ? "+" : ""}{d.tendance}% tendance
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{fmt(d.previsionMontant)}</div>
                        <div className="text-xs text-slate-400">Prévision prochaine commande</div>
                        {d.previsionDate && (
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" /> {new Date(d.previsionDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "fraude" && (
        <div className="space-y-4">
          {loadingFraude ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Critique", val: fraude?.critique ?? 0, color: "text-red-600", bg: "bg-red-50" },
                  { label: "Élevé", val: fraude?.eleve ?? 0, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "Modéré", val: fraude?.modere ?? 0, color: "text-yellow-600", bg: "bg-yellow-50" },
                ].map(k => (
                  <div key={k.label} className={cn("rounded-2xl p-4 text-center", k.bg)}>
                    <div className={cn("text-3xl font-bold", k.color)}>{k.val}</div>
                    <div className="text-sm text-slate-600 mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              {(fraude?.alertes ?? []).length === 0 ? (
                <div className="text-center py-16 bg-green-50 rounded-2xl border border-green-200">
                  <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-semibold text-green-700">Aucune anomalie détectée</p>
                  <p className="text-sm text-green-600">Tous les chauffeurs présentent des comportements normaux.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fraude.alertes.map((a: any) => (
                    <div key={a.id} className={cn("bg-white rounded-2xl border p-4", a.severite === "critique" ? "border-red-300" : a.severite === "eleve" ? "border-orange-300" : "border-yellow-300")}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={cn("w-5 h-5 mt-0.5", a.severite === "critique" ? "text-red-500" : a.severite === "eleve" ? "text-orange-500" : "text-yellow-500")} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{a.chauffeurNom}</span>
                            <SeveriteBadge s={a.severite} />
                          </div>
                          <p className="text-sm text-slate-600">{a.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(a.date).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "whatsapp" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex-1 mr-4 text-sm text-green-700">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Les boutiques passent commande via WhatsApp Business. Le chatbot analyse le message et crée automatiquement la commande ici.
            </div>
            <button onClick={() => setShowSimulate(true)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-600 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Simuler une commande
            </button>
          </div>

          {loadingWA ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : whatsappOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Aucune commande WhatsApp</p>
              <p className="text-sm">Cliquez sur "Simuler une commande" pour tester le flux.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {whatsappOrders.map((o: any) => (
                <div key={o.id} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">
                        {o.nomBoutique[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{o.nomBoutique}</div>
                        <div className="text-xs text-slate-400">{o.numerotelephone}</div>
                        <div className="mt-2 bg-green-50 rounded-xl p-2.5 text-xs text-slate-700 whitespace-pre-wrap max-w-xs">{o.message}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary mb-1">{fmt(o.montantEstime)}</div>
                      <StatutBadge s={o.statut} />
                      <div className="text-xs text-slate-400 mt-1">{new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      {o.statut === "recu" && (
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => updateStatut.mutate({ id: o.id, statut: "confirme" })} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200">Confirmer</button>
                          <button onClick={() => updateStatut.mutate({ id: o.id, statut: "planifie" })} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-200">Planifier</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSimulate && grossisteId && (
        <SimulateWhatsAppModal
          grossisteId={grossisteId}
          onClose={() => setShowSimulate(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ["whatsapp-orders", grossisteId] })}
        />
      )}
    </div>
  );
}
