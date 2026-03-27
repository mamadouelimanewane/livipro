import { useState } from 'react';
import { PlayCircle, Award, Clock, Star, Users, Briefcase, GraduationCap, ArrowRight, Zap, Target, BookOpen, HandCoins } from 'lucide-react';

const VISION_GREEN = "#10b981";
const GOLD = "#f59e0b";
const DARK_NAVY = "#0f172a";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

export default function LiviAcademy() {
  const [activeCourse, setActiveCourse] = useState(null);

  const COURSES = [
    { id: "c1", title: "Maîtriser le LiviWallet B2B", duration: "12 min", reward: "+15 Karma", level: "Débutant", category: "Finances", icon: <HandCoins size={24} color={GOLD} /> },
    { id: "c2", title: "Optimisation des Stocks Ramadan", duration: "24 min", reward: "+30 Karma", level: "Intermédiaire", category: "Logistique", icon: <BookOpen size={24} color={VISION_GREEN} /> },
    { id: "c3", title: "Marketing de Proximité", duration: "18 min", reward: "+20 Karma", level: "Débutant", category: "Ventes", icon: <Award size={24} color="#3b82f6" /> },
  ];

  return (
    <div className="animate-fade-in">
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
             <h2 style={{ fontSize: 24, fontWeight: 900 }}>LiviAcademy™ : Formation & Croissance</h2>
             <p style={{ fontSize: 13, color: "#64748b" }}>Apprenez les meilleures pratiques et gagnez des points de Karma.</p>
          </div>
          <div style={{ background: "#fff", padding: "10px 20px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
             <Star size={18} color={GOLD} /> <span style={{ fontSize: 13, fontWeight: 900 }}>Certifié LiviAcademy</span>
          </div>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {COURSES.map(course => (
            <Card key={course.id} style={{ borderBottom: activeCourse === course.id ? `6px solid ${GOLD}` : '1px solid #f1f5f9' }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 50, height: 50, background: "#f8fafc", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{course.icon}</div>
                  <div style={{ fontSize: 10, background: "#ecfdf5", color: VISION_GREEN, padding: "4px 8px", borderRadius: 8, fontWeight: 900 }}>{course.level}</div>
               </div>
               <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{course.title}</div>
               <div style={{ fontSize: 12, color: "#64748b", margin: "16px 0", display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} /> {course.duration}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: VISION_GREEN, fontWeight: 900 }}><Zap size={14} /> {course.reward}</div>
               </div>
               <button 
                onClick={() => setActiveCourse(course.id)}
                style={{ width: "100%", background: DARK_NAVY, color: "#fff", border: "none", padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
               >
                 <PlayCircle size={18} /> Lancer le Cours
               </button>
            </Card>
          ))}
       </div>

       {activeCourse && (
         <div style={{ marginTop: 40, borderTop: "1px solid #e2e8f0", paddingTop: 40 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, textAlign: "center" }}>Session Vidéo Interactive</h3>
            <div style={{ maxWidth: 800, margin: "0 auto", height: 450, background: DARK_NAVY, borderRadius: 32, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <PlayCircle size={80} color={GOLD} style={{ cursor: "pointer" }} />
               <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 32, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", borderRadius: "0 0 32px 32px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Leçon 1: Notions de Solvabilité B2B</div>
                  <div style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>Progression: 0%</div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
