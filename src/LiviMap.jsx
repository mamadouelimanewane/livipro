import { useState } from "react";
import { 
  Plus, 
  Minus, 
  MapPin, 
  Navigation, 
  Users, 
  Building2, 
  Info,
  Maximize2,
  TrendingUp,
  Globe
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviMap() {
  const [activeType, setActiveType] = useState("all"); // all | wholesalers | boutiques
  const [selectedPoint, setSelectedPoint] = useState(null);

  const POINTS = [
    { id: 1, type: "wholesaler", name: "Dakar Port Hub", lat: "14.693", lng: "-17.444", stats: "45 Livraison/j" },
    { id: 2, type: "boutique", name: "Boutique Médina", lat: "14.685", lng: "-17.448", stats: "Karma 950" },
    { id: 3, type: "boutique", name: "Alimentation Grand Yoff", lat: "14.730", lng: "-17.455", stats: "Karma 820" },
    { id: 4, type: "wholesaler", name: "Hub Thiès", lat: "14.791", lng: "-16.924", stats: "8 Camions" },
    { id: 5, type: "wholesaler", name: "Mboro Distribution", lat: "15.138", lng: "-16.892", stats: "2.4M Chiffre" },
    { id: 6, type: "boutique", name: "Boutique Podor Rurale", lat: "16.616", lng: "-14.960", stats: "Relais S3" }
  ];

  const filteredPoints = activeType === "all" ? POINTS : POINTS.filter(p => p.type === (activeType === "wholesalers" ? "wholesaler" : "boutique"));

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* MAP HEADER */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900 }}>LiviAtlas™ Sénégal</h2>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}>
                <Globe size={12} color={VISION_GREEN} /> Cartographie du Réseau National
             </div>
          </div>
          <div style={{ background: DARK_NAVY, padding: "8px 16px", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 800 }}>
             {POINTS.length} Points Actifs
          </div>
       </div>

       {/* MAP INTERFACE (SIMULATED HIGH-END) */}
       <div style={{ position: "relative", width: "100%", height: 450, background: "#e2e8f0", borderRadius: 32, overflow: "hidden", border: "4px solid #fff", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
          {/* MAP CANVAS (SVG OF SENEGAL SIMULATION) */}
          <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)" }}>
             <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.2, fontSize: 100, fontWeight: 900, color: "#fff" }}>SÉNÉGAL</div>
             
             {/* SIMULATED POINTS */}
             {filteredPoints.map(p => (
               <div key={p.id} 
                    onClick={() => setSelectedPoint(p)}
                    style={{ 
                      position: "absolute", 
                      top: `${((parseFloat(p.lat) - 12) / 5) * 100}%`, 
                      left: `${((parseFloat(p.lng) + 18) / 8) * 100}%`,
                      cursor: "pointer",
                      transition: "0.3s transform"
                    }}>
                  <div style={{ 
                    width: 14, height: 14, 
                    background: p.type === 'wholesaler' ? GOLD : VISION_GREEN, 
                    borderRadius: "50%", 
                    border: "3px solid #fff",
                    boxShadow: `0 0 15px ${p.type === 'wholesaler' ? GOLD : VISION_GREEN}`
                  }} />
                  {selectedPoint?.id === p.id && (
                    <div className="animate-fade-in" style={{ position: "absolute", bottom: 20, left: -60, width: 140, background: DARK_NAVY, color: "#fff", padding: "10px", borderRadius: 12, fontSize: 10, zIndex: 10 }}>
                       <div style={{ fontWeight: 800, color: GOLD }}>{p.name}</div>
                       <div style={{ marginTop: 2, opacity: 0.8 }}>{p.stats}</div>
                    </div>
                  )}
               </div>
             ))}
          </div>

          {/* MAP CONTROLS */}
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", flexDirection: "column", gap: 10 }}>
             <button style={{ width: 44, height: 44, background: "#fff", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}><Plus size={20} /></button>
             <button style={{ width: 44, height: 44, background: "#fff", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}><Minus size={20} /></button>
          </div>

          <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", padding: 16, borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div style={{ display: "flex", gap: 12 }}>
                <div onClick={() => setActiveType("wholesalers")} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, fontWeight: 800, color: activeType === "wholesalers" ? GOLD : "#475569" }}>
                   <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }}></div> Grossistes
                </div>
                <div onClick={() => setActiveType("boutiques")} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, fontWeight: 800, color: activeType === "boutiques" ? VISION_GREEN : "#475569" }}>
                   <div style={{ width: 10, height: 10, borderRadius: "50%", background: VISION_GREEN }}></div> Boutiques
                </div>
             </div>
             <div style={{ color: "#94a3b8", cursor: "pointer" }} onClick={() => setActiveType("all")}><Maximize2 size={18} /></div>
          </div>
       </div>

       {/* LEGEND & ANALYSIS */}
       <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 24, border: "1px solid #f1f5f9" }}>
             <TrendingUp size={24} color={VISION_GREEN} style={{ marginBottom: 12 }} />
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Couverture Nationale</div>
             <div style={{ fontSize: 22, fontWeight: 900, color: DARK_NAVY }}>84%</div>
             <div style={{ fontSize: 9, color: VISION_GREEN, fontWeight: 800, marginTop: 4 }}>+12% vs MOIS DERNIER</div>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 24, border: "1px solid #f1f5f9" }}>
             <Users size={24} color={GOLD} style={{ marginBottom: 12 }} />
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Densité Commerciale</div>
             <div style={{ fontSize: 22, fontWeight: 900, color: DARK_NAVY }}>Modérée</div>
             <div style={{ fontSize: 9, color: GOLD, fontWeight: 800, marginTop: 4 }}>RECOMMANDATION : THIÈS HUB</div>
          </div>
       </div>
    </div>
  );
}
