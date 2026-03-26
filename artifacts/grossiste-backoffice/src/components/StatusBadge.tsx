import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  
  const colorMap: Record<string, string> = {
    actif: "bg-emerald-100 text-emerald-700 border-emerald-200",
    inactif: "bg-slate-100 text-slate-700 border-slate-200",
    suspendu: "bg-rose-100 text-rose-700 border-rose-200",
    disponible: "bg-emerald-100 text-emerald-700 border-emerald-200",
    en_tournee: "bg-amber-100 text-amber-700 border-amber-200",
    planifiee: "bg-blue-100 text-blue-700 border-blue-200",
    en_cours: "bg-amber-100 text-amber-700 border-amber-200",
    terminee: "bg-emerald-100 text-emerald-700 border-emerald-200",
    annulee: "bg-rose-100 text-rose-700 border-rose-200",
    en_attente: "bg-slate-100 text-slate-700 border-slate-200",
    livree: "bg-emerald-100 text-emerald-700 border-emerald-200",
    echec: "bg-rose-100 text-rose-700 border-rose-200",
    litige: "bg-amber-100 text-amber-700 border-amber-200",
    especes: "bg-emerald-100 text-emerald-700 border-emerald-200",
    mobile_money: "bg-blue-100 text-blue-700 border-blue-200",
    credit: "bg-purple-100 text-purple-700 border-purple-200",
  };
  
  const formatText = (s: string) => {
    return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border shadow-sm", colorMap[normalized] || "bg-slate-100 text-slate-700 border-slate-200")}>
      {formatText(status)}
    </span>
  );
}
