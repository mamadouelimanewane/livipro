import { useState, useRef } from 'react'
import { CheckCircle, Truck, Package, Banknote, PhoneCall, CheckSquare, ScanBarcode, PenTool, X, MapPin, QrCode, Sparkles, Receipt, AlertTriangle, FileText, Send, ShieldCheck } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import MapView from './components/MapView'
import LiviVision from './LiviVision'
import { useDeliveryTour } from './useLiviData'
import './index.css'

const BRAND_ORANGE = '#f97316'
const DARK_NAVY = '#0f172a'

// Helper pour normaliser les noms de champs (snake_case Supabase vs camelCase local)
function normalizeStop(stop) {
  return {
    id: stop.id || stop.stop_order,
    shopName: stop.shop_name || stop.shopName,
    address: stop.address,
    status: stop.status,
    itemsToDeliver: stop.items_to_deliver || stop.itemsToDeliver || 0,
    expectedCash: stop.expected_cash || stop.expectedCash || 0,
    coords: [stop.lat || 14.6928, stop.lng || -17.4627],
    aiPrediction: stop.ai_prediction || stop.aiPrediction || null
  }
}

export default function DriverApp() {
  const { data: tourData, loading: tourLoading, isFallback } = useDeliveryTour()

  const [completedStops, setCompletedStops] = useState(1)
  const [modalType, setModalType] = useState(null)
  const [damagedItems, setDamagedItems] = useState(0)
  const [upselledItems, setUpselledItems] = useState(0)

  const sigPad = useRef(null)

  // Normaliser les stops
  const stops = (tourData.stops || []).map(normalizeStop)
  const totalStops = tourData.total_stops || tourData.totalStops || 8
  const tourId = tourData.tour_code || tourData.id
  const driverName = tourData.driver_name || tourData.driver || "Chauffeur"
  const cashCollected = tourData.cash_collected || tourData.cashCollected || 0
  const fleetROI = tourData.fleet_roi || tourData.fleetROI || "0 FCFA"

  const currentStop = stops[completedStops] || stops[0] || { shopName: "...", address: "...", itemsToDeliver: 0, expectedCash: 0, coords: [14.6928, -17.4627] }

  const adjustedPrice = currentStop.expectedCash 
    - (damagedItems * 10000)
    + (upselledItems * 10000)

  const handleValidateSignature = () => {
    if (sigPad.current && sigPad.current.isEmpty() && modalType === 'signature') {
      alert("Veuillez faire signer le client avant de valider.")
      return
    }
    alert(`Livraison cl\u00f4tur\u00e9e pour ${currentStop.shopName} !\nTotal factur\u00e9: ${adjustedPrice.toLocaleString()} FCFA`)
    setModalType(null)
    setDamagedItems(0)
    setUpselledItems(0)
    
    if (completedStops < stops.length - 1) {
      setCompletedStops(prev => prev + 1)
    }
  }

  const mapMarkers = stops.map(stop => ({
    position: stop.coords,
    label: stop.shopName
  }))

  const routeCoords = stops.map(stop => stop.coords)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* STATUS BAR (CONNECTED / OFFLINE) */}
      <div style={{ background: isFallback ? '#f59e0b' : '#10b981', color: '#fff', padding: '4px 12px', fontSize: 10, fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {isFallback ? '⚠️ Mode Démo : Pas de connexion Supabase' : '● Connecté au Centre Logistique (Live)'}
      </div>
      {/* HEADER LiviPro B2B */}
      <div style={{ background: DARK_NAVY, padding: '20px 20px 25px', color: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: BRAND_ORANGE, borderRadius: 8, padding: 6, display: 'flex' }}><Truck size={24} color="#fff" /></div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.5px' }}>LiviPro <span style={{ fontWeight: 400, opacity: 0.8 }}>Distri</span></div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Manifeste {tourId}</div>
            </div>
          </div>
          <div onClick={() => setModalType('docs')} style={{ cursor: 'pointer', width: 40, height: 40, background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{driverName.split(' ').map(n => n[0]).join('')}</div>
        </div>

        <div style={{ background: '#1e293b', padding: '16px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Progression Logistique</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{completedStops} / {totalStops} {"arr\u00eats"}</span>
          </div>
          <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completedStops / totalStops) * 100}%`, background: BRAND_ORANGE, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
             <div style={{ fontSize: 11, color: '#94a3b8' }}>{"ROI Flotte Associ\u00e9e"}</div>
             <div style={{ fontSize: 13, color: '#10b981', fontWeight: 800 }}>+{fleetROI} <span style={{ fontSize: 10, opacity: 0.6 }}>(Ce jour)</span></div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 16px 100px', overflowY: 'auto' }}>
        
        {/* CARTE */}
        <div style={{ marginBottom: 24 }}>
           <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color={BRAND_ORANGE} /> Suivi GPS en direct
           </div>
           <MapView center={currentStop.coords} zoom={13} markers={mapMarkers} route={routeCoords} height="150px" />
        </div>

        {/* AI PREDICTION UPSELL */}
        {currentStop.aiPrediction && (
          <div className="animate-slide-up" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 16, padding: '16px', color: '#fff', marginBottom: 20, boxShadow: '0 4px 15px rgba(16,185,129,0.3)', display: 'flex', gap: 12 }}>
            <Sparkles size={24} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Vente Incitative (IA)</div>
              <div style={{ fontSize: 12, lineHeight: 1.4, opacity: 0.9 }}>{currentStop.aiPrediction}</div>
              <button 
                onClick={() => setUpselledItems(5)}
                style={{ background: '#fff', color: '#059669', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, marginTop: 10, cursor: 'pointer' }}
              >
                + Ajouter 5 Cartons
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, background: BRAND_ORANGE, borderRadius: '50%' }} /> Fiche de Livraison
        </div>

        {/* CARTE BOUTIQUE */}
        <div className="animate-slide-up animate-delay-1" style={{ background: '#fff', borderRadius: 20, border: '2px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'inline-block', background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 12, marginBottom: 10 }}>CLIENT #{currentStop.id}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{currentStop.shopName}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>{currentStop.address}</div>
              </div>
              <button style={{ background: '#f1f5f9', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                <PhoneCall size={20} />
              </button>
            </div>
          </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 20px', gap: 16, borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 4 }}><Package size={14} /> {"Exp\u00e9di\u00e9"}</div>
                 <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{currentStop.itemsToDeliver + upselledItems - damagedItems} <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>/ {currentStop.itemsToDeliver} CTN</span></div>
              </div>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 4 }}><Banknote size={14} /> {"Net \u00e0 percevoir"}</div>
                 <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{adjustedPrice.toLocaleString()}</div>
              </div>
           </div>

           <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
             <button onClick={() => setModalType('livivision')} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}>
                <ScanBarcode size={22} /> LiviVision (Scanner Palette IA)
             </button>
             
             <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setModalType('litige')} style={{ flex: 1, background: '#fff', border: '2px dashed #ef4444', color: '#ef4444', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                <AlertTriangle size={18} /> Litige / Refus
              </button>
              <button onClick={() => setModalType('qr')} style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: 'none', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                <QrCode size={18} /> LiviPay B2B
              </button>
            </div>
            
            <button onClick={() => setModalType('livicash')} style={{ width: '100%', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #16a34a', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
               <ShieldCheck size={18} /> {"LiviCash Point (D\u00e9poser Esp\u00e8ces)"}
            </button>
            
            <button onClick={() => setModalType('signature')} style={{ width: '100%', background: BRAND_ORANGE, color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)', cursor: 'pointer' }}>
              <CheckSquare size={20} /> Valider Livraison (Signature)
            </button>
          </div>
        </div>
      </div>

      {/* FLOAT CASH INFO */}
      <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '12px 24px', borderRadius: 30, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0', zIndex: 10 }}>
        <div style={{ background: '#dcfce7', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Banknote size={16} color="#16a34a" /></div>
        <div>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{"Esp\u00e8ces \u00e0 bord (Coffre)"}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{cashCollected.toLocaleString()} F</div>
        </div>
      </div>

      {/* MODALS */}
      {modalType && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="animate-slide-up" style={{ background: '#fff', width: '100%', maxWidth: 480, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setModalType(null)} style={{ position: 'absolute', top: 20, right: 20, background: '#f1f5f9', border: 'none', padding: 8, borderRadius: '50%', display: 'flex', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>

            {modalType === 'signature' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ background: '#f1f5f9', padding: 8, borderRadius: 12 }}><PenTool size={20} color={BRAND_ORANGE} /></div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>Preuve de Livraison (PoD)</h3>
                </div>
                
                <div style={{ background: '#f0fdf4', border: '1px solid #10b981', padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                   <MapPin size={16} color="#10b981" />
                   <div style={{ fontSize: 11, fontWeight: 800, color: '#065f46' }}>{"G\u00c9O-STAMP CERTIFI\u00c9 : Rayon Boutique 20m OK"}</div>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{"Le client certifie la r\u00e9ception de"} {currentStop.itemsToDeliver + upselledItems - damagedItems} cartons conformes.</p>

                <div style={{ border: '2px dashed #cbd5e1', borderRadius: 16, background: '#f8fafc', marginBottom: 16, overflow: 'hidden' }}>
                  <SignatureCanvas ref={sigPad} penColor={DARK_NAVY} canvasProps={{ width: 432, height: 200, className: 'sigCanvas' }} />
                </div>

                <button onClick={handleValidateSignature} style={{ width: '100%', cursor: 'pointer', background: '#16a34a', color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontSize: 14, fontWeight: 800, display: 'flex', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}>
                  <CheckCircle size={20} /> {"Transmettre \u00e0 l'entrep\u00f4t"}
                </button>
              </>
            )}

            {modalType === 'qr' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>Paiement LiviPay B2B</div>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{"Demandez au g\u00e9rant de scanner ce code depuis son t\u00e9l\u00e9phone pour valider le virement directement chez le grossiste."}</p>
                <div style={{ width: 220, height: 220, background: '#f8fafc', border: '4px solid #e2e8f0', borderRadius: 24, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={120} color="#0f172a" />
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', marginTop: 24 }}>{adjustedPrice.toLocaleString()} FCFA</div>
                <button onClick={() => setModalType(null)} style={{ marginTop: 24, cursor: 'pointer', background: '#f1f5f9', color: '#334155', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700 }}>Fermer</button>
              </div>
            )}

            {modalType === 'litige' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ background: '#fee2e2', padding: 8, borderRadius: 12 }}><AlertTriangle size={20} color="#ef4444" /></div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{"D\u00e9clarer un Litige"}</h3>
                </div>
                
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>{"Cartons endommag\u00e9s / refus\u00e9s :"}</div>
                  <input type="number" min="0" max={currentStop.itemsToDeliver} value={damagedItems} onChange={e => setDamagedItems(Number(e.target.value))} style={{ width: '100%', padding: '14px', borderRadius: 12, border: '2px solid #cbd5e1', fontSize: 18, fontWeight: 700, textAlign: 'center' }} />
                </div>
                
                <div style={{ background: '#fef2f2', padding: '16px', borderRadius: 12, border: '1px dashed #fca5a5', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c', fontWeight: 700, fontSize: 14 }}><Receipt size={18} /> {"G\u00e9n\u00e9ration Automatique"}</div>
                  <div style={{ color: '#991b1b', fontSize: 13, marginTop: 4 }}>{"Un \"Avoir Commercial\" sera g\u00e9n\u00e9r\u00e9 et envoy\u00e9 \u00e0 la comptabilit\u00e9 de la boutique."}</div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setModalType(null)} style={{ flex: 1, background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '16px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Annuler</button>
                  <button onClick={() => { if(damagedItems > 0) setModalType('avoir_pdf'); else setModalType(null) }} style={{ flex: 2, background: '#ef4444', color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                    Confirmer le Litige
                  </button>
                </div>
              </>
            )}

            {modalType === 'livicash' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ background: '#dcfce7', width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={32} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>{"Point LiviCash S\u00e9curis\u00e9"}</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{"D\u00e9posez votre collecte d'esp\u00e8ces ("}<b>{cashCollected.toLocaleString()} F</b>{") dans cette boutique associ\u00e9e pour s\u00e9curiser votre tourn\u00e9e."}</p>
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24, textAlign: 'left' }}>
                   <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{"RE\u00c7U BANCAIRE ASSOCI\u00c9"}</div>
                   <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{"D\u00e9p\u00f4t valid\u00e9 par IA"}</div>
                   <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>{"\u2713 Assurance braquage activ\u00e9e"}</div>
                </div>
                <button onClick={() => setModalType(null)} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontSize: 14, fontWeight: 800 }}>{"Confirmer le d\u00e9p\u00f4t (LiviWallet)"}</button>

                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button style={{ background: '#4c6ef5', color: '#fff', border: 'none', padding: 12, borderRadius: 12, fontSize: 11, fontWeight: 800 }}>{"D\u00e9p\u00f4t Wave"}</button>
                  <button style={{ background: '#ff9900', color: '#fff', border: 'none', padding: 12, borderRadius: 12, fontSize: 11, fontWeight: 800 }}>{"D\u00e9p\u00f4t Orange Money"}</button>
                </div>
              </div>
            )}

            {/* VUE: MOCKUP AVOIR PDF */}
            {modalType === 'avoir_pdf' && (
              <div style={{ padding: '0px 10px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} /> {"Avoir g\u00e9n\u00e9r\u00e9 et envoy\u00e9"}
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', position: 'relative' }}>
                  
                  {/* Filigrane discret */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: 48, fontWeight: 900, color: '#f1f5f9', zIndex: 0, opacity: 0.5 }}>COPIE</div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>LIVI<span style={{ color: BRAND_ORANGE }}>PRO</span></div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Logistic Distribution Hub</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>AVOIR COMMERCIAL</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{"N\u00b0 AV-9824-0"}{completedStops}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Client Partenaire</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{currentStop.shopName}</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>{currentStop.address}</div>
                    </div>

                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 24 }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}>{"D\u00e9signation Litige"}</th>
                          <th style={{ padding: '8px 12px' }}>{"Qt\u00e9"}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', borderTopRightRadius: 6, borderBottomRightRadius: 6 }}>Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', color: '#0f172a', fontWeight: 600 }}>{"Casse D\u00e9chargement"}</td>
                          <td style={{ padding: '12px', color: '#ef4444', fontWeight: 700 }}>{damagedItems} CTN</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#ef4444' }}>- {(damagedItems * 10000).toLocaleString()} F</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#fff', padding: '16px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Nouveau Total Net</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>{adjustedPrice.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                </div>

                <button onClick={() => setModalType(null)} style={{ width: '100%', marginTop: 24, cursor: 'pointer', background: '#f8fafc', color: '#0f172a', border: '2px solid #e2e8f0', padding: '16px', borderRadius: 14, fontSize: 14, fontWeight: 800, display: 'flex', justifyContent: 'center', gap: 8 }}>
                   {"Fermer le re\u00e7u"}
                </button>
              </div>
            )}

            {modalType === 'docs' && (
              <div style={{ padding: '0 10px' }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Mes Documents</h3>
                  {[
                    { type: "Permis de Conduire", status: "Valide", date: "12/2027", color: "#10b981" },
                    { type: "Assurance V\u00e9hicule", status: "Alerte", date: "04/2026", color: "#f59e0b" },
                    { type: "Visite Technique", status: "Valide", date: "09/2026", color: "#10b981" },
                  ].map((doc, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{doc.type}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Expire le : {doc.date}</div>
                       </div>
                       <div style={{ fontSize: 11, fontWeight: 800, color: doc.color, padding: '4px 8px', background: '#fff', borderRadius: 8, border: `1px solid ${doc.color}` }}>{doc.status}</div>
                    </div>
                  ))}
                  <button onClick={() => setModalType(null)} style={{ width: '100%', marginTop: 20, background: DARK_NAVY, color: '#fff', border: 'none', padding: 16, borderRadius: 16, fontWeight: 800 }}>Fermer</button>
              </div>
            )}

          </div>
        </div>
      )}
      {modalType === 'livivision' && <LiviVision onComplete={() => setModalType(null)} />}
    </div>
  )
}
