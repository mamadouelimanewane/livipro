import { useState, useEffect } from "react";
import { 
  Camera, 
  ScanLine, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Layers,
  Sparkles,
  Zap,
  ArrowLeft
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviVision({ onComplete }) {
  const [scanStep, setScanStep] = useState("ready"); // ready | scanning | result
  const [detectedCount, setDetectedCount] = useState(0);

  const startScan = () => {
    setScanStep("scanning");
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 5) + 1;
      setDetectedCount(prev => prev + (Math.floor(Math.random() * 5) + 1));
      if (count >= 24) {
        clearInterval(interval);
        setScanStep("result");
      }
    }, 300);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: DARK_NAVY, zIndex: 1000, color: "#fff", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
       
       <style>{`
          @keyframes scan { from { top: 10%; } to { top: 85%; } }
          @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.8; } 100% { opacity: 0.3; } }
          .scan-line { position: absolute; left: 10%; width: 80%; height: 2px; background: ${VISION_GREEN}; box-shadow: 0 0 20px ${VISION_GREEN}; animation: scan 2s linear infinite; }
          .detect-box { position: absolute; border: 2px solid ${VISION_GREEN}; opacity: 0.6; animation: pulse 1s infinite; }
       `}</style>

       {/* CAMERA VIEWFINDER MOCKUP */}
       <div style={{ flex: 1, position: "relative", background: "#000", margin: "20px", borderRadius: 32, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          
          {scanStep === "ready" && (
            <div style={{ textAlign: "center", padding: 40 }}>
               <div style={{ background: "rgba(255,153,0,0.2)", width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: GOLD }}>
                  <Camera size={40} />
               </div>
               <h2 style={{ fontSize: 20, fontWeight: 900 }}>Prêt pour LiviVision ?</h2>
               <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>Visez la palette de produits pour un comptage IA instantané (Computer Vision).</p>
               <button onClick={startScan} style={{ marginTop: 30, background: GOLD, color: DARK_NAVY, border: "none", padding: "16px 32px", borderRadius: 16, fontWeight: 900, fontSize: 16, cursor: "pointer" }}>Démarrer le Scan IA</button>
            </div>
          )}

          {scanStep === "scanning" && (
            <>
               <div className="scan-line"></div>
               <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(16,185,129,0.8)", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800 }}>ANALYSY EN COURS...</div>
               
               {/* FAKE DETECTED BOXES */}
               <div className="detect-box" style={{ top: "30%", left: "20%", width: 60, height: 60 }}></div>
               <div className="detect-box" style={{ top: "35%", left: "55%", width: 65, height: 65 }}></div>
               <div className="detect-box" style={{ top: "60%", left: "30%", width: 70, height: 70 }}></div>
               
               <div style={{ position: "absolute", bottom: 40, textAlign: "center", width: "100%" }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: VISION_GREEN }}>{detectedCount}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>UNITÉS DÉTECTÉES</div>
               </div>
            </>
          )}

          {scanStep === "result" && (
            <div className="animate-fade-in" style={{ textAlign: "center", padding: 40 }}>
               <div style={{ background: "#f0fdf4", width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                  <CheckCircle2 size={40} />
               </div>
               <h2 style={{ fontSize: 24, fontWeight: 900 }}>Scan Réussi !</h2>
               <div style={{ border: "2px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, margin: "20px 0", background: "rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: GOLD }}>24 <span style={{ fontSize: 18 }}>Cartons</span></div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Produit : Lait Nido (12x400g)</div>
               </div>
               
               <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setScanStep("ready")} style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "none", padding: 18, borderRadius: 16, fontWeight: 800, color: "#fff" }}>Réessayer</button>
                  <button onClick={onComplete} style={{ flex: 2, background: VISION_GREEN, border: "none", padding: 18, borderRadius: 16, fontWeight: 900, color: "#fff" }}>Valider Inventaire</button>
               </div>
            </div>
          )}
       </div>

       {/* FOOTER BAR */}
       <div style={{ padding: "0 24px 40px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
             <Sparkles size={14} color={GOLD} /> 
             Propulsé par <b>LiviEngine AI v3.0</b>
          </div>
          <p style={{ fontSize: 11, opacity: 0.5 }}>Zero Manual Error · Inventory Proof verified on Chain</p>
       </div>
    </div>
  );
}
