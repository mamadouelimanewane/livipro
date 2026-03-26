import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md text-center px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-100 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-4xl font-display font-bold text-navy mb-4">Page Introuvable</h1>
        <p className="text-lg text-slate-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          Retour au Tableau de Bord
        </Link>
      </div>
    </div>
  );
}
