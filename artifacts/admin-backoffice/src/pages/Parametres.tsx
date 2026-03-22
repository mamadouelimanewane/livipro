import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import {
  Settings, ShieldCheck, MapPin, Zap, Bell, Trophy, DollarSign,
  Save, RotateCcw, ChevronDown, ChevronRight, CheckCircle, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "/api";

const CATEGORIES = [
  { key: "financier",      label: "Paramètres Financiers",   icon: DollarSign, color: "#22c55e" },
  { key: "fidelite",       label: "Programme de Fidélité",   icon: Trophy,     color: "#f59e0b" },
  { key: "securite",       label: "Sécurité & Authentification", icon: ShieldCheck, color: "#ef4444" },
  { key: "geolocalisation",label: "Géolocalisation",          icon: MapPin,     color: "#3b82f6" },
  { key: "fonctionnalites",label: "Fonctionnalités Activées", icon: Zap,        color: "#a78bfa" },
  { key: "notifications",  label: "Notifications",            icon: Bell,       color: "#f97316" },
];

interface Param {
  id: number; cle: string; valeur: string; type: string;
  categorie: string; label: string; description: string | null; updatedAt: string;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-primary" : "bg-slate-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function ParamRow({ param, onSave }: { param: Param; onSave: (cle: string, valeur: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(param.valeur);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(param.cle, val);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = async (v: boolean) => {
    const newVal = v ? "true" : "false";
    setVal(newVal);
    setSaving(true);
    await onSave(param.cle, newVal);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (param.type === "boolean") {
    return (
      <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-0 group hover:bg-slate-50 rounded-lg transition-colors">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy">{param.label}</span>
            {saved && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          {param.description && <p className="text-xs text-slate-400 mt-0.5">{param.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-slate-400">Sauvegarde…</span>}
          <ToggleSwitch checked={val === "true"} onChange={handleToggle} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-0 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex-1 mr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-navy">{param.label}</span>
          {saved && <CheckCircle className="w-4 h-4 text-green-500" />}
        </div>
        {param.description && <p className="text-xs text-slate-400 mt-0.5">{param.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              type="number"
              value={val}
              onChange={e => setVal(e.target.value)}
              className="w-28 px-3 py-1.5 text-sm border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-right font-mono"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "…" : <><Save className="w-3 h-3" /> Sauver</>}
            </button>
            <button
              onClick={() => { setVal(param.valeur); setEditing(false); }}
              className="px-3 py-1.5 text-slate-500 text-xs rounded-lg hover:bg-slate-100 transition-colors"
            >Annuler</button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-mono font-semibold rounded-lg transition-colors"
          >
            {val}
            <span className="text-xs text-slate-400 font-sans font-normal">Modifier</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CategorySection({
  cat, params, onSave,
}: {
  cat: typeof CATEGORIES[0];
  params: Param[];
  onSave: (cle: string, valeur: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const Icon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + "18" }}>
          <Icon className="w-5 h-5" style={{ color: cat.color }} />
        </div>
        <div className="flex-1 text-left">
          <span className="font-display font-bold text-navy">{cat.label}</span>
          <span className="text-xs text-slate-400 ml-2">({params.length} paramètres)</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-2 py-1">
              {params.map(p => (
                <ParamRow key={p.id} param={p} onSave={onSave} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Parametres() {
  const { toast } = useToast();
  const [params, setParams] = useState<Param[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/parametres`);
      const data = await r.json();
      setParams(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur de chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  useState(() => { load(); });

  const handleSave = async (cle: string, valeur: string) => {
    try {
      const r = await fetch(`${API}/admin/parametres/${cle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valeur }),
      });
      if (!r.ok) throw new Error();
      const updated = await r.json();
      setParams(prev => prev.map(p => p.cle === cle ? { ...p, ...updated } : p));
      toast({ title: "✓ Paramètre mis à jour", description: `"${cle}" = ${valeur}` });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder ce paramètre", variant: "destructive" });
    }
  };

  const handleReset = async () => {
    if (!confirm("Réinitialiser TOUS les paramètres aux valeurs par défaut ?")) return;
    setResetting(true);
    try {
      const r = await fetch(`${API}/admin/parametres/reset`, { method: "POST" });
      if (!r.ok) throw new Error();
      await load();
      toast({ title: "✓ Paramètres réinitialisés", description: "Toutes les valeurs ont été remises à leur défaut." });
    } catch {
      toast({ title: "Erreur", description: "Réinitialisation échouée", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  const paramsByCategory = CATEGORIES.map(cat => ({
    cat,
    params: params.filter(p => p.categorie === cat.key),
  })).filter(({ params }) => params.length > 0);

  return (
    <Layout title="Paramètres Système">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-slate-500 text-sm">
            Configurez les paramètres globaux de la plateforme LiviPro — les modifications s'appliquent immédiatement à toutes les apps.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
          {resetting ? "Réinitialisation…" : "Valeurs par défaut"}
        </button>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          <strong>Attention :</strong> Certains paramètres (sécurité, JWT) nécessitent un redémarrage du serveur pour être pris en compte.
          Les modifications financières et de fidélité s'appliquent immédiatement.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Settings className="w-8 h-8 text-primary animate-spin" />
            <span className="text-slate-500 text-sm">Chargement des paramètres…</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-24 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {paramsByCategory.map(({ cat, params: catParams }) => (
            <CategorySection key={cat.key} cat={cat} params={catParams} onSave={handleSave} />
          ))}

          {/* Summary footer */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-navy text-sm">Récapitulatif</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {CATEGORIES.map(cat => {
                const count = params.filter(p => p.categorie === cat.key).length;
                const Icon = cat.icon;
                return (
                  <div key={cat.key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                    <span className="text-slate-600">{cat.label.split(" ")[0]}</span>
                    <span className="font-bold text-navy ml-auto">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
              <span className="text-slate-500">Total paramètres configurés</span>
              <span className="font-bold text-navy">{params.length}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
