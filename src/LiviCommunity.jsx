import { useState, useEffect } from "react";
import { useIsDesktop } from './hooks/useMediaQuery';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Search, 
  Bell, 
  Globe, 
  Lock, 
  Zap, 
  Smile, 
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Star,
  Sparkles,
  Award,
  Circle
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

const STORIES = [
  { id: 1, name: "Admin", active: true, color: GOLD },
  { id: 2, name: "Dakar Hub", active: true, color: "#3b82f6" },
  { id: 3, name: "Pikine Icotaf", active: false, color: VISION_GREEN },
  { id: 4, name: "Thiès Supply", active: true, color: "#ef4444" },
  { id: 5, name: "St-Louis Hub", active: false, color: "#8b5cf6" },
];

const FEEDS = [
  { id: "f1", author: "LiviPro Admin", role: "Régulateur", time: "2 min", text: "🚨 MISE À JOUR : Le plafond de crédit pour le mois de Ramadan est augmenté de +15% pour toutes les boutiques avec un Karma > 850.", likes: 42, replies: 12, category: "Officiel" },
  { id: "f2", author: "Dakar Port Hub", role: "Grossiste", time: "1h", text: "🚚 Arrivage imminent de 5 tonnes de Riz Thai. Les pré-commandes sont ouvertes dans le LiviMarket !", likes: 85, replies: 24, category: "Logistique" },
  { id: "f3", author: "Boutique Médina", role: "Boutique Élite", time: "3h", text: "Excellent ralliement aujourd'hui via LiviGroupage. Merci au réseau pour l'efficacité !", likes: 23, replies: 5, category: "Succès" },
];

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.02)", ...style }}>{children}</div>
);

export default function LiviCommunity() {
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState("feed");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
     { id: 1, sender: "Dakar Hub", text: "Votre commande est prête pour ramassage.", time: "10:12" },
     { id: 2, sender: "Moi", text: "Super, le livreur est en route.", time: "10:15" }
  ]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "Moi", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setNewMessage("");
  };

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 400px" : "1fr", gap: 32 }}>
       
       {/* MAIN FEED */}
       <div>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 20, marginBottom: 24 }}>
             {STORIES.map(s => (
               <div key={s.id} style={{ textAlign: "center", minWidth: 70, cursor: "pointer" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", border: s.active ? `3px solid ${s.color}` : `2px solid #e2e8f0`, padding: 3, marginBottom: 6 }}>
                     <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.name[0]}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>{s.name}</div>
               </div>
             ))}
          </div>

          <Card style={{ marginBottom: 32, padding: 20 }}>
             <div style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: DARK_NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>M</div>
                <div style={{ flex: 1 }}>
                   <input 
                     placeholder="Partagez une nouvelle avec la communauté..." 
                     style={{ width: "100%", border: "none", outline: "none", fontSize: 15, padding: "10px 0" }}
                   />
                </div>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: 20, color: "#64748b" }}>
                   <button style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, cursor: "pointer" }}><ImageIcon size={18} /> Photo</button>
                   <button style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, cursor: "pointer" }}><Globe size={18} /> Tout le Réseau</button>
                </div>
                <button style={{ background: DARK_NAVY, color: "#fff", border: "none", padding: "8px 24px", borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: "pointer" }}>Publier</button>
             </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
             {FEEDS.map(post => (
               <Card key={post.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                     <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                           {post.category === "Officiel" ? <ShieldCheck size={24} color={GOLD} /> : <Users size={24} color={DARK_NAVY} />}
                        </div>
                        <div>
                           <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 15, fontWeight: 900 }}>{post.author}</span>
                              {post.category === "Officiel" && <CheckCircle2 size={14} color={VISION_GREEN} fill={VISION_GREEN + "20"} />}
                           </div>
                           <div style={{ fontSize: 11, color: "#94a3b8" }}>{post.role} · {post.time}</div>
                        </div>
                     </div>
                     <MoreHorizontal size={20} color="#94a3b8" style={{ cursor: "pointer" }} />
                  </div>
                  
                  <p style={{ fontSize: 14, color: DARK_NAVY, lineHeight: 1.6, marginBottom: 20 }}>{post.text}</p>
                  
                  <div style={{ display: "flex", gap: 24, paddingTop: 16, borderTop: "1px solid #f8fafc" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 800, cursor: "pointer" }}><Heart size={18} /> {post.likes}</div>
                     <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 800, cursor: "pointer" }}><MessageSquare size={18} /> {post.replies}</div>
                     <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 800, cursor: "pointer" }}><Share2 size={18} /> Partager</div>
                  </div>
               </Card>
             ))}
          </div>
       </div>

       {/* MESSENGER SIDEBAR */}
       <div>
          <Card style={{ padding: 0, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
             <div style={{ padding: 24, background: DARK_NAVY, color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <MessageSquare size={20} color={GOLD} />
                      <h3 style={{ fontSize: 16, fontWeight: 900 }}>Messagerie Directe</h3>
                   </div>
                   <div style={{ width: 10, height: 10, background: VISION_GREEN, borderRadius: "50%" }}></div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                   <Search size={14} color="#94a3b8" />
                   <input placeholder="Rechercher partenaire..." style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: "#fff", width: "100%" }} />
                </div>
             </div>
             
             <div style={{ flex: 1, padding: 24, overflowY: "auto", background: "#f8fafc" }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display: "flex", justifyContent: m.sender === 'Moi' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                     <div style={{ 
                        maxWidth: "80%", 
                        padding: "12px 16px", 
                        borderRadius: m.sender === 'Moi' ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        background: m.sender === 'Moi' ? DARK_NAVY : "#fff",
                        color: m.sender === 'Moi' ? "#fff" : DARK_NAVY,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                        border: m.sender === 'Moi' ? "none" : "1px solid #e2e8f0"
                     }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.text}</div>
                        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                     </div>
                  </div>
                ))}
             </div>

             <div style={{ padding: 20, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 10 }}>
                   <input 
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                     placeholder="Écrire un message..." 
                     style={{ flex: 1, border: "1px solid #e2e8f0", background: "#f8fafc", padding: "12px 16px", borderRadius: 12, fontSize: 13, outline: "none" }}
                   />
                   <button 
                     onClick={sendMessage}
                     style={{ background: DARK_NAVY, border: "none", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                   >
                     <Send size={18} color="#fff" />
                   </button>
                </div>
             </div>
          </Card>
          
          <div style={{ marginTop: 24, padding: 20, background: VISION_GREEN + "10", borderRadius: 24, border: `1px solid ${VISION_GREEN}20` }}>
             <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Award size={24} color={VISION_GREEN} />
                <div>
                   <div style={{ fontSize: 13, fontWeight: 900 }}>Ambassadeur de la Communauté</div>
                   <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Gagnez +50 Karma en aidant 5 nouveaux boutiquiers.</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
