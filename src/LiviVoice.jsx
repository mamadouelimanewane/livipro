import { useState, useEffect } from 'react';
import { Mic, MicOff, Search, Sparkles, Send, Volume2, Globe, Command, Zap, MessageSquare, Briefcase, HandCoins } from 'lucide-react';

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const WOLOF_DICTIONARY = {
  "duulin": "Huile",
  "dulin": "Huile",
  "ceeb": "Riz",
  "suukër": "Sucre",
  "sukër": "Sucre",
  "lait": "Lait Nido",
  "mburu": "Pain",
  "ndox": "Eau",
  "sac": "Sac",
  "fardeau": "Fardeau",
  "beug": "Vouloir",
  "bëgg": "Vouloir",
  "waññil": "Réduire",
  "fay": "Payer",
  "barké": "Karma/Béni",
  "bank bi": "Banque",
  "tontine": "Tontine",
  "auto": "Camion/Livraison"
};

export default function LiviVoice({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [nlpResult, setNlpResult] = useState(null);
  const [lang, setLang] = useState("FR/WO");

  const startListening = () => {
    setIsListening(true);
    setTranscript("Écoute en cours...");
    setNlpResult(null);
    
    // Simulate speech recognition
    const samples = [
      "Dama bëgg 10 sacu dulin ak 5 sacu ceeb",
      "Waññil sama boru bank bi",
      "Fayal ma ma commande bi ak LiviWallet",
      "J'ai besoin de 12 cartons de Nido pour le Ramadan",
      "Kan lay ramasse sama tontine ?",
      "Affiche moi la position du camion de livraison"
    ];
    
    setTimeout(() => {
      const text = samples[Math.floor(Math.random() * samples.length)];
      setTranscript(text);
      processNLP(text);
      setIsListening(false);
    }, 2500);
  };

  const processNLP = (text) => {
    let lower = text.toLowerCase();
    let action = "Inconnu";
    let entity = null;
    let confidence = 0.92;

    // WOLOF & NLP LOGIC
    if (lower.includes("ceeb") || lower.includes("riz")) {
      action = "COMMANDE"; entity = "Riz Parfumé";
    } else if (lower.includes("dulin") || lower.includes("huile") || lower.includes("duulin")) {
      action = "COMMANDE"; entity = "Huile Dinor";
    } else if (lower.includes("bank") || lower.includes("waññil")) {
      action = "FINANCES"; entity = "Gestion de Prêt";
    } else if (lower.includes("tontine") || lower.includes("ramasse")) {
      action = "FINANCES"; entity = "Rotation Tontine";
    } else if (lower.includes("camion") || lower.includes("auto") || lower.includes("livraison")) {
      action = "LOGISTIQUE"; entity = "Atlas Tracking";
    } else if (lower.includes("nido") || lower.includes("lait") || lower.includes("ramadan")) {
      action = "COMMANDE"; entity = "Lait Nido";
    }

    setNlpResult({ action, entity, confidence, original: text });
    if (onCommand) onCommand({ action, entity, text });
  };

  return (
    <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: DARK_NAVY, borderRadius: 10, padding: 6 }}><Sparkles size={18} color={GOLD} /></div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>LiviVoice AI <span style={{ fontSize: 10, color: VISION_GREEN, fontWeight: 700 }}>BETA MULTILINGUE</span></div>
         </div>
         <div style={{ display: "flex", gap: 8, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
            <button onClick={() => setLang("FR")} style={{ border: "none", background: lang === "FR" ? "#fff" : "transparent", padding: "4px 8px", fontSize: 10, fontWeight: 900, borderRadius: 6, cursor: "pointer" }}>FR</button>
            <button onClick={() => setLang("WO")} style={{ border: "none", background: lang === "WO" ? "#fff" : "transparent", padding: "4px 8px", fontSize: 10, fontWeight: 900, borderRadius: 6, cursor: "pointer" }}>WO</button>
            <button onClick={() => setLang("FR/WO")} style={{ border: "none", background: lang === "FR/WO" ? "#fff" : "transparent", padding: "4px 8px", fontSize: 10, fontWeight: 900, borderRadius: 6, cursor: "pointer" }}>MIX</button>
         </div>
      </div>

      <div style={{ background: "#f8fafc", borderRadius: 20, padding: 24, textAlign: "center", border: "2px dashed #e2e8f0", position: "relative" }}>
         {isListening ? (
           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", gap: 4, height: 24, alignItems: "center" }}>
                 {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: 4, background: DARK_NAVY, borderRadius: 2 }} className={`animate-pulse`} style={{ height: Math.random() * 20 + 4 }} />)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: DARK_NAVY }}>LiviAI vous écoute en temps réel...</div>
           </div>
         ) : (
           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <button 
                onClick={startListening}
                style={{ width: 64, height: 64, borderRadius: "50%", background: DARK_NAVY, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)" }}
              >
                <Mic size={28} />
              </button>
              <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Dites par exemple : "Dama bëgg 10 sacu ceeb"</div>
           </div>
         )}
      </div>

      {transcript && !isListening && (
        <div className="animate-fade-in" style={{ marginTop: 24, background: "#fff", padding: 20, borderRadius: 20, border: "1px solid #e2e8f0" }}>
           <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Volume2 size={16} color="#64748b" />
              <div style={{ fontStyle: "italic", fontSize: 14, color: DARK_NAVY, fontWeight: 500 }}>"{transcript}"</div>
           </div>
           
           {nlpResult && (
             <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: VISION_GREEN + "20", color: VISION_GREEN, padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900 }}>COMPRIS {Math.round(nlpResult.confidence * 100)}%</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: DARK_NAVY }}>{nlpResult.action} → {nlpResult.entity}</div>
                   </div>
                   <button style={{ background: GOLD, border: "none", color: DARK_NAVY, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900, cursor: "pointer" }}>Confirmer</button>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
