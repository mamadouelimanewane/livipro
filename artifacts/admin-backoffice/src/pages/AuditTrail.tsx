import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Search, Filter, User, ShoppingCart, Package, Settings, LogIn, LogOut, Edit, Eye, Download, Trash2 } from "lucide-react";

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  login: { label: "Connexion", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: LogIn },
  logout: { label: "Déconnexion", color: "text-slate-600 bg-slate-50 border-slate-200", icon: LogOut },
  create: { label: "Création", color: "text-blue-700 bg-blue-50 border-blue-200", icon: Package },
  update: { label: "Modification", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Edit },
  delete: { label: "Suppression", color: "text-rose-700 bg-rose-50 border-rose-200", icon: Trash2 },
  view: { label: "Consultation", color: "text-slate-600 bg-slate-50 border-slate-200", icon: Eye },
  export: { label: "Export", color: "text-purple-700 bg-purple-50 border-purple-200", icon: Download },
};

const ACTEUR_COLORS: Record<string, string> = {
  admin: "text-rose-700 bg-rose-100",
  grossiste: "text-blue-700 bg-blue-100",
  boutiquier: "text-emerald-700 bg-emerald-100",
  chauffeur: "text-orange-700 bg-orange-100",
  systeme: "text-slate-700 bg-slate-100",
};

const DEMO_LOGS = [
  { id: 1, acteurType: "admin", acteurNom: "Admin LiviPro", action: "login", ressource: "systeme", details: null, ip: "41.213.34.12", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 2, acteurType: "grossiste", acteurNom: "Mamadou Diallo", action: "create", ressource: "commande", ressourceId: 142, details: '{"montant":"45000"}', ip: "196.14.12.3", createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 3, acteurType: "boutiquier", acteurNom: "Fatou Ndiaye", action: "view", ressource: "wallet", details: null, ip: "41.82.15.6", createdAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: 4, acteurType: "admin", acteurNom: "Admin LiviPro", action: "update", ressource: "parametres", details: '{"cle":"commission_taux","avant":"3.5","apres":"4.0"}', ip: "41.213.34.12", createdAt: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: 5, acteurType: "chauffeur", acteurNom: "Ibrahima Sow", action: "update", ressource: "livraison", ressourceId: 89, details: '{"statut":"livree"}', ip: "196.22.45.11", createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: 6, acteurType: "grossiste", acteurNom: "Mamadou Diallo", action: "export", ressource: "commandes", details: '{"format":"csv","lignes":142}', ip: "196.14.12.3", createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 7, acteurType: "boutiquier", acteurNom: "Awa Sy", action: "update", ressource: "pin", details: '{"action":"reset"}', ip: "154.121.4.77", createdAt: new Date(Date.now() - 120 * 60000).toISOString() },
  { id: 8, acteurType: "systeme", acteurNom: "Système", action: "create", ressource: "notification", details: '{"type":"alerte_fraude"}', ip: "127.0.0.1", createdAt: new Date(Date.now() - 180 * 60000).toISOString() },
  { id: 9, acteurType: "admin", acteurNom: "Admin LiviPro", action: "delete", ressource: "promotions", ressourceId: 3, details: '{"code":"PROMO10"}', ip: "41.213.34.12", createdAt: new Date(Date.now() - 240 * 60000).toISOString() },
  { id: 10, acteurType: "grossiste", acteurNom: "Cheikh Lô", action: "create", ressource: "depot", details: '{"nom":"Entrepôt Sud"}', ip: "196.33.21.55", createdAt: new Date(Date.now() - 300 * 60000).toISOString() },
];

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterActeur, setFilterActeur] = useState("all");

  const logs = DEMO_LOGS.filter(l => {
    const matchSearch = !search || l.acteurNom?.toLowerCase().includes(search.toLowerCase()) ||
      l.ressource.toLowerCase().includes(search.toLowerCase()) ||
      l.ip?.includes(search);
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchActeur = filterActeur === "all" || l.acteurType === filterActeur;
    return matchSearch && matchAction && matchActeur;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Journal d'Audit
          </h1>
          <p className="text-slate-500 text-sm mt-1">Historique complet des actions sensibles de la plateforme</p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="w-4 h-4" /> Exporter logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Actions aujourd'hui", value: logs.filter(l => new Date(l.createdAt) > new Date(Date.now() - 86400000)).length, color: "text-slate-700 bg-slate-50" },
          { label: "Connexions", value: logs.filter(l => l.action === "login").length, color: "text-emerald-700 bg-emerald-50" },
          { label: "Modifications", value: logs.filter(l => l.action === "update").length, color: "text-amber-700 bg-amber-50" },
          { label: "Suppressions", value: logs.filter(l => l.action === "delete").length, color: "text-rose-700 bg-rose-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.color.split(" ")[1]} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par acteur, ressource, IP..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white min-w-36">
          <option value="all">Toutes actions</option>
          {Object.entries(ACTION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterActeur} onChange={e => setFilterActeur(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white min-w-36">
          <option value="all">Tous acteurs</option>
          {["admin", "grossiste", "boutiquier", "chauffeur", "systeme"].map(a => (
            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun log correspondant</p>
            </div>
          ) : logs.map(log => {
            const action = ACTION_CONFIG[log.action] || ACTION_CONFIG.view;
            const ActionIcon = action.icon;
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${action.color}`}>
                  <ActionIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTEUR_COLORS[log.acteurType] || "text-slate-600 bg-slate-100"}`}>
                      {log.acteurType}
                    </span>
                    <span className="font-medium text-slate-800 text-sm">{log.acteurNom}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${action.color}`}>{action.label}</span>
                    <span className="text-xs text-slate-500 font-mono">{log.ressource}{log.ressourceId ? ` #${log.ressourceId}` : ""}</span>
                  </div>
                  {log.details && (
                    <p className="text-xs font-mono text-slate-400 mt-1 bg-slate-50 px-2 py-1 rounded truncate max-w-lg">{log.details}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">{timeAgo(log.createdAt)}</span>
                    {log.ip && <span className="text-xs font-mono text-slate-300">IP: {log.ip}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
