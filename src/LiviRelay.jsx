import { useState } from "react";
import { 
  ArrowRight, 
  MapPin, 
  Truck, 
  Warehouse, 
  Clock, 
  ShieldCheck, 
  Navigation,
  Activity,
  Zap,
  ChevronRight,
  TrendingUp,
  Globe
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";
const RELAY_CORRIDOR = "#6366f1";

export default function LiviRelay() {
  const [activeCorridor] = useState({
    id: "COR-NORTH-01",
    route: "Dakar → Saint-Louis → Podor",
    totalDistance: "485 km",
    stages: [
      { id: "S1", segment: "Dakar → Thiès", status: "Terminé", driver: "Pape Diouf", vehicle: "Semi-Remorque DK-22", time: "08:00 - 10:15" },
      { id: "S2", segment: "Thiès → Saint-Louis", status: "En Cours", driver: "Amath Sy", vehicle: "Porteur DK-44", time: "11:00 - 14:30" },
      { id: "S3", segment: "Saint-Louis → Podor (Rural)", status: "Attente Relais", driver: "Ibrahima Fall", vehicle: "4x4 Pick-up", time: "15:30 - --:--" }
    ]
  });

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* CORRIDOR HEADER */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900 }}>Corridors Inter-Sénégal</h2>
             <div style={{ fontSize: 11, color: RELAY_CORRIDOR, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={12} /> Logistique Connectée (Dakar & Régions)
             </div>
          </div>
          <div style={{ background: RELAY_CORRIDOR, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <TrendingUp size={22} color="#fff" />
          </div>
       </div>

       {/* ACTIVE RELAY TRACKER */}
       <div style={{ background: '#fff', borderRadius: 28, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: 24, border: '1px solid #f1f5f9' }}>
          <div style={{ marginBottom: 20 }}>
             <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>CORRIDOR ACTIF</div>
             <div style={{ fontSize: 18, fontWeight: 900, color: DARK_NAVY }}>{activeCorridor.route}</div>
             <div style={{ fontSize: 12, color: RELAY_CORRIDOR, fontWeight: 800, marginTop: 4 }}>Distance Totale : {activeCorridor.totalDistance}</div>
          </div>

          {/* VISUAL RELAY LINE */}
          <div style={{ position: "relative", paddingLeft: 30 }}>
             <div style={{ position: "absolute", left: 7, top: 10, bottom: 40, width: 2, background: "#f1f5f9" }}></div>
             
             {activeCorridor.stages.map((stage, idx) => (
               <div key={idx} style={{ position: "relative", marginBottom: 30 }}>
                  <div style={{ position: "absolute", left: -30, top: 4, width: 16, height: 16, borderRadius: "50%", background: stage.status === "Terminé" ? VISION_GREEN : stage.status === "En Cours" ? GOLD : "#e2e8f0", border: stage.status === "En Cours" ? "3px solid #fff" : "none", boxShadow: stage.status === "En Cours" ? `0 0 10px ${GOLD}` : "none", zIndex: 1 }}></div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: stage.status === "Attente Relais" ? "#94a3b8" : DARK_NAVY }}>{stage.segment}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Chauffeur: {stage.driver} · <span style={{ fontWeight: 700 }}>{stage.vehicle}</span></div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>HORAIRES : {stage.time}</div>
                     </div>
                     <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, background: stage.status === "Terminé" ? "#f0fdf4" : stage.status === "En Cours" ? "#fffbeb" : "#f1f5f9", color: stage.status === "Terminé" ? VISION_GREEN : stage.status === "En Cours" ? GOLD : "#94a3b8", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>{stage.status}</div>
                        {stage.status === "En Cours" && <button style={{ marginTop: 8, background: DARK_NAVY, color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, fontSize: 9, fontWeight: 900 }}>HANDOFF QR</button>}
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* RELAY HUB NETWORK INFO */}
       <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 24, padding: 24, color: "#fff", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
             <Warehouse size={20} color={GOLD} />
             <div style={{ fontSize: 15, fontWeight: 900 }}>Réseau LiviHub™</div>
          </div>
          <p style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.6, marginBottom: 20 }}>
             Le modèle Relais permet d'optimiser la fatigue des chauffeurs et d'assurer que les produits périssables arrivent vite grâce à la permutation des véhicules aux Hubs de Thiès et Kaolack.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>POINTS DE RELAIS</div>
                <div style={{ fontSize: 13, fontWeight: 900 }}>14 Hubs</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>OPTIMISATION FLOTTE</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: VISION_GREEN }}>+22% ROI</div>
             </div>
          </div>
       </div>

       <button style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', padding: 16, borderRadius: 16, color: DARK_NAVY, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Activity size={18} /> Planifier un nouveau corridor
       </button>
    </div>
  );
}
