import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Bell, Search } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-display font-bold text-navy hidden sm:block">{title}</h2>
          </div>

          <div className="flex items-center gap-4">
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
            <h2 className="text-2xl font-display font-bold text-navy mb-6 sm:hidden">{title}</h2>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
