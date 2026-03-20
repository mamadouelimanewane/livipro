import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Map, 
  PackageCheck,
  LogOut,
  Truck,
  BarChart3,
  Leaf
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
    { name: "Grossistes", href: "/grossistes", icon: Building2 },
    { name: "Tournées Globales", href: "/tournees", icon: Map },
    { name: "Livraisons", href: "/livraisons", icon: PackageCheck },
  ];

  const innovationItems = [
    { name: "Benchmark & ESG", href: "/benchmark", icon: Leaf },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-navy text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 -translate-x-full">
      <div className="flex items-center h-20 px-6 bg-navy-light/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wide">LiviPro</h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary font-display">Super Admin</span>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu Principal</div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-white/5 hover:text-white")}>
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-white")} />
              {item.name}
              {isActive && <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />}
            </Link>
          );
        })}
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-3 px-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" /> Innovation
        </div>
        {innovationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-white/5 hover:text-white")}>
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-white")} />
              {item.name}
              {isActive && <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />}
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
    </aside>
  );
}
