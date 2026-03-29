import { useState, useRef, useEffect } from 'react'
import { CheckCircle, Truck, Package, Banknote, PhoneCall, CheckSquare, ScanBarcode, PenTool, X, MapPin, QrCode, Sparkles, Receipt, AlertTriangle, FileText, Send, ShieldCheck, UserCircle, Navigation, Building2 } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import MapView from './components/MapView'
import LiviVision from './LiviVision'
import { useDeliveryTour, updateWalletBalance } from './useLiviData'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'
import './index.css'

const BRAND_ORANGE = '#f97316'
const DARK_NAVY = '#0f172a'

export default function DriverApp() {
  const [orders, setOrders] = useState([]);
  const [completedStops, setCompletedStops] = useState(0);
  const [modalType, setModalType] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const sigPad = useRef(null);

  const { user } = useAuth();
  const [fetching, setFetching] = useState(false);

  const fetchDeliveringOrders = async () => {
    setFetching(true);
    const { data } = await supabase
      .from('orders')
      .select('*, buyer:members(name, location)')
      .eq('status', 'delivering')
      .order('created_at', { ascending: true });
    if (data) setOrders(data);
    setFetching(false);
  };

  useEffect(() => {
    fetchDeliveringOrders();
    
    // Abonnement aux nouvelles livraisons
    const channel = supabase.channel('driver-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new.status === 'delivering' || payload.old.status === 'delivering') {
          fetchDeliveringOrders();
        }
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const finalizeDelivery = async (orderId) => {
    setFetching(true);
    // 1. Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'delivered', 
        delivered_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      // 2. Refresh list
      await fetchDeliveringOrders();
      setCompletedStops(prev => prev + 1);
      setModalType(null);
      alert("LiviPro : Livraison confirmée et archivée. Karma +10.");
    }
    setFetching(false);
  };

  return (
    <div style={{
      maxWidth: "100%",
      width: "100%",
      margin: '0 auto',
      background: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* HEADER */}
      <div style={{
        background: DARK_NAVY,
        padding: 'clamp(16px, 4vw, 25px) clamp(14px, 4vw, 20px)',
        color: '#fff',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: BRAND_ORANGE, borderRadius: 12, padding: 8, flexShrink: 0 }}>
              <Truck size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 950 }}>
                LiviPro <span style={{ fontWeight: 400, opacity: 0.8 }}>Distri</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Manifeste #DNR-9812</div>
            </div>
          </div>
          <UserCircle size={32} color="#94a3b8" style={{ flexShrink: 0 }} />
        </div>

        {/* Progress bar */}
        <div style={{ background: '#1e293b', padding: 'clamp(12px, 3vw, 16px)', borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Tournée en cours</span>
            <span style={{ fontSize: 13, fontWeight: 900 }}>
              {completedStops} / {orders.length + completedStops} Livraisons
            </span>
          </div>
          <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: orders.length + completedStops > 0
                ? `${(completedStops / (orders.length + completedStops)) * 100}%`
                : '0%',
              background: BRAND_ORANGE,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div style={{ padding: 'clamp(14px, 4vw, 20px)', flex: 1 }}>
        <h3 style={{
          fontSize: 'clamp(14px, 3vw, 16px)',
          fontWeight: 900,
          marginBottom: 'clamp(14px, 3vw, 20px)'
        }}>
          File d'attente Logistique
        </h3>

        {/* Cards grid — stacks to 1 col on narrow screens */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(10px, 3vw, 16px)'
        }}>
          {orders.length > 0 ? orders.map(order => (
            <div
              key={order.id}
              style={{
                background: "#fff",
                padding: 'clamp(14px, 3vw, 20px)',
                borderRadius: 24,
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                gap: 14
              }}
            >
              {/* Order header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.product}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    ID: {order.id} · {order.price.toLocaleString()} F
                  </div>
                </div>
                <div style={{
                  background: "#fff7ed",
                  padding: "8px",
                  borderRadius: 12,
                  color: BRAND_ORANGE,
                  flexShrink: 0
                }}>
                  <Package size={20} />
                </div>
              </div>

              {/* Location */}
              <div style={{
                background: "#f8fafc",
                padding: 'clamp(8px, 2vw, 12px)',
                borderRadius: 14,
                fontSize: 12,
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <MapPin size={14} style={{ flexShrink: 0 }} />
                {order.buyer?.location || 'Dakar Plateau (Secteur 2)'}
              </div>

                {/* Map & Navigation */}
                <div style={{ position: 'relative', height: 120, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                   <MapView />
                   <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.buyer?.location || 'Dakar')}`, '_blank')}
                        style={{ background: DARK_NAVY, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 10, fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                      >
                         <Navigation size={12} color={BRAND_ORANGE} /> NAVIGATION GPS
                      </button>
                   </div>
                </div>

                {/* CTA buttons — touch-friendly */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setModalType(order.id)}
                    style={{
                      flex: 1,
                      background: BRAND_ORANGE,
                      color: "#fff",
                      border: "none",
                      padding: "clamp(12px, 3vw, 14px)",
                      borderRadius: 14,
                      fontSize: 'clamp(12px, 2.5vw, 13px)',
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      minHeight: 48,
                      touchAction: "manipulation"
                    }}
                  >
                    <QrCode size={18} /> Scanner & Livrer
                  </button>
                  <button
                    onClick={() => window.open(`tel:${order.buyer?.phone || '+221770000000'}`, '_self')}
                    style={{
                      width: 44,
                      background: '#fff',
                      color: BRAND_ORANGE,
                      border: `2px solid ${BRAND_ORANGE}`,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      title: "Appeler Boutique"
                    }}
                  >
                    <PhoneCall size={18} />
                  </button>
                  <button
                    onClick={() => window.open(`tel:+221771112233`, '_self')} // Fixed Depot Number
                    style={{
                      width: 44,
                      background: DARK_NAVY,
                      color: '#fff',
                      border: "none",
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      title: "Appeler Dépôt"
                    }}
                  >
                    <Building2 size={18} />
                  </button>
                </div>
            </div>
          )) : (
            <div style={{
              textAlign: "center",
              padding: 'clamp(32px, 8vw, 60px)',
              color: "#94a3b8",
              gridColumn: "1 / -1"
            }}>
              <ShieldCheck size={48} style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }} />
              <p style={{ fontSize: 14 }}>Aucune nouvelle commande en attente.</p>
            </div>
          )}
        </div>
      </div>

      {/* SIGNATURE MODAL — sheet from bottom */}
      {modalType && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "flex-end"
        }}>
          <div style={{
            background: "#fff",
            width: "100%",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 'clamp(20px, 5vw, 32px)',
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{
              fontSize: 'clamp(18px, 4vw, 22px)',
              fontWeight: 950,
              marginBottom: 8,
              textAlign: "center"
            }}>
              Confirmation de Livraison
            </h3>
            <p style={{
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              color: "#64748b",
              textAlign: "center",
              marginBottom: 'clamp(16px, 4vw, 30px)'
            }}>
              Veuillez saisir le **code OTP du client** et faire signer pour certifier le transfert sur la **LiviChain™**.
            </p>

            {/* OTP Input Field */}
            <div style={{ marginBottom: 24 }}>
               <label style={{ fontSize: 11, fontWeight: 900, color: BRAND_ORANGE, display: 'block', textAlign: 'center', marginBottom: 8 }}>CODE OTP RÉCEPTION (4 CHIFFRES)</label>
               <input 
                  type="text" 
                  maxLength="4"
                  placeholder="0 0 0 0"
                  style={{ width: '100%', padding: 16, borderRadius: 16, border: '2px solid #e2e8f0', textAlign: 'center', fontSize: 24, fontWeight: 900, letterSpacing: 10, outline: 'none' }}
                  onChange={e => setOtpCode(e.target.value)}
               />
            </div>

            {/* Signature canvas — responsive width */}
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: 20,
              height: 'clamp(160px, 35vw, 200px)',
              marginBottom: 'clamp(16px, 4vw, 30px)',
              overflow: "hidden"
            }}>
              <SignatureCanvas
                ref={sigPad}
                penColor={DARK_NAVY}
                onEnd={() => setHasSigned(true)}
                canvasProps={{
                  style: { width: "100%", height: "100%" },
                  className: 'sigCanvas'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', padding: 12, borderRadius: 14, marginBottom: 24 }}>
               <ShieldCheck size={18} color="#10b981" />
               <div style={{ fontSize: 11, color: '#065f46', fontWeight: 800 }}>CERTIFICATION BLOCKCHAIN : LIVICHAIN™ READY</div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => { setModalType(null); setHasSigned(false); }}
                style={{
                  flex: 1,
                  minWidth: 100,
                  background: "#f1f5f9",
                  border: "none",
                  padding: 'clamp(12px, 3vw, 16px)',
                  borderRadius: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  minHeight: 48,
                  fontSize: 14
                }}
              >
                Annuler
              </button>
              <button
                disabled={!hasSigned || otpCode.length < 4 || fetching}
                onClick={() => finalizeDelivery(modalType)}
                style={{
                  flex: 2,
                  minWidth: 160,
                  background: (!hasSigned || otpCode.length < 4) ? '#94a3b8' : BRAND_ORANGE,
                  color: "#fff",
                  border: "none",
                  padding: 'clamp(12px, 3vw, 16px)',
                  borderRadius: 16,
                  fontWeight: 900,
                  cursor: (!hasSigned || otpCode.length < 4) ? 'not-allowed' : 'pointer',
                  minHeight: 48,
                  fontSize: 14
                }}
              >
                {!hasSigned ? "SIGNATURE REQUISE" : otpCode.length < 4 ? "ENTRER OTP" : "SCELLER LA LIVRAISON"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
