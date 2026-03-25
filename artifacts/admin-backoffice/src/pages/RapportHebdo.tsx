import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download, TrendingUp, Truck, DollarSign, AlertTriangle, CheckCircle2, Package, RefreshCw } from "lucide-react";
import { useState } from "react";

function formatFCFA(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(v);
}

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay() || 7;
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + 1 + offset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    debut: mon.toISOString().split("T")[0],
    fin: sun.toISOString().split("T")[0],
    label: `${mon.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${sun.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`,
  };
}

const DEMO_DATA = {
  grossistes: 4,
  tournees: 28,
  livraisons: 312,
  livraisonsReussies: 289,
  litiges: 8,
  caTotal: 14500000,
  especes: 8700000,
  mobileMoney: 5100000,
  credit: 700000,
  topGrossiste: "Diallo Distribution",
  topLivreur: "Ibrahima Sow",
  factures: 12,
  facturesPayees: 9,
  retours: 5,
  nouvelleBoutiques: 3,
};

export default function RapportHebdo() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [generating, setGenerating] = useState(false);
  const week = getWeekRange(weekOffset);
  const d = DEMO_DATA;

  const tauxReussite = Math.round((d.livraisonsReussies / d.livraisons) * 100);

  const handlePDF = () => {
    setGenerating(true);
    setTimeout(() => {
      const content = `RAPPORT HEBDOMADAIRE LIVIPRO
Semaine du ${week.label}

=== RÉSUMÉ EXÉCUTIF ===
• Grossistes actifs: ${d.grossistes}
• Tournées effectuées: ${d.tournees}
• Livraisons totales: ${d.livraisons}
• Taux de réussite: ${tauxReussite}%
• CA total: ${formatFCFA(d.caTotal)}

=== ENCAISSEMENTS ===
• Espèces: ${formatFCFA(d.especes)}
• Mobile Money: ${formatFCFA(d.mobileMoney)}
• Crédit: ${formatFCFA(d.credit)}

=== INCIDENTS ===
• Litiges: ${d.litiges}
• Retours marchandises: ${d.retours}

=== TOP PERFORMERS ===
• Meilleur grossiste: ${d.topGrossiste}
• Meilleur livreur: ${d.topLivreur}

=== FACTURATION ===
• Factures émises: ${d.factures}
• Factures payées: ${d.facturesPayees}

Rapport généré automatiquement par LiviPro le ${new Date().toLocaleDateString("fr-FR")}`;

      const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_livipro_semaine_${week.debut}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-primary" /> Rapport Hebdomadaire
          </h1>
          <p className="text-slate-500 text-sm mt-1">Synthèse de l'activité de la plateforme LiviPro</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button onClick={() => setWeekOffset(o => o - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600">‹</button>
            <span className="px-3 text-sm font-medium text-slate-700 whitespace-nowrap">{week.label}</span>
            <button onClick={() => setWeekOffset(o => Math.min(0, o + 1))} disabled={weekOffset === 0} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30">›</button>
          </div>
          <button onClick={handlePDF} disabled={generating} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? "Génération..." : "Télécharger"}
          </button>
        </div>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CA total", value: formatFCFA(d.caTotal), icon: DollarSign, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", trend: "+12% vs S-1" },
          { label: "Livraisons réussies", value: `${d.livraisonsReussies}/${d.livraisons}`, icon: CheckCircle2, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", trend: `${tauxReussite}% de réussite` },
          { label: "Tournées", value: d.tournees, icon: Truck, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100", trend: `${d.grossistes} grossistes` },
          { label: "Litiges", value: d.litiges, icon: AlertTriangle, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100", trend: d.litiges <= 5 ? "Faible" : "À surveiller" },
        ].map((k, i) => (
          <div key={i} className={`${k.bg} border ${k.border} rounded-xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <span className={`text-xs font-bold ${k.color} bg-white/50 px-2 py-1 rounded-full`}>{k.trend}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Encaissements + Facturation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Encaissements par méthode</h3>
          <div className="space-y-3">
            {[
              { label: "Espèces", value: d.especes, pct: Math.round(d.especes / d.caTotal * 100), color: "bg-primary" },
              { label: "Mobile Money (Wave, OM...)", value: d.mobileMoney, pct: Math.round(d.mobileMoney / d.caTotal * 100), color: "bg-blue-500" },
              { label: "Crédit boutiquier", value: d.credit, pct: Math.round(d.credit / d.caTotal * 100), color: "bg-amber-500" },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{m.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{formatFCFA(m.value)}</span>
                    <span className="text-xs text-slate-400 ml-2">{m.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full"><div className={`${m.color} h-2 rounded-full`} style={{ width: `${m.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Indicateurs clés</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Nouvelles boutiques", value: d.nouvelleBoutiques, color: "text-emerald-600 bg-emerald-50" },
              { label: "Retours traités", value: d.retours, color: "text-orange-600 bg-orange-50" },
              { label: "Factures émises", value: d.factures, color: "text-blue-600 bg-blue-50" },
              { label: "Factures payées", value: d.facturesPayees, color: "text-slate-600 bg-slate-50" },
            ].map((k, i) => (
              <div key={i} className={`${k.color.split(" ")[1]} rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${k.color.split(" ")[0]}`}>{k.value}</p>
                <p className="text-xs text-slate-500 mt-1">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top performers */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Top Performers de la semaine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">🏆 Meilleur Grossiste</p>
            <p className="font-bold text-lg">{d.topGrossiste}</p>
            <p className="text-xs text-slate-400 mt-1">Taux de livraison : 98.2%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">⭐ Meilleur Livreur</p>
            <p className="font-bold text-lg">{d.topLivreur}</p>
            <p className="text-xs text-slate-400 mt-1">Score : 94/100 · 45 livraisons</p>
          </div>
        </div>
      </div>
    </div>
  );
}
