import { useState, useRef, useEffect } from 'react'
import { useToast } from './components/Toast'
import { CheckCircle, Truck, Package, Banknote, PhoneCall, CheckSquare, ScanBarcode, PenTool, X, MapPin, QrCode, Sparkles, Receipt, AlertTriangle, FileText, Send, ShieldCheck, UserCircle } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import MapView from './components/MapView'
import LiviVision from './LiviVision'
import { useDeliveryTour } from './useLiviData'
import './index.css'

const BRAND_ORANGE = '#f97316'
const DARK_NAVY = '#0f172a'

export default function DriverApp() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [completedStops, setCompletedStops] = useState(0);
  const [modalType, setModalType] = useState(null);
  const sigPad = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('livi_pending_orders');
    if (saved) {
      setOrders(JSON.parse(saved).filter(o => o.status !== 'Livré'));
    }
  }, []);

  const finalizeDelivery = (orderId) => {
    const all = JSON.parse(localStorage.getItem('livi_pending_orders') || '[]');
    const updated = all.map(o => o.id === orderId ? { ...o, status: 'Livré' } : o);
    localStorage.setItem('livi_pending_orders', JSON.stringify(updated));
    setOrders(updated.filter(o => o.status !== 'Livré'));
    setCompletedStops(prev => prev + 1);
    setModalType(null);
    toast.success("Livraison confirmée et synchronisée avec le portail boutique !");
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
       <div style={{ background: DARK_NAVY, padding: '25px 20px', color: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: BRAND_ORANGE, borderRadius: 12, padding: 8 }}><Truck size={24} color="#fff" /></div>
                <div>
                   <div style={{ fontSize: 18, fontWeight: 950 }}>LiviPro <span style={{ fontWeight: 400, opacity: 0.8 }}>Distri</span></div>
                   <div style={{ fontSize: 12, opacity: 0.7 }}>Manifeste #DNR-9812</div>
                </div>
             </div>
             <UserCircle size={32} color="#94a3b8" />
          </div>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: 20 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Tournée en cours</span>
                <span style={{ fontSize: 13, fontWeight: 900 }}>{completedStops} / {orders.length + completedStops} Livraisons</span>
             </div>
             <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: orders.length + completedStops > 0 ? `${(completedStops / (orders.length + completedStops)) * 100}%` : '0%', background: BRAND_ORANGE, transition: 'width 0.5s ease' }} />
             </div>
          </div>
       </div>

       <div style={{ padding: 20, flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20 }}>File d'attente Logistique</h3>
          {orders.length > 0 ? orders.map(order => (
             <div key={order.id} style={{ background: "#fff", padding: 20, borderRadius: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                   <div>
                      <div style={{ fontSize: 15, fontWeight: 900 }}>{order.product}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>ID: {order.id} · Montant: {order.price.toLocaleString()} F</div>
                   </div>
                   <div style={{ background: "#fff7ed", padding: "8px", borderRadius: 12, color: BRAND_ORANGE }}><Package size={20} /></div>
                </div>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 14, fontSize: 12, color: "#64748b", marginBottom: 20 }}>
                   <MapPin size={14} style={{ marginRight: 6 }} /> Dakar Plateau (Secteur 2)
                </div>
                <button 
                   onClick={() => setModalType(order.id)}
                   style={{ width: "100%", background: BRAND_ORANGE, color: "#fff", border: "none", padding: "12px", borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                   Démarrer Livraison
                </button>
             </div>
          )) : (
             <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                <ShieldCheck size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>Aucune nouvelle commande en attente.</p>
             </div>
          )}
       </div>

       {modalType && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
             <div style={{ background: "#fff", width: "100%", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32 }}>
                <h3 style={{ fontSize: 22, fontWeight: 950, marginBottom: 12, textAlign: "center" }}>Confirmation de Livraison</h3>
                <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 30 }}>Veuillez faire signer le client pour valider le transfert de responsabilité.</p>
                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 20, height: 200, marginBottom: 30 }}>
                    <SignatureCanvas 
                      ref={sigPad}
                      penColor={DARK_NAVY} 
                      canvasProps={{ width: 420, height: 200, className: 'sigCanvas' }} 
                    />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                   <button onClick={() => setModalType(null)} style={{ flex: 1, background: "#f1f5f9", border: "none", padding: 16, borderRadius: 16, fontWeight: 800, cursor: "pointer" }}>Annuler</button>
                   <button onClick={() => finalizeDelivery(modalType)} style={{ flex: 2, background: BRAND_ORANGE, color: "#fff", border: "none", padding: 16, borderRadius: 16, fontWeight: 900, cursor: "pointer" }}>Valider Livraison</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
