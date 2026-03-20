import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "actif" | "inactif" | "suspendu" | "en_cours" | "terminee" | "planifiee" | "annulee" | "especes" | "mobile_money" | "credit" | "default";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variantClasses = {
    actif: "bg-emerald-100 text-emerald-800 border-emerald-200",
    inactif: "bg-slate-100 text-slate-800 border-slate-200",
    suspendu: "bg-rose-100 text-rose-800 border-rose-200",
    
    en_cours: "bg-amber-100 text-amber-800 border-amber-200",
    terminee: "bg-emerald-100 text-emerald-800 border-emerald-200",
    planifiee: "bg-sky-100 text-sky-800 border-sky-200",
    annulee: "bg-rose-100 text-rose-800 border-rose-200",
    
    especes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    mobile_money: "bg-indigo-50 text-indigo-700 border-indigo-100",
    credit: "bg-orange-50 text-orange-700 border-orange-100",
    
    default: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const formattedText = typeof children === 'string' ? children.replace('_', ' ') : children;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border",
      variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
      className
    )}>
      {formattedText}
    </span>
  );
}
