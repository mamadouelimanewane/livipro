import { useState } from "react";
import { 
  Truck, 
  Fuel, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  History,
  Archive,
  ChevronRight,
  Plus
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviFleetManager() {
  const [vehicles] = useState([
    { id: "DK-2938-A", name: "Camion 10T #01", driver: "Ibrahima Fall", fuel: 75, status: "En Route", efficiency: "92%" },
    { id: "DK-4481-B", name: "Frigo 5T #02", driver: "Samba Ka", fuel: 32, status: "Station Service", efficiency: "88%" },
    { id: "DK-1229-C", name: "Moto Ant #01", driver: "Modou", fuel: 85, status: "Déchargement", efficiency: "98%" }
  ]);

  const [fuelLogs] = useState([
    { date: "26/03", vehicle: "DK-2938-A", station: "Shell Pikine", amount: "45.000 F", liters: "60L" },
    { date: "25/03", vehicle: "DK-4481-B", station: "Total Grand Yoff", amount: "22.500 F", liters: "30L" }
  ]);

  const [activeTab, setActiveTab] = useState("vehicles"); // vehicles | fuel | cargo

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
       {/* MERCHANT FLEET HEADER */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900 }}>Ma Flotte Propriétaire</h2>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <ShieldCheck size={12} color={VISION_GREEN} /> Gestion Certifiée LiviPro
             </div>
          </div>
          <button style={{ background: DARK_NAVY, width: 44, height: 44, borderRadius: 14, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
             <Plus size={24} color="#fff" />
          </button>
       </div>

       {/* FLEET TABS */}
       <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[
            { id: "vehicles", icon: <Truck size={16} />, label: "Véhicules" },
            { id: "fuel", icon: <Fuel size={16} />, label: "Carburant" },
            { id: "cargo", icon: <Archive size={16} />, label: "Marchandise" }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, background: activeTab === tab.id ? DARK_NAVY : "#fff", color: activeTab === tab.id ? "#fff" : "#64748b", border: activeTab === tab.id ? "none" : "1px solid #f1f5f9", padding: "12px", borderRadius: 14, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
               {tab.icon} {tab.label}
            </button>
          ))}
       </div>

       {activeTab === "vehicles" && (
         <div className="animate-fade-in">
            {vehicles.map((v, idx) => (
              <div key={idx} style={{ background: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                       <div style={{ width: 48, height: 48, background: "#f0f9ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Truck size={24} color="#3b82f6" />
                       </div>
                       <div>
                          <div style={{ fontSize: 15, fontWeight: 800 }}>{v.id}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{v.name} · {v.driver}</div>
                       </div>
                    </div>
                    <div style={{ fontSize: 10, background: v.status === "En Route" ? "#ecfdf5" : "#fffbeb", color: v.status === "En Route" ? VISION_GREEN : GOLD, padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>{v.status}</div>
                 </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 12 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}><Fuel size={12} /> CARBURANT</div>
                       <div style={{ fontSize: 14, fontWeight: 900 }}>{v.fuel}%</div>
                       <div style={{ height: 3, background: "#e2e8f0", borderRadius: 1.5, marginTop: 4 }}><div style={{ height: "100%", width: `${v.fuel}%`, background: v.fuel < 20 ? "#ef4444" : GOLD }}></div></div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 12 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}><Activity size={12} /> EFFICIENCE</div>
                       <div style={{ fontSize: 14, fontWeight: 900 }}>{v.efficiency}</div>
                    </div>
                 </div>

                 <button style={{ width: "100%", background: "#f1f5f9", border: "none", padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 800, color: "#3b82f6" }}>Localiser sur la carte (GPS Live)</button>
              </div>
            ))}
         </div>
       )}

       {activeTab === "fuel" && (
         <div className="animate-fade-in">
            <div style={{ background: DARK_NAVY, borderRadius: 24, padding: 24, color: "#fff", marginBottom: 20 }}>
               <div style={{ fontSize: 12, opacity: 0.7 }}>Consommation Période (Mars)</div>
               <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>420,500 <span style={{ fontSize: 14 }}>FCFA</span></div>
               <div style={{ marginTop: 12, background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <TrendingUp size={16} color={VISION_GREEN} /> <div style={{ fontSize: 11, fontWeight: 700 }}>-5% vs mois dernier (Éco-Conduite)</div>
               </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 900, marginBottom: 16 }}>Historique des Pleins</h4>
            {fuelLogs.map((log, idx) => (
              <div key={idx} style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #f1f5f9", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, background: "#fef3c7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Fuel size={16} color={GOLD} /></div>
                    <div>
                       <div style={{ fontSize: 13, fontWeight: 800 }}>{log.amount} ({log.liters})</div>
                       <div style={{ fontSize: 10, color: "#94a3b8" }}>{log.vehicle} · {log.station}</div>
                    </div>
                 </div>
                 <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>{log.date}</div>
              </div>
            ))}
         </div>
       )}

       {activeTab === "cargo" && (
         <div className="animate-fade-in">
           <div style={{ background: "#f0fdf4", border: "1.5px solid #10b981", borderRadius: 24, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                 <ShieldCheck size={28} color={VISION_GREEN} />
                 <h3 style={{ fontSize: 16, fontWeight: 900, color: "#065f46" }}>Monitoring Marchandise</h3>
              </div>
              <p style={{ fontSize: 11, color: "#065f46", opacity: 0.8, lineHeight: 1.5 }}>
                 Vérifiez le taux de remplissage de vos camions et la qualité des cartons déchargés en temps réel via l'IA LiviVision.
              </p>
           </div>
           {/* Cargo status per vehicle... */}
         </div>
       )}
    </div>
  );
}
