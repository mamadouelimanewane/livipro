import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFCFA(amount: number | null | undefined): string {
  if (amount == null) return "0 FCFA";
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd MMM yyyy à HH:mm", { locale: fr });
  } catch (e) {
    return dateString;
  }
}
