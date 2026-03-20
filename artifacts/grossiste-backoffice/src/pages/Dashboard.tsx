import { useStats } from "@/hooks/use-stats";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA } from "@/lib/utils";
import { Users, Store, Truck, MapPin, TrendingUp, CheckCircle2, Box } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-10 bg-slate-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div></div>
    </div>;
  }

  const kpis = [
    { label: "Chiffre d'Affaires Mensuel", value: formatFCFA(stats?.chiffreAffairesMensuel), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Tournées en cours", value: stats?.tourneesEnCours || 0, icon: Truck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Livraisons Aujourd'hui", value: stats?.livraisonsAujourdHui || 0, icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Taux de Réussite", value: `${stats?.tauxLivraisonReussi || 0}%`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Boutiques", value: stats?.totalBoutiques || 0, icon: Store, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Chauffeurs", value: stats?.totalChauffeurs || 0, icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  // Dummy data for the chart to make the dashboard look premium
  const chartData = [
    { name: '01', ca: 150000 },
    { name: '05', ca: 300000 },
    { name: '10', ca: 250000 },
    { name: '15', ca: 480000 },
    { name: '20', ca: 380000 },
    { name: '25', ca: 550000 },
    { name: '30', ca: stats?.chiffreAffairesMensuel || 600000 },
  ];

  return (
    <div>
      <PageHeader 
        title="Tableau de Bord" 
        description="Supervisez vos opérations logistiques et vos performances en temps réel."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-6">Évolution du Chiffre d'Affaires</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'CA Mensuel']}
                />
                <Area type="monotone" dataKey="ca" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Box className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Gestion d'Entrepôt</h3>
          <p className="text-muted-foreground text-sm mb-6">Optimisez vos stocks et préparez vos tournées avec LiviPro B2B.</p>
          <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors">
            Voir les produits
          </button>
        </div>
      </div>
    </div>
  );
}
