import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, Search, ArrowRight, MessageCircle } from 'lucide-react';
import { transcribeWolofAI, learnPhonetic } from '../services/voiceService';

const COMMANDS = {
  // French
  'marché': '/market',
  'offre': '/market',
  'riz': '/market?q=riz',
  'sucre': '/market?q=sucre',
  'huile': '/market?q=huile',
  'monnaie': '/boutique?view=wallet',
  'argent': '/boutique?view=wallet',
  'banque': '/bank',
  'boutique': '/boutique?view=dashboard',
  // Wolof (Phonetic mapping)
  'marssé': '/market',
  'ceeb': '/market?q=riz',
  'soukeur': '/market?q=sucre',
  'diwline': '/market?q=huile',
  'pate': '/market?q=pate',
  'khaalis': '/boutique?view=wallet',
  'tontine': '/bank',
  'dama beug': '/market', // "I want..."
  'deuker': '/boutique?view=dashboard', // generic shop
  'niow': '/', // Home
};

export default function LiviVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [feedback, setFeedback] = useState("Dites moi ce que vous cherchez ?");

  const speak = (text, lang = 'fr-FR') => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorder.onstart = () => {
        setIsListening(true);
        setShowPanel(true);
        setLearningMode(false);
        setTranscript("🎙 Écoute Haute Précision...");
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setTranscript("🔍 Traduction par l'IA...");
        
        const text = await transcribeWolofAI(audioBlob);
        if (text && text.trim().length > 1) {
          setTranscript(text);
          processCommand(text);
        } else {
          setFeedback("Dites par exemple 'Ceeb' ou 'Marssé'");
        }
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 3500);

    } catch (err) {
      console.error("Mic access failed", err);
      alert("Microphone bloqué ? Autorisez le micro.");
    }
  };

  const processCommand = (text) => {
    let matched = false;
    const lower = text.toLowerCase();

    for (const [cmd, path] of Object.entries(COMMANDS)) {
      if (lower.includes(cmd)) {
        setFeedback(`D'accord, je vous montre ${cmd}...`);
        speak(`D'accord, je vous montre ${cmd}`, 'fr-FR');
        setTimeout(() => {
          window.location.href = path;
          setShowPanel(false);
        }, 1500);
        matched = true;
        break;
      }
    }

    if (!matched) {
      setFeedback("Je ne connais pas encore ce mot. C'est quoi ?");
      speak("Je n'ai pas compris. C'est un produit ou une page ?", 'fr-FR');
      setLearningMode(true);
    }
  };

  const handleLearn = (target, label) => {
    learnPhonetic(transcript, target);
    setFeedback(`Merci ! J'ai appris que "${transcript}" veut dire ${label}.`);
    speak(`D'accord, j'ai appris que ${transcript} veut dire ${label}`, 'fr-FR');
    setTimeout(() => {
       window.location.href = target;
       setShowPanel(false);
    }, 2000);
  };

  return (
    <>
      <button 
        onClick={startListening}
        style={{
          position: 'fixed',
          bottom: 'clamp(80px, 12vh, 100px)', // Above bottom nav
          right: 20,
          width: 64, height: 64,
          background: isListening ? '#ef4444' : '#f97316',
          border: 'none',
          borderRadius: 32,
          boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 2000,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          animation: isListening ? 'pulse-voice 1.5s infinite' : 'none'
        }}
      >
        <Mic size={32} />
        <style>{`
          @keyframes pulse-voice {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}</style>
      </button>

      {/* Voice Assistant Panel */}
      {showPanel && (
        <div style={{
          position: 'fixed', bottom: 100, right: 20, left: 20,
          background: '#fff', borderRadius: 24, padding: 24,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          zIndex: 2001, border: '1px solid #f1f5f9',
          animation: 'slideUp 0.4s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#fef2f2', padding: 8, borderRadius: 12 }}>
                <Volume2 size={24} color="#f97316" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: 18 }}>LiviVoice Assistant</h3>
            </div>
            <button onClick={() => setShowPanel(false)} style={{ background: '#f1f5f9', border: 'none', padding: 8, borderRadius: 10 }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>Vous avez dit :</div>
            <div style={{ fontSize: 20, fontWeight: 950, color: '#0f172a' }}>"{transcript || "..."}"</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#f97316', fontWeight: 800, fontSize: 14 }}>
            <MessageCircle size={18} />
            <span>{feedback}</span>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
             <button onClick={startListening} style={{ background: '#f97316', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 900 }}>Réessayer</button>
             <button onClick={() => setShowPanel(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: 14, borderRadius: 12, fontWeight: 900 }}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
