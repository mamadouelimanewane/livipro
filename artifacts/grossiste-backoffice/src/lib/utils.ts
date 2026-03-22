import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFCFA(amount: number | string | undefined | null) {
  if (amount == null) return "0 FCFA";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-FR").format(num) + " FCFA";
}

export function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined | null) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy HH:mm", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string | undefined | null) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd/MM", { locale: fr });
  } catch {
    return dateStr;
  }
}
