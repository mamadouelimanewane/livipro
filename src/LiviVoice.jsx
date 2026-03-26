import { useState, useEffect } from "react";
import { 
  Mic, 
  X, 
  Volume2, 
  Search, 
  Zap, 
  CheckCircle2, 
  Globe
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviVoice({ onClose, onResult }) {
  const [status, setStatus] = useState("listening"); // listening | processing | result
  const [transcript, setTranscript] = useState("");
  const [detectedIntent, setDetectedIntent] = useState(null);

  useEffect(() => {
    // Simulate multi-lingual voice detection
    const timer = setTimeout(() => {
      setStatus("processing");
      setTimeout(() => {
        // Natural Language simulation (Wolof/French)
        setTranscript("Dama bëgg riz parfumé bu neex te yomb");
        setDetectedIntent({ product: "Riz Parfumé", sort: "price" });
        setStatus("result");
      }, 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleApply = () => {
    onResult(detectedIntent.product);
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.95)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: 24 }}>
       <button onClick={onClose} style={{ position: "absolute", top: 30, right: 30, background: "rgba(255,255,255,0.1)", border: "none", padding: 12, borderRadius: "50%", color: "#fff" }}><X size={24} /></button>

       {status === "listening" && (
         <div className="animate-fade-in" style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 40, position: "relative" }}>
               <div className="pulse-ring" style={{ width: 120, height: 120, background: "rgba(245, 158, 11, 0.2)", borderRadius: "50%", position: "absolute", top: -10, left: -10 }}></div>
               <div style={{ width: 100, height: 100, background: GOLD, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <Mic size={48} color="#fff" />
               </div>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>Wakh ko rek...</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 12 }}>Dites ou parlez (Wolof / Français)</p>
            <div style={{ fontSize: 12, color: GOLD, marginTop: 40, fontStyle: "italic" }}>
               "Dama bëgg riz parfumé..." <br/> "Je cherche de l'huile moins cher..."
            </div>
         </div>
       )}

       {status === "processing" && (
         <div className="animate-fade-in" style={{ textAlign: "center" }}>
            <div className="animate-spin" style={{ width: 64, height: 64, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: GOLD, borderRadius: "50%", margin: "0 auto 30px" }}></div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Traduction IA LiviVoice...</h2>
         </div>
       )}

       {status === "result" && (
         <div className="animate-slide-up" style={{ textAlign: "center", width: "100%", maxWidth: 400 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 24, borderRadius: 28, border: "1px solid rgba(255,255,255,0.2)", marginBottom: 30 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 16, color: GOLD }}>
                  <Globe size={18} /> <span style={{ fontSize: 13, fontWeight: 800 }}>WOLOF DÉTECTÉ</span>
               </div>
               <div style={{ fontSize: 18, fontStyle: "italic", marginBottom: 12, opacity: 0.9 }}>"{transcript}"</div>
               <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "16px 0" }}></div>
               <div style={{ fontSize: 13, color: VISION_GREEN, fontWeight: 800 }}>INTENTION DÉCODÉE :</div>
               <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>Article : {detectedIntent.product}</div>
               <div style={{ fontSize: 11, background: "rgba(16, 185, 129, 0.1)", color: VISION_GREEN, padding: "4px 10px", borderRadius: 20, display: "inline-block", marginTop: 12 }}>TRADUCTION NATURELLE RÉUSSIE</div>
            </div>
            
            <button onClick={handleApply} style={{ width: "100%", background: VISION_GREEN, color: "#fff", border: "none", padding: 18, borderRadius: 16, fontSize: 16, fontWeight: 900, boxShadow: "0 10px 25px rgba(16,185,129,0.3)" }}>Lancer la comparaison</button>
            <button onClick={() => setStatus("listening")} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 700 }}>Réessayer</button>
         </div>
       )}

       <style>{`
          @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
          .pulse-ring { animation: pulse 2s infinite; }
          .animate-slide-up { animation: slide-up 0.4s ease-out; }
          @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
       `}</style>
    </div>
  );
}
