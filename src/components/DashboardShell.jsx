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
  Wallet,
  MessageSquare,
  ShoppingBag,
  HandCoins,
  ShoppingCart,
  Layout
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function DashboardShell({ children, title, role = "admin" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = {
    admin: [
      { id: "community", label: "Social", icon: <MessageSquare size={22} />, path: "/admin?view=community" },
      { id: "users", label: "Partners", icon: <Users size={22} />, path: "/admin?view=users" },
      { id: "bank", label: "Bank", icon: <Building2 size={22} />, path: "/bank" },
      { id: "track", label: "Admin", icon: <ShieldCheck size={22} />, path: "/admin?view=track" },
    ],
    grossiste: [
      { id: "community", label: "Social", icon: <MessageSquare size={22} />, path: "/sales?view=community" },
      { id: "orders", label: "Flux", icon: <ShoppingCart size={22} />, path: "/sales?view=orders" },
      { id: "fleet", label: "Logistique", icon: <Truck size={22} />, path: "/sales?view=fleet" },
      { id: "catalog", label: "Stock", icon: <Package size={22} />, path: "/sales?view=catalog" },
    ],
    boutique: [
      { id: "community", label: "Social", icon: <MessageSquare size={22} />, path: "/boutique?view=community" },
      { id: "market", label: "Marché", icon: <ShoppingBag size={22} />, path: "/boutique?view=market" },
      { id: "dashboard", label: "Ma Boutique", icon: <Store size={22} />, path: "/boutique?view=dashboard" },
      { id: "wallet", label: "Wallet", icon: <Wallet size={22} />, path: "/boutique?view=wallet" },
    ]
  };

  const handleLogout = () => {
    alert("Déconnexion réussie.");
    window.location.href = "/";
  };

  const currentMenu = menuItems[role] || menuItems.admin;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#f1f5f9",
      color: DARK_NAVY,
      fontFamily: "'Outfit', sans-serif",
      flexDirection: "column"
    }}>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* SIDEBAR (Desktop Only) */}
        {!isMobile && (
          <aside style={{
            width: 280,
            background: DARK_NAVY,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100vh",
            zIndex: 1000
          }}>
            <div style={{ padding: 30, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Building2 size={28} color={GOLD} />
              <div style={{ fontSize: 20, fontWeight: 950 }}>LIVIPRO <span style={{ fontWeight: 400, opacity: 0.6 }}>B2B</span></div>
            </div>
            <nav style={{ flex: 1, padding: "20px 15px" }}>
              {currentMenu.map((item, idx) => (
                <Link key={idx} to={item.path} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, marginBottom: 6,
                    background: location.search.includes(item.id) || location.pathname.includes(item.id) ? "rgba(255,255,255,0.08)" : "transparent",
                    color: location.search.includes(item.id) || location.pathname.includes(item.id) ? GOLD : "#94a3b8",
                    fontWeight: 800, fontSize: 14, transition: 'all 0.2s'
                  }}>
                    {item.icon} {item.label}
                  </div>
                </Link>
              ))}
            </nav>
            <div style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: 14, borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>
                <LogOut size={18} /> Déconnexion
              </button>
            </div>
          </aside>
        )}

        {/* MAIN AREA */}
        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          paddingBottom: isMobile ? 80 : 0 // Leave room for bottom nav
        }}>
          {/* HEADER (Sticky) */}
          <header style={{
            height: isMobile ? 64 : 72,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            position: "sticky",
            top: 0,
            zIndex: 900,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isMobile && <div style={{ background: DARK_NAVY, padding: 6, borderRadius: 8 }}><Building2 size={20} color={GOLD} /></div>}
              <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 950, margin: 0 }}>{title}</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color="#64748b" />
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '6px 12px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <UserCircle size={20} color="#94a3b8" />
                  <span style={{ fontSize: 13, fontWeight: 800 }}>Admin LiviPro</span>
                </div>
              )}
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div style={{ padding: 'clamp(12px, 4vw, 32px)', flex: 1 }}>
            {children}
          </div>
        </main>
      </div>

      {/* BOTTOM NAV (Mobile Only) */}
      {isMobile && (
        <nav className="mobile-nav-bar">
          {currentMenu.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.path} 
              className={`mobile-nav-item ${location.search.includes(item.id) || location.pathname.includes(item.id) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0 }} className="mobile-nav-item">
            <LogOut size={22} />
            <span>Sortie</span>
          </button>
        </nav>
      )}
    </div>
  );
}
