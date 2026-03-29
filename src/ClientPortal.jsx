import { useState, useEffect } from 'react'
import LiviAcademy from './LiviAcademy'
import LiviMarket from './LiviMarket'
import LiviCommunity from './LiviCommunity'
import LiviShield from './LiviShield'
import LiviTontine from './LiviTontine'
import { BellRing, PackageSearch, BatteryCharging, ShoppingCart, CheckCircle2, ChevronRight, Zap, Wallet, Search, ArrowLeft, Users, Mic, Heart, Star, Truck, MoreVertical, Box, Layers, History, ShieldCheck, Settings as SettingsIcon, Send, Receipt, Calculator, CreditCard, GraduationCap, LayoutDashboard, BrainCircuit, Globe, ShoppingBag, MessageSquare, ShieldAlert, Coins } from 'lucide-react'
import { useGroupageOffers, useMembers, useProducts, placeOrder } from './useLiviData'
import DashboardShell from "./components/DashboardShell";
import { useSearchParams } from "react-router-dom";
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 24,
    padding: 'clamp(16px, 3vw, 24px)',
    border: "1px solid #f1f5f9",
    boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
    ...style
  }}>
    {children}
  </div>
);

export default function ClientPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("view") || "market");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [salesRecord, setSalesRecord] = useState(parseInt(localStorage.getItem('livi_total_sales') || '1280000'));

  const { user } = useAuth();
  const [realOrders, setRealOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    setFetchingOrders(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setRealOrders(data);
    setFetchingOrders(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user, activeTab]);

  const handleOrder = async (product) => {
    if (!user) return alert("Veuillez vous connecter");
    
    setLoading(true);
    const result = await placeOrder({
      buyer_id: user.id,
      seller_id: product.wholesaler_id || 'b2000001-0000-0000-0000-000000000001',
      total_amount: product.price,
      delivery_address: user.location || "Adresse par défaut"
    }, [
      { ...product, quantity: 1 }
    ]);
    setLoading(false);

    if (result.success) {
      alert(`LiviMarket Certifié : Commande ${result.order.order_number} créée pour ${product.name}.`);
      fetchOrders();
      handleTabChange('dashboard');
    } else {
      alert("Erreur lors de la commande: " + result.error);
    }
  };

  const finalizeSale = () => {
    alert(`Vente de proximité enregistrée !`);
  };

  const tabs = [
    { id: "community", label: "LiviCommunity™", icon: <MessageSquare size={16} /> },
    { id: "market", label: "Marketplace B2B", icon: <ShoppingBag size={16} /> },
    { id: "tontine", label: "LiviTontine™", icon: <Coins size={16} /> },
    { id: "shield", label: "E-Garantie LiviShield™", icon: <ShieldCheck size={16} /> },
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "pos", label: "LiviPOS (Caisse)", icon: <Calculator size={16} /> },
    { id: "predict", label: "IA Inventaire", icon: <BrainCircuit size={16} /> },
    { id: "wallet", label: "Fintech InterOp", icon: <Globe size={16} /> },
    { id: "academy", label: "Academy", icon: <GraduationCap size={16} /> }
  ];

  return (
    <DashboardShell
      title={activeTab === 'market' ? 'LiviMarket™ : Marketplace B2B' : 'Cockpit Boutique Partenaire'}
      role="boutique"
    >
      {/* KPI CARDS — responsive grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 'clamp(12px, 3vw, 24px)',
        marginBottom: 'clamp(20px, 4vw, 32px)'
      }}>
        <Card style={{ background: DARK_NAVY, color: "#fff" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 800 }}>Ventes (7j)</div>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900 }}>
            {salesRecord.toLocaleString()} F
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>KARMA LOGISTIQUE</div>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: VISION_GREEN }}>
            942 <span style={{ fontSize: 14, color: "#94a3b8" }}>/ 1000</span>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>CAPACITÉ CRÉDIT IA</div>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900 }}>5.0M FCFA</div>
        </Card>
      </div>

      {/* TABS — horizontal scroll on mobile */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 'clamp(20px, 4vw, 30px)',
        overflowX: "auto",
        paddingBottom: 8,
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              background: activeTab === tab.id ? DARK_NAVY : "#fff",
              color: activeTab === tab.id ? "#fff" : "#64748b",
              border: "1px solid #e2e8f0",
              padding: "clamp(8px, 2vw, 10px) clamp(14px, 3vw, 20px)",
              borderRadius: 12,
              fontSize: 'clamp(11px, 2vw, 13px)',
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 44,
              touchAction: "manipulation",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          style={{
            background: isVoiceActive ? GOLD : "#fff",
            color: DARK_NAVY,
            border: isVoiceActive ? "none" : "1px solid #e2e8f0",
            padding: "clamp(8px, 2vw, 10px) clamp(14px, 3vw, 20px)",
            borderRadius: 12,
            fontSize: 'clamp(11px, 2vw, 13px)',
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
            minHeight: 44,
            touchAction: "manipulation",
            flexShrink: 0
          }}
        >
          <Mic size={16} /> {isVoiceActive ? "Fermer Voix" : "LiviVoice"}
        </button>
      </div>

      {isVoiceActive && (
        <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <LiviVoice onCommand={({ action, entity }) => {
            if (action === 'COMMANDE') handleTabChange('market');
          }} />
        </div>
      )}

      {/* CONTENT PANEL */}
      <div style={{
        background: "#fff",
        borderRadius: 'clamp(16px, 3vw, 32px)',
        padding: 'clamp(16px, 4vw, 40px)',
        border: "1px solid #f1f5f9",
        boxShadow: "0 20px 60px rgba(0,0,0,0.02)",
        maxWidth: "100%",
        overflowX: "auto"
      }}>
        {activeTab === "community" && <LiviCommunity />}
        {activeTab === "tontine" && <LiviTontine />}
        {activeTab === "shield" && <LiviShield />}
        {activeTab === "market" && <LiviMarket onOrder={handleOrder} />}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            <h3 style={{
              fontSize: 'clamp(16px, 3vw, 22px)',
              fontWeight: 950,
              marginBottom: 'clamp(14px, 3vw, 24px)'
            }}>
              Suivi des Flux Commandés
            </h3>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {/* Responsive table wrapper */}
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>ID ORDRE</th>
                      <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>PRODUIT</th>
                      <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>STATUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realOrders.map((o, i) => (
                      <tr key={o.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 13, fontWeight: 900 }}>{o.order_number}</td>
                        <td style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 14 }}>
                          {o.order_items?.[0]?.product_name || 'Commande multiple'}
                        </td>
                        <td style={{ padding: "clamp(10px, 2vw, 16px)" }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 900,
                            background: o.status === "delivered" ? "#ecfdf5" : "#fffbeb",
                            color: o.status === "delivered" ? VISION_GREEN : GOLD,
                            padding: "4px 10px",
                            borderRadius: 8,
                            whiteSpace: "nowrap"
                          }}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {realOrders.length === 0 && !fetchingOrders && (
                      <tr>
                        <td colSpan="3" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                          Aucune commande trouvée. Explorez le Market !
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
        {activeTab === "pos" && (
          <div style={{ textAlign: "center", padding: 'clamp(32px, 8vw, 60px)' }}>
            <Calculator size={48} style={{ opacity: 0.2, margin: "0 auto 20px", display: "block" }} />
            <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 900 }}>Terminal de Vente Local</h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 10 }}>Module de caisse prêt pour les ventes au détail.</p>
            <button
              onClick={finalizeSale}
              style={{
                marginTop: 20,
                background: DARK_NAVY,
                color: "#fff",
                border: "none",
                padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)",
                borderRadius: 12,
                fontWeight: 800,
                minHeight: 48,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Démarrer Vente
            </button>
          </div>
        )}
        {activeTab === "predict" && <LiviPredict />}
        {activeTab === "wallet" && <LiviFintech />}
        {activeTab === "academy" && <LiviAcademy />}
      </div>
    </DashboardShell>
  );
}
