import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Store, Package, Truck, MapPin,
  Menu, X, Building2, CreditCard, Brain, Star, BarChart3,
  Navigation, ShoppingCart
} from "lucide-react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useGrossistes } from "@/hooks/use-grossistes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chauffeurs", label: "Chauffeurs", icon: Users },
  { href: "/boutiques", label: "Boutiques", icon: Store },
  { href: "/produits", label: "Produits", icon: Package },
  { href: "/tournees", label: "Tournées", icon: Truck },
  { href: "/livraisons", label: "Livraisons", icon: MapPin },
  { href: "/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/carte", label: "Carte Live", icon: Navigation },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
];

const innovationItems = [
  { href: "/credit-finance", label: "Finance & Crédit", icon: CreditCard },
  { href: "/intelligence", label: "Intelligence IA", icon: Brain },
  { href: "/notation", label: "Notation Mutuelle", icon: Star },
];

const bottomNavItems = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/tournees", label: "Tournées", icon: Truck },
  { href: "/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/carte", label: "Carte", icon: Navigation },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { data: grossistes } = useGrossistes();
  const { grossisteId, setGrossisteId } = useGrossiste();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="LiviPro" className="w-6 h-6 brightness-0 invert" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">LiviPro <span className="text-primary">B2B</span></h2>
          <p className="text-xs text-slate-400 font-medium">Portail Grossiste</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-2">
            <Building2 className="w-3 h-3" /> Espace de Travail
          </div>
          <select
            className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            value={grossisteId}
            onChange={(e) => setGrossisteId(Number(e.target.value))}
          >
            {grossistes?.map(g => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 pb-1">Opérations</div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer",
                  active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-500")} />
                {item.label}
              </div>
            </Link>
          );
        })}
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 pt-3 pb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" /> Innovation
        </div>
        {innovationItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer",
                  active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-500")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-navy border-r border-slate-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-navy/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-navy border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-5 h-5 brightness-0 invert" />
            </div>
            <span className="font-bold text-white">LiviPro B2B</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Topbar */}
        <header className="md:hidden h-14 bg-white border-b border-border flex items-center px-4 justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-5 h-5 brightness-0 invert" />
            </div>
            <div>
              <span className="font-bold text-navy text-sm">LiviPro B2B</span>
              <div className="text-xs text-slate-400 -mt-0.5">
                {grossistes?.find(g => g.id === grossisteId)?.nom ?? ""}
              </div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border flex items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                  active ? "text-primary" : "text-slate-400"
                )}>
                  <Icon className={cn("w-5 h-5", active && "scale-110")} />
                  <span className={cn(
                    "text-[10px] font-semibold",
                    active ? "text-primary" : "text-slate-400"
                  )}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
