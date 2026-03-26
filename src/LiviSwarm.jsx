import { useState } from "react";
import { 
  Zap, 
  Truck, 
  Bike, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  Activity,
  Layers,
  ChevronRight
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";
const SWARM_BLUE = "#3b82f6";

export default function LiviSwarm() {
  const [activeMothership] = useState({
    id: "TRN-HUB-01",
    name: "Vaisseau-Mère (Canter DK-22)",
    location: "Grand Yoff (Rond Point)",
    status: "Ancrage Actif",
    capacity: 75,
    swarm: [
      { id: "ANT-01", driver: "Modou", load: 12, status: "Vers Boutique A", eta: "4m" },
      { id: "ANT-02", driver: "Bakary", load: 8, status: "En Chargement", eta: "Dépôt" },
      { id: "ANT-03", driver: "Issa", load: 15, status: "Vers Boutique C", eta: "2m" }
    ]
  });

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* SWARM HEADER */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
                LiviSwarm™ <div style={{ background: "#eff6ff", padding: "4px 8px", borderRadius: 8, color: SWARM_BLUE, fontSize: 10 }}>SWARM LOGISTICS</div>
             </h2>
             <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Orchestration du dernier kilomètre (Modèle Hub-Swarm)</div>
          </div>
          <div style={{ background: SWARM_BLUE, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 20px ${SWARM_BLUE}44` }}>
             <Layers size={22} color="#fff" />
          </div>
       </div>

       {/* MOTHERSHIP STATUS */}
       <div style={{ background: DARK_NAVY, borderRadius: 24, padding: 24, color: "#fff", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}><Truck size={140} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
             <div style={{ width: 8, height: 8, background: VISION_GREEN, borderRadius: "50%" }}></div>
             <div style={{ fontSize: 12, fontWeight: 800, color: VISION_GREEN, textTransform: "uppercase" }}>Ancrage Logistique Actif</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{activeMothership.name}</div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{activeMothership.location}</div>

          <div style={{ marginTop: 20, display: "flex", gap: 12, background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
             <div>
                <div style={{ fontSize: 9, opacity: 0.6 }}>UNITÉS ESSAIM</div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{activeMothership.swarm.length} Motos</div>
             </div>
             <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 9, opacity: 0.6 }}>CAPACITÉ DÉLEGUÉE</div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{activeMothership.capacity}%</div>
             </div>
          </div>
       </div>

       {/* SWARM LIST (THE ANTS) */}
       <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          Les Fourmis (LiviAnts) <Bike size={18} color={SWARM_BLUE} />
       </h3>
       <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeMothership.swarm.map((ant, idx) => (
            <div key={idx} style={{ background: "#fff", padding: 16, borderRadius: 20, border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ background: ant.status === "En Chargement" ? "#fef3c7" : "#eff6ff", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <Bike size={20} color={ant.status === "En Chargement" ? GOLD : SWARM_BLUE} />
                  </div>
                  <div>
                     <div style={{ fontSize: 14, fontWeight: 800 }}>{ant.driver}</div>
                     <div style={{ fontSize: 11, color: "#94a3b8" }}>Charge: {ant.load} Cartons</div>
                  </div>
               </div>
               <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: ant.status === "En Chargement" ? GOLD : VISION_GREEN }}>{ant.status}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Arrivée: {ant.eta}</div>
               </div>
            </div>
          ))}
       </div>

       {/* UNIQUE ASPECT: THE "SWARM PROTOCOL" */}
       <div style={{ marginTop: 30, padding: 20, background: "#fff", borderRadius: 24, border: "2px dashed #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
             <Activity size={20} color={SWARM_BLUE} />
             <div style={{ fontSize: 15, fontWeight: 900 }}>Protocole de Transfert IA</div>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
             Le Vaisseau-Mère décharge en masse dans les rues larges, tandis que les "LiviAnts" s'infiltrent dans les ruelles inaccessibles. 
             La responsabilité financière est transférée via **Scan-to-Trust** (Handoff QR).
          </p>
          <button style={{ width: "100%", marginTop: 16, background: SWARM_BLUE, color: "#fff", border: "none", padding: "12px", borderRadius: 12, fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
             Accès Hub Mobile <ArrowRight size={16} />
          </button>
       </div>
    </div>
  );
}
