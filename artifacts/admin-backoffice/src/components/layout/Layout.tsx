import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Map,
  PackageCheck,
  LogOut,
  Truck,
  Leaf,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  Shield,
  FileBarChart,
} from "lucide-react";

const navItems = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Grossistes", href: "/grossistes", icon: Building2 },
  { name: "Tournées Globales", href: "/tournees", icon: Map },
  { name: "Livraisons", href: "/livraisons", icon: PackageCheck },
  { name: "Paramètres Système", href: "/parametres", icon: Settings },
  { name: "Journal d'Audit", href: "/audit", icon: Shield },
  { name: "Rapport Hebdo", href: "/rapport-hebdo", icon: FileBarChart },
];

const innovationItems = [
  { name: "Benchmark & ESG", href: "/benchmark", icon: Leaf },
];

function SidebarContent({ onClose }: { onClose: () => void }) {
  const [location] = useLocation();

  return (
    <>
      <div className="flex items-center justify-between h-20 px-6 bg-navy-light/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide">LiviPro</h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary font-display">Super Admin</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu Principal</div>
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group cursor-pointer",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-white")} />
                {item.name}
                {isActive && <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />}
              </div>
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-3 px-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" /> Innovation
        </div>
        {innovationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group cursor-pointer",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-white")} />
                {item.name}
                {isActive && <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 px-3 py-3 w-full rounded-xl font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 bg-navy text-slate-300 flex-col">
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-navy text-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="h-16 md:h-20 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-display font-bold text-navy">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full text-sm w-64 transition-all"
              />
            </div>
            <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-surface">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
