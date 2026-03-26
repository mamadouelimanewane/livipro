import { useState, useEffect } from "react";
import { 
  Database, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Globe, 
  Lock,
  ArrowRight,
  Hexagon,
  Layers,
  Link as LinkIcon
} from "lucide-react";

const DARK_NAVY = "#0f172a";
const BLOCK_PURPLE = "#8b5cf6";
const GOLD = "#f59e0b";
const VISION_GREEN = "#10b981";

export default function LiviChain() {
  const [blocks, setBlocks] = useState([
    { height: 12409, hash: "0x8f2...1e3", tx: 42, type: "Tontine Payout", status: "Validated" },
    { height: 12408, hash: "0x3a1...9d0", tx: 12, type: "Fractional Truck Share", status: "Minted" },
    { height: 12407, hash: "0x7c4...5b2", tx: 8, type: "Geo-Stamp Receipt", status: "Immutable" }
  ]);

  const [activeTab, setActiveTab] = useState("ledger"); // ledger | tokens | smart-contracts

  return (
    <div style={{ padding: 20, fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
             <h2 style={{ fontSize: 20, fontWeight: 900 }}>LiviChain Ledger</h2>
             <div style={{ fontSize: 11, color: BLOCK_PURPLE, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={12} /> Réseau Privé LiviPro (Nodes: 14)
             </div>
          </div>
          <div style={{ background: BLOCK_PURPLE, width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Layers size={22} color="#fff" />
          </div>
       </div>

       <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 10 }}>
          {["ledger", "tokens", "smart"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{ flexShrink: 0, background: activeTab === tab ? BLOCK_PURPLE : "#fff", color: activeTab === tab ? "#fff" : "#64748b", border: activeTab === tab ? "none" : "1px solid #f1f5f9", padding: "10px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
               {tab === "ledger" ? "Registre Public" : tab === "tokens" ? "Tokenisation Flotte" : "Smart Contracts"}
            </button>
          ))}
       </div>

       {activeTab === "ledger" && (
         <div className="animate-fade-in">
            {blocks.map((block, idx) => (
              <div key={idx} style={{ background: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, border: "1px solid #f1f5f9", position: "relative" }}>
                 <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)", width: 4, height: 24, background: BLOCK_PURPLE, borderRadius: 2 }}></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                       <div style={{ fontSize: 10, fontWeight: 800, color: BLOCK_PURPLE }}>BLOCK #{block.height}</div>
                       <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{block.type}</div>
                       <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginTop: 4 }}>{block.hash}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                       <div style={{ fontSize: 10, background: "#f5f3ff", color: BLOCK_PURPLE, padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>{block.status}</div>
                       <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{block.tx} Transactions</div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
       )}

       {activeTab === "tokens" && (
         <div className="animate-fade-in">
            <div style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", borderRadius: 24, padding: 24, color: "#fff", marginBottom: 20 }}>
               <Hexagon size={40} color={GOLD} style={{ marginBottom: 16 }} />
               <h3 style={{ fontSize: 18, fontWeight: 900 }}>Micro-Tokenisation LiviPro</h3>
               <p style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.5, marginTop: 8 }}>
                  Permettez aux boutiquiers d'acheter des "LiviTruck-Tokens" (LTT). Chaque token représente une fraction de propriété d'un camion et génère des dividendes en temps réel.
               </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
               <div style={{ background: "#fff", padding: 16, borderRadius: 20, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>PRIX DU TOKEN</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: DARK_NAVY }}>5.000 FCFA</div>
               </div>
               <div style={{ background: "#fff", padding: 16, borderRadius: 20, border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>RENDEMENT EST.</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: VISION_GREEN }}>14% Annuel</div>
               </div>
            </div>

            <button style={{ width: "100%", marginTop: 20, background: DARK_NAVY, color: "#fff", border: "none", padding: 16, borderRadius: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
               <Zap size={18} color={GOLD} /> Émettre des Tokens (ICO Privée)
            </button>
         </div>
       )}

       {activeTab === "smart" && (
         <div className="animate-fade-in">
            <div style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #f1f5f9", marginBottom: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#f0fdf4", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <ShieldCheck size={24} color={VISION_GREEN} />
                  </div>
                  <div>
                     <div style={{ fontSize: 15, fontWeight: 800 }}>Contrat Tontine Auto-Pay</div>
                     <div style={{ fontSize: 10, color: VISION_GREEN, fontWeight: 800 }}>ACTIVE & SCÉLLÉ</div>
                  </div>
               </div>
               <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4, marginBottom: 16 }}>
                  Exécution automatique : Si [Date=31] ET [Solde_Tontine=100%] -> Transfert [PayOut] -> [Gagnant_Cycle]. Zéro intervention humaine.
               </p>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>GAS FEE: 0.00 LVC</div>
                  <button style={{ background: "#f1f5f9", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>Voir Code</button>
               </div>
            </div>
         </div>
       )}

       <div style={{ marginTop: 30, padding: 20, background: "#f1f5f9", borderRadius: 24, textAlign: "center" }}>
         <LinkIcon size={32} color={BLOCK_PURPLE} style={{ margin: "0 auto 12px" }} />
         <div style={{ fontSize: 16, fontWeight: 900 }}>Pourquoi la Blockchain ?</div>
         <p style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.5 }}>
            Elle élimine le besoin de confiance mutuelle. Les boutiquiers savent que leurs dividendes et paiements sont garantis par le code, pas par une promesse humaine.
         </p>
       </div>
    </div>
  );
}
