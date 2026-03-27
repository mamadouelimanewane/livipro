import React, { useState, useEffect } from "react";
import { 
  Users, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronRight,
  UserCircle,
  ShieldCheck,
  Building2,
  Store,
  Wallet
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function DashboardShell({ children, title, role = "admin" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = {
    admin: [
      { id: "social", label: "Flux Réseau", icon: <LayoutDashboard size={20} />, path: "/admin?view=social" },
      { id: "users", label: "Gestion Partenaires", icon: <Users size={20} />, path: "/admin?view=users" },
      { id: "compliance", label: "Documents & KYC", icon: <ShieldCheck size={20} />, path: "/admin?view=compliance" },
      { id: "security", label: "Cyber-Sécurité", icon: <BarChart3 size={20} />, path: "/admin?view=security" },
      { id: "track", label: "Atlas Tracking", icon: <Settings size={20} />, path: "/admin?view=track" },
    ],
    grossiste: [
      { id: "catalog", label: "Stocks & Prix", icon: <Building2 size={20} />, path: "/sales?view=catalog" },
      { id: "fleet", label: "Gestion Flotte", icon: <Truck size={20} />, path: "/sales?view=fleet" },
      { id: "directory", label: "Portefeuille Clients", icon: <Users size={20} />, path: "/sales?view=directory" },
      { id: "groupage", label: "LiviGroupage", icon: <Package size={20} />, path: "/sales?view=groupage" },
      { id: "branches", label: "Relais & Points", icon: <Settings size={20} />, path: "/sales?view=branches" },
    ],
    boutique: [
      { id: "dashboard", label: "Mon Portail Boutique", icon: <Store size={20} />, path: "/boutique?view=dashboard" },
      { id: "orders", label: "Mes Ravitaillements", icon: <Package size={20} />, path: "/boutique?view=orders" },
      { id: "wallet", label: "LiviWallet B2B", icon: <Wallet size={20} />, path: "/boutique?view=wallet" },
      { id: "credit", label: "Score de Crédit", icon: <ShieldCheck size={20} />, path: "/boutique?view=credit" },
      { id: "settings", label: "Paramètres Shop", icon: <Settings size={20} />, path: "/boutique?view=settings" },
    ]
  };

  const handleLogout = () => {
    alert("Déconnexion réussie. À bientôt sur LiviPro !");
    window.location.href = "/";
  };

  const currentMenu = menuItems[role] || menuItems.admin;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: DARK_NAVY, fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: isSidebarOpen ? 280 : 0, 
        background: DARK_NAVY, 
        color: "#fff", 
        transition: "width 0.3s ease", 
        overflow: "hidden", 
        display: "flex", 
        flexDirection: "column",
        position: isMobile ? "fixed" : "relative",
        height: "100vh",
        zIndex: 1000,
        boxShadow: isMobile ? "10px 0 30px rgba(0,0,0,0.2)" : "none"
      }}>
        <div style={{ padding: "30px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: GOLD, padding: 8, borderRadius: 10 }}>
            <Building2 size={24} color="#fff" />
          </div>
          <div style={{ display: isSidebarOpen ? "block" : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>LIVIPRO <span style={{ fontWeight: 400, opacity: 0.7 }}>B2B</span></div>
            <div style={{ fontSize: 10, color: GOLD, fontWeight: 800, textTransform: "uppercase" }}>Master Hub System</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px 16px" }}>
          {currentMenu.map((item, idx) => (
            <Link key={idx} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                padding: "14px 16px", 
                borderRadius: 14, 
                marginBottom: 4, 
                cursor: "pointer",
                background: location.pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                color: location.pathname === item.path ? GOLD : "#94a3b8",
                fontWeight: 700,
                fontSize: 14,
                border: location.pathname === item.path ? `1px solid rgba(245,158,11,0.2)` : '1px solid transparent'
              }}>
                {item.icon}
                <span style={{ display: isSidebarOpen ? "block" : "none" }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCircle size={28} color="#94a3b8" />
            </div>
            <div style={{ display: isSidebarOpen ? "block" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Mamadou Diallo</div>
              <div style={{ fontSize: 10, color: VISION_GREEN, fontWeight: 700 }}>VERIFIED OWNER</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ width: "100%", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "none", padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
          >
            <LogOut size={18} /> {isSidebarOpen && "Déconnexion"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: isMobile ? "100%" : "calc(100vw - 280px)" }}>
        
        {/* TOPNAV */}
        <header style={{ 
          height: 70, 
          background: "#fff", 
          borderBottom: "1px solid #e2e8f0", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 900
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: "none", border: "none", color: DARK_NAVY }}>
                <Menu size={24} />
              </button>
            )}
            <h1 style={{ fontSize: 18, fontWeight: 900, color: DARK_NAVY }}>{title}</h1>
          </div>

          <div style={{ display: isMobile ? "none" : "flex", alignItems: "center", gap: 24 }}>
            <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, width: 300 }}>
              <Search size={18} color="#94a3b8" />
              <input placeholder="Recherche globale LiviPro..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: "100%" }} />
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={20} color="#64748b" />
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </div>
            <button style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              Mode Production <ChevronRight size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? "20px" : "32px", 
          maxWidth: isMobile ? "100%" : 1400, 
          margin: isMobile ? "0" : "0 auto",
          width: "100%"
        }}>
          {children}
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }} 
        />
      )}
    </div>
  );
}
