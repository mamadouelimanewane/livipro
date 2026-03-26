import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery } from "@tanstack/react-query";
import { Star, Users, Store, TrendingUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL;

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn("w-4 h-4", i <= Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200")} />
      ))}
      <span className="ml-1 text-sm font-bold text-slate-700">{score.toFixed(1)}</span>
    </div>
  );
}

function RatingCard({ rating }: { rating: any }) {
  const isChauffeurByBoutique = rating.type === "chauffeur_by_boutique";
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0",
          isChauffeurByBoutique ? "bg-blue-500" : "bg-green-500")}>
          {isChauffeurByBoutique ? <Store className="w-4 h-4" /> : <Users className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-900 text-sm">
              {isChauffeurByBoutique ? (rating.boutiqueNom ?? "Boutique") : (rating.chauffeurNom ?? "Chauffeur")}
            </span>
            <span className="text-xs text-slate-400">→</span>
            <span className="text-sm text-slate-600">{isChauffeurByBoutique ? (rating.chauffeurNom ?? "—") : (rating.boutiqueNom ?? "—")}</span>
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", isChauffeurByBoutique ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>
              {isChauffeurByBoutique ? "Boutique → Chauffeur" : "Chauffeur → Boutique"}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[1,2,3,4,5].map(i => <Star key={i} className={cn("w-3.5 h-3.5", i <= rating.score ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200")} />)}
            <span className="text-xs text-slate-500 ml-1">{rating.score}/5</span>
          </div>
          {rating.commentaire && <p className="text-sm text-slate-600 bg-slate-100 rounded-lg p-2 mt-1">"{rating.commentaire}"</p>}
          <div className="text-xs text-slate-400 mt-1">{new Date(rating.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
      </div>
    </div>
  );
}

export default function Notation() {
  const { grossisteId } = useGrossiste();

  const { data, isLoading } = useQuery({
    queryKey: ["ratings", grossisteId],
    queryFn: () => fetch(`${BASE}../api/grossistes/${grossisteId}/innovations/ratings`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { ratings = [], chauffeurScores = [], boutiqueScores = [] } = data ?? {};

  const avgChauffeur = chauffeurScores.length ? chauffeurScores.reduce((s: number, c: any) => s + c.avgScore, 0) / chauffeurScores.length : 0;
  const avgBoutique = boutiqueScores.length ? boutiqueScores.reduce((s: number, b: any) => s + b.avgScore, 0) / boutiqueScores.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Notation Mutuelle</h1>
        <p className="text-slate-500 mt-1">Les boutiques notent les chauffeurs · Les chauffeurs notent les boutiques</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
            <Users className="w-5 h-5" /> Chauffeurs notés par boutiques
          </div>
          <div className="text-3xl font-bold text-blue-700">{avgChauffeur.toFixed(1)}/5</div>
          <div className="text-sm text-blue-600">{chauffeurScores.length} chauffeur(s) évalué(s)</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
            <Store className="w-5 h-5" /> Boutiques notées par chauffeurs
          </div>
          <div className="text-3xl font-bold text-green-700">{avgBoutique.toFixed(1)}/5</div>
          <div className="text-sm text-green-600">{boutiqueScores.length} boutique(s) évaluée(s)</div>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-3">
            <MessageSquare className="w-5 h-5" /> Total avis collectés
          </div>
          <div className="text-3xl font-bold text-yellow-700">{ratings.length}</div>
          <div className="text-sm text-yellow-600">Notations enregistrées</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-blue-50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Top Chauffeurs (note des boutiques)</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : chauffeurScores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucune notation chauffeur</p>
              <p className="text-xs mt-1">Les chauffeurs seront notés par les boutiques après livraison depuis l'app mobile</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {chauffeurScores.map((c: any, i: number) => (
                <div key={c.chauffeurId} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : "bg-orange-400")}>#{i + 1}</div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{c.chauffeurNom}</div>
                      <div className="text-xs text-slate-400">{c.count} évaluation(s)</div>
                    </div>
                  </div>
                  <StarRating score={c.avgScore} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-green-50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><Store className="w-4 h-4 text-green-600" /> Top Boutiques (note des chauffeurs)</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : boutiqueScores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucune notation boutique</p>
              <p className="text-xs mt-1">Les boutiques seront notées par les chauffeurs depuis l'app mobile</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {boutiqueScores.map((b: any, i: number) => (
                <div key={b.boutiqueId} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : "bg-orange-400")}>#{i + 1}</div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{b.boutiqueNom}</div>
                      <div className="text-xs text-slate-400">{b.count} évaluation(s)</div>
                    </div>
                  </div>
                  <StarRating score={b.avgScore} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-slate-900">Dernier avis collectés</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Pas encore d'avis</p>
            <p className="text-sm mt-1">Les notations mutuelles seront enregistrées ici après chaque tournée via l'app mobile du chauffeur.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ratings.map((r: any) => <RatingCard key={r.id} rating={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
