import { Layout } from "@/components/layout/Layout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { formatFCFA } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  Store, 
  Map, 
  Truck, 
  DollarSign, 
  TrendingUp,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useGetAdminStats();

  if (isLoading) {
    return (
      <Layout title="Tableau de Bord">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm animate-pulse h-32"></div>
          ))}
        </div>
      </Layout>
    );
  }

  if (isError || !stats) {
    return (
      <Layout title="Tableau de Bord">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-200">
          Failed to load dashboard statistics.
        </div>
      </Layout>
    );
  }

  const kpis = [
    { title: "Chiffre d'Affaires Mensuel", value: formatFCFA(stats.chiffreAffairesMensuel), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100", highlight: true },
    { title: "Grossistes Actifs", value: stats.totalGrossistes, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Chauffeurs", value: stats.totalChauffeurs, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Boutiques Clientes", value: stats.totalBoutiques, icon: Store, color: "text-violet-600", bg: "bg-violet-100" },
    { title: "Tournées Totales", value: stats.totalTournees, icon: Map, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Tournées En Cours", value: stats.tourneesEnCours, icon: Activity, color: "text-primary", bg: "bg-orange-100" },
    { title: "Livraisons Aujourd'hui", value: stats.livraisonsAujourdHui, icon: Truck, color: "text-sky-600", bg: "bg-sky-100" },
    { title: "Taux de Réussite", value: `${stats.tauxLivraisonReussi}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Layout title="Vue d'Ensemble">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={idx} 
            variants={item}
            className={`relative bg-surface p-6 rounded-2xl border ${kpi.highlight ? 'border-emerald-200 shadow-emerald-900/5' : 'border-border shadow-black/5'} shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}
          >
            {kpi.highlight && (
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <DollarSign className="w-32 h-32 text-emerald-600 transform translate-x-8 -translate-y-8" />
              </div>
            )}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-display font-bold text-navy">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold text-navy mb-4 font-display">Activité Récente</h3>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Graphique d'activité des tournées (Espace réservé)</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold text-navy mb-4 font-display">Alerte Système</h3>
          <div className="space-y-4">
            {[1,2,3].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-navy">Pic de commandes détecté</p>
                  <p className="text-xs text-slate-500">Zone de Dakar - 23 boutiquiers en rupture de stock imminent.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
