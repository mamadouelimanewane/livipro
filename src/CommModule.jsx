import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Video, 
  Send, 
  Mic, 
  Phone, 
  User, 
  ArrowLeft, 
  CheckCheck, 
  Sparkles, 
  Camera, 
  MoreVertical,
  Bot,
  Globe,
  Users,
  MessageCircle
} from "lucide-react";

// --- SIMULATION DATA ---
const CHAT_LOG = [
  { id: 1, sender: "Grossiste DLH", text: "Bonjour Al-Amine, votre prêt de 500k a été approuvé par l'IA.", time: "10:05", type: "partner" },
  { id: 2, sender: "AI Assistant", text: "Notez que le camion TRN-DKR-9824 arrive dans 25 minutes.", time: "10:06", type: "bot" }
];

const MEETINGS = [
  { id: "m1", title: "Assemblée Générale Mensuelle", participants: 42, status: "Live", host: "Mamadou Sow" },
  { id: "m2", title: "Cercle de Tontine - Gamme Boisson", participants: 12, status: "Prévu (18h)", host: "Ousmane Diallo" }
];

const BRAND_WHATSAPP = "#25D366";
const DARK_NAVY = "#0f172a";

// --- UI COMPONENTS ---
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: 20, padding: 18, border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

export default function CommModule() {
  const [activeTab, setActiveTab] = useState("chatbot"); // chatbot | meet | whatsapp
  const [messages, setMessages] = useState(CHAT_LOG);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), sender: "Moi", text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: "user" };
    setMessages([...messages, newMsg]);
    setInput("");
    
    // AI Response simulation
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        sender: "AI LiviBot", 
        text: "J'analyse votre demande. Votre Karma actuel est de 942 pts, ce qui vous permet de voter la résolution 1.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        type: "bot" 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const renderChatbot = () => (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      <div style={{ padding: 20, background: DARK_NAVY, color: "#fff", display: "flex", alignItems: "center", gap: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <Bot color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
           <div style={{ fontSize: 16, fontWeight: 800 }}>LiviBot AI</div>
           <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>● Assistant IA Associé</div>
        </div>
        <MoreVertical size={20} opacity={0.6} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
         {messages.map(msg => (
           <div key={msg.id} style={{ 
             alignSelf: msg.type === "user" ? "flex-end" : "flex-start", 
             maxWidth: "80%",
             background: msg.type === "user" ? "#1e293b" : msg.type === "bot" ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "#fff",
             color: msg.type === "user" ? "#fff" : "#1e293b",
             padding: "12px 16px",
             borderRadius: msg.type === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
             boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
             border: msg.type === "bot" ? "1px solid #10b981" : "1px solid #f1f5f9"
           }}>
              <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 4, opacity: 0.7, color: msg.type === "bot" ? "#059669" : "inherit" }}>{msg.sender}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
              <div style={{ fontSize: 9, textAlign: "right", marginTop: 4, opacity: 0.6 }}>{msg.time}</div>
           </div>
         ))}
         <div ref={chatEndRef} />
      </div>

      <div style={{ padding: 20, background: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, background: "#f8fafc", borderRadius: 24, padding: "10px 18px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
             <input onKeyDown={(e) => e.key === 'Enter' && handleSend()} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Posez une question à l'IA..." style={{ background: "none", border: "none", flex: 1, fontSize: 14, outline: "none" }} />
             <Mic size={18} color="#94a3b8" />
          </div>
          <button onClick={handleSend} style={{ background: DARK_NAVY, color: "#fff", border: "none", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={18} />
          </button>
      </div>
    </div>
  );

  const renderLiviMeet = () => (
    <div className="animate-fade-in" style={{ padding: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>LiviMeet (Visioconférence)</div>
      
      {/* ACTIVE CALL MOCKUP */}
      <div style={{ background: "#000", borderRadius: 28, height: 260, position: "relative", overflow: "hidden", marginBottom: 24 }}>
          <img src="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=400" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} alt="meeting" />
          <div style={{ position: "absolute", top: 20, right: 20, width: 100, height: 140, background: "#334155", borderRadius: 16, border: "2px solid #fff", overflow: "hidden" }}>
             <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#fff" }}>Vous</div>
          </div>
          <div style={{ position: "absolute", bottom: 20, left: 20 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.5)", padding: "6px 12px", borderRadius: 20, color: "#fff" }}>
                <div style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%" }}></div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Direct : CA Mensuel</span>
             </div>
          </div>

          <div style={{ position: "absolute", bottom: 20, width: "100%", display: "flex", justifyContent: "center", gap: 12 }}>
             <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Mic size={20} /></div>
             <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Video size={20} /></div>
             <div style={{ background: "#ef4444", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Phone size={20} style={{ transform: "rotate(135deg)" }} /></div>
          </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Réunions Planifiées</div>
      {MEETINGS.map(meet => (
        <Card key={meet.id} style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
           <div style={{ background: meet.status === "Live" ? "#fee2e2" : "#f1f5f9", width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: meet.status === "Live" ? "#ef4444" : "#64748b" }}>
              <Video size={24} />
           </div>
           <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{meet.title}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Hôte: {meet.host} · {meet.participants} participants</div>
           </div>
           <button style={{ background: meet.status === "Live" ? "#ef4444" : "#f1f5f9", color: meet.status === "Live" ? "#fff" : "#1e293b", border: "none", padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
              {meet.status === "Live" ? "Rejoindre" : "Détails"}
           </button>
        </Card>
      ))}

      <button style={{ width: "100%", marginTop: 20, background: DARK_NAVY, color: "#fff", border: "none", padding: 18, borderRadius: 16, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
         <Globe size={20} /> Lancer un Live Assemblée
      </button>
    </div>
  );

  const renderWhatsAppBridge = () => (
    <div className="animate-fade-in" style={{ padding: 20 }}>
       <div style={{ background: BRAND_WHATSAPP, color: "#fff", padding: "30px 24px", borderRadius: 28, marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <MessageCircle size={100} style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.15 }} />
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Pont WhatsApp</div>
          <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>Envoyez vos bons de commande et signatures POD directement aux groupes WhatsApp de vos partenaires.</div>
       </div>

       <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Groupes Synchronisés</div>
       {[
         { name: "Group DLH Logistics", members: 124, lastAction: "Bordereau TRN-DKR envoyé" },
         { name: "Cercle des Boutiquiers", members: 42, lastAction: "Convocation AG envoyée" }
       ].map((group, idx) => (
         <Card key={idx} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "#dcfce7", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND_WHATSAPP }}>
              <Users size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{group.name}</div>
              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>{group.lastAction}</div>
            </div>
            <CheckCheck size={18} color={BRAND_WHATSAPP} />
         </Card>
       ))}

       <div style={{ marginTop: 24, padding: 20, background: "#f8fafc", borderRadius: 20, border: "2px dashed #cbd5e1", textAlign: "center" }}>
          <MessageSquare size={24} color={BRAND_WHATSAPP} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 800, color: "#475569" }}>Lier un nouveau groupe</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Utilisez le scan QR WhatsApp Business</div>
       </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#f8fafc", minHeight: "100vh", position: "relative", fontFamily: "'Inter', sans-serif" }}>
       
       <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.4s ease-out; }
       `}</style>

       {/* HEADER NAV */}
       {activeTab !== "chatbot" && (
         <div style={{ padding: "20px 20px 10px", display: "flex", alignItems: "center", gap: 12 }}>
           <button onClick={() => setActiveTab("chatbot")} style={{ background: "none", border: "none" }}><ArrowLeft size={24} /></button>
           <h2 style={{ fontSize: 20, fontWeight: 900 }}>Communication Hub</h2>
         </div>
       )}

       <div style={{ paddingBottom: 100 }}>
         {activeTab === "chatbot" && renderChatbot()}
         {activeTab === "meet" && renderLiviMeet()}
         {activeTab === "whatsapp" && renderWhatsAppBridge()}
       </div>

       {/* TAB BAR */}
       <div style={{ position: "fixed", bottom: 0, width: "100%", maxWidth: 480, height: 70, background: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
          <div onClick={() => setActiveTab("chatbot")} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: activeTab === "chatbot" ? DARK_NAVY : "#94a3b8", cursor: "pointer" }}>
            <MessageSquare size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>BOT IA</span>
          </div>
          <div onClick={() => setActiveTab("meet")} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: activeTab === "meet" ? "#ef4444" : "#94a3b8", cursor: "pointer" }}>
            <Video size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>MEET</span>
          </div>
          <div onClick={() => setActiveTab("whatsapp")} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: activeTab === "whatsapp" ? BRAND_WHATSAPP : "#94a3b8", cursor: "pointer" }}>
            <MessageCircle size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, marginTop: 4 }}>WHP BRIDGE</span>
          </div>
       </div>
    </div>
  );
}
