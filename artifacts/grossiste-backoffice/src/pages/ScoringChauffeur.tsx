import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Trophy, TrendingUp, Star, Package, Clock, Zap, Medal, Award } from "lucide-react";

function ScoreBadge({ score }: { score: number }) {
  if (score >= 90) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">🥇 Elite</span>;
  if (score >= 75) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">🥈 Expert</span>;
  if (score >= 60) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">🥉 Confirmé</span>;
  return <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Débutant</span>;
}

function ScoreBar({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ScoringChauffeur() {
  const { grossisteId, authFetch } = useGrossiste();

  const { data: chauffeurs, isLoading: loadC } = useQuery({
    queryKey: ["chauffeurs", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/chauffeurs`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: livraisons } = useQuery({
    queryKey: ["livraisons", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: tournees } = useQuery({
    queryKey: ["tournees", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/tournees`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const scores = (chauffeurs || []).map((c: any) => {
    const tourneesC = (tournees || []).filter((t: any) => t.chauffeurId === c.id);
    const livraisonsC = (livraisons || []).filter((l: any) => {
      const t = (tournees || []).find((t: any) => t.id === l.tourneeId);
      return t?.chauffeurId === c.id;
    });
    const total = livraisonsC.length;
    const reussies = livraisonsC.filter((l: any) => l.statut === "livree").length;
    const echecs = livraisonsC.filter((l: any) => l.statut === "echec").length;
    const litiges = livraisonsC.filter((l: any) => l.statut === "litige").length;
    const signatures = livraisonsC.filter((l: any) => l.signatureReception).length;
    const tauxReussite = total > 0 ? (reussies / total) * 100 : 0;
    const tauxLitige = total > 0 ? (litiges / total) * 100 : 0;
    const tauxSignature = total > 0 ? (signatures / total) * 100 : 0;
    const nbTournees = tourneesC.length;
    const scoreReussite = Math.round(tauxReussite * 0.4);
    const scoreLitige = Math.round(Math.max(0, 100 - tauxLitige * 5) * 0.2);
    const scoreSignature = Math.round(tauxSignature * 0.2);
    const scoreActivite = Math.min(20, Math.round(nbTournees * 2));
    const scoreTotal = scoreReussite + scoreLitige + scoreSignature + scoreActivite;
    return {
      ...c,
      scoreTotal,
      scoreReussite: Math.round(tauxReussite),
      scoreLitige: Math.round(Math.max(0, 100 - tauxLitige * 5)),
      scoreSignature: Math.round(tauxSignature),
      nbTournees,
      total,
      reussies,
      echecs,
      litiges,
    };
  }).sort((a: any, b: any) => b.scoreTotal - a.scoreTotal);

  const top1 = scores[0];
  const top3 = scores.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader title="Scoring Livreurs" subtitle="Classement multi-critères de performance" icon={<Trophy className="w-5 h-5" />} />

      {/* Podium */}
      {scores.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[top3[1], top3[0], top3[2]].map((c: any, i: number) => {
            const places = [2, 1, 3];
            const icons = ["🥈", "🥇", "🥉"];
            const heights = ["h-24", "h-32", "h-20"];
            const bgs = ["bg-slate-100", "bg-yellow-100", "bg-amber-100"];
            return (
              <div key={c?.id || i} className={`${bgs[i]} rounded-xl p-4 text-center flex flex-col items-center justify-end ${heights[i]}`}>
                <p className="text-2xl mb-1">{icons[i]}</p>
                <p className="font-bold text-slate-800 text-xs">{c?.prenom} {c?.nom?.charAt(0)}.</p>
                <p className="text-lg font-bold text-primary">{c?.scoreTotal}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking */}
      <div className="space-y-3">
        {loadC ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400">Chargement...</div>
        ) : scores.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun livreur à scorer</p>
          </div>
        ) : scores.map((c: any, idx: number) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-slate-100 text-slate-600" : idx === 2 ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-500"}`}>
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{c.prenom} {c.nom}</p>
                  <p className="text-xs text-slate-400">{c.nbTournees} tournées · {c.total} livraisons</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{c.scoreTotal}<span className="text-sm text-slate-400">/100</span></p>
                <ScoreBadge score={c.scoreTotal} />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Taux réussite", value: c.scoreReussite, icon: TrendingUp, color: "bg-emerald-500", display: `${c.scoreReussite}%` },
                { label: "Gestion litiges", value: c.scoreLitige, icon: Zap, color: "bg-blue-500", display: `${c.litiges} litige(s)` },
                { label: "Signatures", value: c.scoreSignature, icon: Star, color: "bg-orange-500", display: `${c.scoreSignature}%` },
                { label: "Activité", value: Math.min(100, c.nbTournees * 10), icon: Package, color: "bg-purple-500", display: `${c.nbTournees} tournées` },
              ].map((m, j) => (
                <div key={j}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <m.icon className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{m.label}</span>
                  </div>
                  <ScoreBar value={m.value} color={m.color} />
                  <p className="text-xs font-bold text-slate-700 mt-1">{m.display}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
