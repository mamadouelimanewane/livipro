import { useState } from "react";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  ArrowRight,
  Truck,
  History,
  Info
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviTrack() {
  const [activeDelivery] = useState({
    id: "TRK-9821",
    driver: "Cheikh Tidiane",
    vehicle: "Canter DK-921",
    status: "En Livraison",
    progress: 65,
    eta: "14:45",
    checkpoints: [
      { time: "08:15", label: "Déchargement Port", status: "Done", coords: "14.693, -17.444" },
      { time: "09:30", label: "Contrôle Sortie Entrepôt", status: "Done", coords: "14.716, -17.467" },
      { time: "14:12", label: "Proximité Boutique Al-Amine", status: "Current", coords: "14.748, -17.489" },
      { time: "--:--", label: "Signature & Géo-Stamp", status: "Pending", coords: "14.750, -17.490" }
    ]
  });

  return (
    <div style={{ padding: 20, fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900 }}>Géo-Audit 360°</h2>
             <div style={{ fontSize: 11, color: VISION_GREEN, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} /> Traçabilité GPS certifiée
             </div>
          </div>
          <div style={{ background: DARK_NAVY, width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Navigation size={20} color="#fff" />
          </div>
       </div>

       {/* ACTIVE TRACKING CARD */}
       <div style={{ background: '#fff', borderRadius: 24, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: 24, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
             <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: '#f0f9ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Truck size={24} color="#0369a1" />
                </div>
                <div>
                   <div style={{ fontSize: 14, fontWeight: 800 }}>{activeDelivery.driver}</div>
                   <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {activeDelivery.id} · {activeDelivery.vehicle}</div>
                </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: VISION_GREEN }}>ETA {activeDelivery.eta}</div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>En Approche</div>
             </div>
          </div>

          {/* PROGRESS SNAIL TRAIL */}
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, marginBottom: 24, position: 'relative' }}>
             <div style={{ height: '100%', width: `${activeDelivery.progress}%`, background: GOLD, borderRadius: 3 }}></div>
             <div style={{ position: 'absolute', left: `${activeDelivery.progress}%`, top: -4, width: 14, height: 14, background: GOLD, border: '3px solid #fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}></div>
          </div>

          {/* CHECKPOINT TIMELINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {activeDelivery.checkpoints.map((cp, idx) => (
               <div key={idx} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cp.status === 'Done' ? VISION_GREEN : cp.status === 'Current' ? GOLD : '#e2e8f0', marginTop: 4 }}></div>
                  <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
                        <span style={{ color: cp.status === 'Pending' ? '#94a3b8' : DARK_NAVY }}>{cp.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>{cp.time}</span>
                     </div>
                     <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>LOC: {cp.coords}</div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* GEO-STAMP SECURITY PANEL */}
       <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 24, padding: 24, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
             <Zap size={20} color={GOLD} />
             <div style={{ fontSize: 15, fontWeight: 900 }}>Preuve de Présence IA</div>
          </div>
          <p style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.6, marginBottom: 20 }}>
             L'application livreur effectue un "Géo-Stamp" automatique à moins de 20 mètres de la boutique. La signature du client n'est activée que si la position GPS concorde.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>RAYON VALIDATION</div>
                <div style={{ fontSize: 13, fontWeight: 900 }}>20 Mètres</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>AUDIT DRIFT</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: VISION_GREEN }}>0.8m (Excellence)</div>
             </div>
          </div>
       </div>

       <button style={{ width: '100%', marginTop: 24, background: '#fff', border: '1px solid #e2e8f0', padding: 16, borderRadius: 16, color: DARK_NAVY, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <History size={18} /> Revoir le tracé GPS (Snail Trail)
       </button>
    </div>
  );
}
