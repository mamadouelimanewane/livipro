import { useState, useEffect } from "react";
import { useIsDesktop } from './hooks/useMediaQuery';
import { Thermometer, Zap, ShieldCheck, Truck, Droplets, MapPin, Sparkles, BatteryCharging, History, MoreVertical, Globe, RefreshCw } from "lucide-react";

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

export default function LiviGreen() {
  const isDesktop = useIsDesktop();
  const [activeFriz, setActiveFriz] = useState({
    id: "FRIZ-9821",
    vehicle: "Canter Solaire DK-921",
    temp: 2.4,
    humidity: 45,
    battery: 88,
    status: "Optimal",
    cargo: "Laitages / Viande",
    history: [2.2, 2.5, 2.3, 2.6, 2.4, 2.4, 2.3]
  });

  return (
    <div className="animate-fade-in">
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
          <Card style={{ borderLeft: `6px solid ${VISION_GREEN}` }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>TEMPÉRATURE ACTUELLE</div>
                <div style={{ color: VISION_GREEN }}><Thermometer size={18} /></div>
             </div>
             <div style={{ fontSize: 32, fontWeight: 950, color: DARK_NAVY }}>{activeFriz.temp}°C</div>
             <div style={{ fontSize: 10, color: VISION_GREEN, fontWeight: 800, marginTop: 8 }}>Variation: ±0.2°C (IA Stable)</div>
          </Card>
          <Card>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>HUMIDITÉ CARGO</div>
                <div style={{ color: "#3b82f6" }}><Droplets size={18} /></div>
             </div>
             <div style={{ fontSize: 32, fontWeight: 950, color: DARK_NAVY }}>{activeFriz.humidity}%</div>
             <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 800, marginTop: 8 }}>Seuil critique: 65%</div>
          </Card>
          <Card>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>AUTONOMIE SOLAIRE</div>
                <div style={{ color: GOLD }}><BatteryCharging size={18} /></div>
             </div>
             <div style={{ fontSize: 32, fontWeight: 950, color: DARK_NAVY }}>{activeFriz.battery}%</div>
             <div style={{ fontSize: 10, color: GOLD, fontWeight: 800, marginTop: 8 }}>Injection de surplus active</div>
          </Card>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "2fr 1fr" : "1fr", gap: 32 }}>
          <Card>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>Supervision IoT Camion : {activeFriz.id}</h3>
                <RefreshCw size={18} color="#94a3b8" />
             </div>
             
             <div style={{ background: "#f8fafc", padding: 24, borderRadius: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                   {activeFriz.history.map((h, i) => (
                     <div key={i} style={{ flex: 1, background: VISION_GREEN, borderRadius: 4, height: `${h * 40}%`, transition: "height 0.5s ease" }}></div>
                   ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", fontWeight: 800, marginTop: 12 }}>
                   <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>MAINTENANT</span>
                </div>
             </div>

             <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ boxSize: 50, background: DARK_NAVY, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Truck size={24} /></div>
                <div>
                   <div style={{ fontSize: 15, fontWeight: 900 }}>{activeFriz.cargo}</div>
                   <div style={{ fontSize: 12, color: "#64748b" }}>Route: Dakar → Saint-Louis Hub</div>
                </div>
             </div>
          </Card>

          <Card style={{ background: DARK_NAVY, color: "#fff" }}>
             <ShieldCheck size={32} color={GOLD} style={{ marginBottom: 16 }} />
             <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>LiviGreen-Chain™ Certification</h4>
              <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6, marginBottom: 24 }}>
                Notre protocole IoT certifie l'intégrité de la chaîne du froid sur la LiviChain. La valeur de vos produits est garantie en cas de litige financier.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 <button style={{ width: "100%", background: GOLD, color: DARK_NAVY, border: "none", padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: "pointer" }}>Audit de Traçabilité</button>
                 <button style={{ width: "100%", background: "rgba(255,255,255,0.05)", color: "#fff", border: "none", padding: 14, borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: "pointer" }}>Journal des Températures</button>
              </div>
          </Card>
       </div>
    </div>
  );
}
