import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from './components/Toast';
import { useIsTablet } from './hooks/useMediaQuery';
import {
  Package,
  Search,
  ShoppingCart,
  ArrowLeft,
  Tag,
  MoreVertical,
  Plus,
  Box,
  Truck,
  TrendingDown,
  Building2,
  Users,
  MapPin,
  Sparkles,
  Layers,
  Loader2,
  Filter,
  BarChart3,
  Globe,
  Navigation,
  ShieldCheck,
  Zap,
  Send,
  Thermometer,
  Mic,
  LayoutDashboard,
  BrainCircuit,
  PieChart,
  MessageSquare,
  PhoneCall
} from "lucide-react";
import LiviFleetManager from "./LiviFleetManager";
import LiviBranchManager from "./LiviBranchManager";
import LiviDirectory from "./LiviDirectory";
import LiviVoice from "./LiviVoice";
import LiviGreen from "./LiviGreen";
import LiviCommunity from "./LiviCommunity";
import MapView from "./components/MapView";
import { useProducts, useGroupageOffers, useRealtimeOrders } from "./useLiviData";
import DashboardShell from "./components/DashboardShell";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabase";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 24,
    padding: 'clamp(16px, 3vw, 24px)',
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
    ...style
  }}>
    {children}
  </div>
);

export default function SalesPortal() {
  const { toast } = useToast();
  const isTablet = useIsTablet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") || "catalog");
  const { user } = useAuth();
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const realtimeOrders = useRealtimeOrders(user?.id);
  const [updating, setUpdating] = useState(false);

  const { data: productsData, loading: productsLoading } = useProducts();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('livi_shared_catalog');
    if (saved) {
      setInventory(JSON.parse(saved));
    } else {
      setInventory(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && v !== view) setView(v);
  }, [searchParams]);

  const handleNav = (v) => {
    setView(v);
    setSearchParams({ view: v });
  };

  const handleCommand = (cmd) => {
    if (cmd.action === 'LOGISTIQUE') handleNav('fleet');
    else if (cmd.action === 'COMMANDE') handleNav('catalog');
  };

  const navTabs = [
    { id: "community", label: "LiviCommunity™", icon: <MessageSquare size={16} /> },
    { id: "orders", label: "📦 Commandes Reçues", icon: <ShoppingCart size={16} /> },
    { id: "market_expert", label: "🏷️ LiviMarket™ Expert", icon: <Sparkles size={16} /> },
    { id: "catalog", label: "Inventaire", icon: <Package size={16} /> },
    { id: "fleet", label: "Suivi Flotte", icon: <Truck size={16} /> },
    { id: "branches", label: "Multi-Succursales", icon: <Building2 size={16} /> },
    { id: "green", label: "ColdChain", icon: <Thermometer size={16} /> },
    { id: "directory", label: "Portefeuille Clients", icon: <Users size={16} /> }
  ];

  const [promoForm, setPromoForm] = useState(null); // { productId, price, tag, imageUrl }

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) toast.error("Erreur: " + error.message);
    setUpdating(false);
  };

  const HeaderStats = () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 'clamp(12px, 3vw, 24px)',
      marginBottom: 'clamp(20px, 4vw, 32px)'
    }}>
      <Card style={{ background: DARK_NAVY, color: "#fff" }}>
        <div style={{ fontSize: 11, color: GOLD, fontWeight: 800 }}>CAPEX DISTRIBUTEUR</div>
        <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900 }}>452.8M F</div>
      </Card>
      <Card>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>PERF LOGISTIQUE</div>
        <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: VISION_GREEN }}>96.2%</div>
      </Card>
      <Card>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>INDICE CHAÎNE FROID</div>
        <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: GOLD }}>
          2.4°C <span style={{ fontSize: 14, color: "#94a3b8" }}>Moyen</span>
        </div>
      </Card>
    </div>
  );

  return (
    <DashboardShell title="Logistique & Ventes Grossiste" role="grossiste">
      <HeaderStats />

      {/* NAV TABS — horizontal scroll on mobile */}
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
        {navTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleNav(tab.id)}
            style={{
              background: view === tab.id ? DARK_NAVY : "#fff",
              color: view === tab.id ? "#fff" : "#64748b",
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
          <LiviVoice onCommand={handleCommand} />
        </div>
      )}

      {/* CONTENT PANEL */}
      <div style={{
        background: "#fff",
        borderRadius: 'clamp(16px, 3vw, 28px)',
        padding: 'clamp(16px, 4vw, 32px)',
        border: "1px solid #e2e8f0",
        boxShadow: "0 20px 60px rgba(0,0,0,0.02)",
        maxWidth: "100%",
        overflowX: "auto"
      }}>
        {view === "community" && <LiviCommunity />}
        {view === "orders" && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Gestion des Flux Entrants</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {realtimeOrders.map(order => (
                <Card key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `6px solid ${order.status === 'pending' ? GOLD : VISION_GREEN}` }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>#{order.order_number}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Client: {order.buyer?.name || 'Boutiquier LiviPro'}</div>
                    <div style={{ fontWeight: 800, color: DARK_NAVY, marginTop: 4 }}>{order.total_amount.toLocaleString()} FCFA</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 8,
                      background: order.status === 'pending' ? '#fffbeb' : '#ecfdf5',
                      color: order.status === 'pending' ? GOLD : VISION_GREEN
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                    {order.status === 'pending' && (
                      <button 
                        disabled={updating}
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        style={{ background: VISION_GREEN, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Valider & Préparer
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 10 }}>
                         <div style={{ display: 'flex', gap: 10 }}>
                            <button 
                              onClick={() => toast.success(`Dispatch : Commande #${order.order_number} envoyée vers LiviFleet. Un livreur va être assigné automatiquement.`)}
                              style={{ background: DARK_NAVY, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <Truck size={14} /> Ré-assigner
                            </button>
                            <button 
                              disabled={updating}
                              onClick={() => updateOrderStatus(order.id, 'delivering')}
                              style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}
                            >
                                Forcer Collecte
                            </button>
                         </div>
                         <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 14, border: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: '#0369a1', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                               <Building2 size={12} /> LIVREUR EN ROUTE VERS DÉPÔT
                            </div>
                            <button 
                              onClick={() => window.open(`tel:${order.driver_phone || '+221770000000'}`, '_self')}
                              style={{ width: '100%', background: '#0369a1', color: '#fff', border: 'none', padding: '8px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}
                            >
                               <PhoneCall size={14} /> CONTACTER CHAUFFEUR
                            </button>
                            <div style={{ height: 80, borderRadius: 10, overflow: 'hidden' }}>
                               <MapView />
                            </div>
                         </div>
                      </div>
                    )}
                    {order.status === 'delivering' && (
                       <div style={{ width: '100%', marginTop: 12 }}>
                          <button 
                            onClick={() => window.open(`tel:${order.driver_phone || '+221770000000'}`, '_self')}
                            style={{ width: '100%', background: VISION_GREEN, color: '#fff', border: 'none', padding: '10px', borderRadius: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
                          >
                             <PhoneCall size={18} /> CONTACTER CAMION EN MISSION
                          </button>
                          <div style={{ marginTop: 8, height: 80, borderRadius: 10, overflow: 'hidden' }}>
                             <MapView />
                          </div>
                       </div>
                    )}
                  </div>
                </Card>
              ))}
              {realtimeOrders.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  Aucune commande en attente pour le moment.
                </div>
              )}
            </div>
          </div>
        )}
        {view === "catalog" && (
          <div className="animate-fade-in">
            <h2 style={{
              fontSize: 'clamp(16px, 3vw, 24px)',
              fontWeight: 900,
              marginBottom: 'clamp(14px, 3vw, 24px)'
            }}>
              Inventaire Centralisé
            </h2>
            {/* Responsive table */}
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>PRODUIT</th>
                    <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>STOCK RÉEL</th>
                    <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>📦 LIVIPREDICT™ (IA)</th>
                    <th style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 800 }}>
                         {p.name}
                         {p.stock < 50 && <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 900 }}>⚠️ RUPTURE IMMINENTE</div>}
                      </td>
                      <td style={{ padding: "clamp(10px, 2vw, 16px)", fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 700 }}>
                         <span style={{ color: p.stock < 100 ? '#ef4444' : DARK_NAVY }}>{p.stock} UN</span>
                      </td>
                      <td style={{ padding: "clamp(10px, 2vw, 16px)" }}>
                         <div style={{ fontSize: 12, fontWeight: 900, color: VISION_GREEN }}>Rupture dans {Math.floor(p.stock / 20)} Jours</div>
                         <div style={{ height: 4, width: 60, background: '#f1f5f9', borderRadius: 2, marginTop: 4 }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (p.stock / 500) * 100)}%`, background: VISION_GREEN }} />
                         </div>
                      </td>
                      <td style={{ padding: "clamp(10px, 2vw, 16px)" }}>
                         {p.stock < 100 && (
                            <button 
                              onClick={() => toast.info(`IA RESTOCK : Commande de ${500 - p.stock} sacs envoyée au producteur.`)}
                              style={{ background: '#fdf2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 950, cursor: 'pointer' }}
                            >
                               RÉAPPRO. IA
                            </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {view === "market_expert" && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900 }}>Marketplace & Promotion</h2>
                <div style={{ fontSize: 13, background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: 10, fontWeight: 800 }}>LIVE EXPO</div>
             </div>

             {promoForm ? (
                <Card style={{ background: '#f8fafc', border: `2px dashed ${GOLD}`, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900 }}>🚀 Publier une Offre B2B</h3>
                    <button onClick={() => setPromoForm(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}>Annuler</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: 24 }}>
                    {/* Visual part: Upload & Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <label style={{ fontSize: 13, fontWeight: 900, color: DARK_NAVY }}>MULTIMÉDIA PRODUIT</label>
                       <div style={{ 
                        width: '100%', 
                        height: 200, 
                        background: '#fff', 
                        borderRadius: 20, 
                        border: '2px dashed #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                       }}>
                          {promoForm.imageUrl ? (
                            <img src={promoForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                               <Plus size={32} color="#94a3b8" />
                               <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, fontWeight: 700 }}>PRENDRE OU SÉLECTIONNER PHOTO</div>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            capture="environment"
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setPromoForm({...promoForm, imageUrl: reader.result});
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                       </div>
                    </div>

                    {/* Data part: Price, Tags, Comments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                       <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8 }}>PRIX PROMOTIONNEL (FCFA)</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 14500" 
                            style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 16, fontWeight: 800 }}
                            onChange={e => setPromoForm({...promoForm, price: e.target.value})}
                          />
                       </div>
                       <div>
                          <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8 }}>TAG D'EXPOSITION</label>
                          <select 
                            style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, fontWeight: 700 }}
                            onChange={e => setPromoForm({...promoForm, tag: e.target.value})}
                          >
                             <option value="FLASH">⚡ Vente Flash</option>
                             <option value="NEW">✨ Nouveauté</option>
                             <option value="BEST">🔥 Top Débit</option>
                          </select>
                       </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                     <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8 }}>COMMENTAIRES OU TEXTE PROMO (POUR LES BOUTIQUES)</label>
                     <textarea 
                        placeholder="Ex: Arrivage exceptionnel qualité Premium. Livraison sous 24h garantie." 
                        style={{ width: '100%', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, minHeight: 100, resize: 'none' }}
                        onChange={e => setPromoForm({...promoForm, comments: e.target.value})}
                     />
                  </div>

                  <button 
                    onClick={() => {
                       toast.success("Notification Réseau : Offre publiée avec photo sur LiviMarket™ !");
                       setPromoForm(null);
                    }}
                    style={{ width: '100%', marginTop: 24, background: DARK_NAVY, color: '#fff', padding: 18, borderRadius: 18, fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(15,23,42,0.2)' }}
                  >
                     Propulser l'Offre sur LiviPro
                  </button>
                </Card>
             ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {inventory.map(p => (
                    <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 900 }}>{p.name}</div>
                          <div style={{ fontSize: 10, background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>Stock: {p.stock}</div>
                       </div>
                       <div style={{ fontSize: 18, fontWeight: 950, color: DARK_NAVY }}>{p.price.toLocaleString()} F</div>
                       <button 
                        onClick={() => setPromoForm({ productId: p.id, price: p.price, tag: 'FLASH', imageUrl: '' })}
                        style={{ marginTop: 10, background: GOLD, color: DARK_NAVY, border: 'none', padding: '10px', borderRadius: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                       >
                          <Zap size={14} /> Exposer & Promouvoir
                       </button>
                    </Card>
                  ))}
               </div>
             )}
          </div>
        )}
        {view === "branches" && <LiviBranchManager />}
        {view === "green" && <LiviGreen />}
        {view === "fleet" && <LiviFleetManager />}
        {view === "directory" && <LiviDirectory />}
      </div>
    </DashboardShell>
  );
}
