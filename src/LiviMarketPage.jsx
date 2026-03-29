import { useState } from 'react';
import { ShoppingBag, TrendingUp, Zap, ArrowLeft, Package, Search, LayoutDashboard } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from './useLiviData';

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", ...style }}>{children}</div>
);

const Badge = ({ children, bg, color }) => (
  <span style={{ fontSize: 10, fontWeight: 900, background: bg, color: color, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" }}>{children}</span>
);

const ProductCard = ({ p }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image Header with fallback */}
      <div style={{ 
        height: 200, 
        background: imgError || !p.image_url ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#f8fafc', 
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {p.image_url && !imgError ? (
          <img 
            src={p.image_url} 
            alt={p.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Package size={64} color="rgba(255,255,255,0.1)" />
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, marginTop: 8 }}>PARTENAIRE LIVIPRO</div>
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Badge bg={p.stock < 50 ? "#fef2f2" : "#f0fdf4"} color={p.stock < 50 ? "#ef4444" : "#22c55e"}>
              {p.stock < 50 ? "Bientôt Épuisé" : "EN STOCK"}
          </Badge>
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 6, lineHeight: 1.2 }}>{p.name}</h3>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <LayoutDashboard size={14} /> Grossiste: <span style={{ color: '#6366f1' }}>{p.wholesaler || "Hub Dakar"}</span>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>PRIX B2B</div>
                <div style={{ fontSize: 20, fontWeight: 950, color: '#0f172a' }}>{p.price?.toLocaleString()} F</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>DISPO.</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#6366f1' }}>{p.stock} UN</div>
            </div>
          </div>
          
          <button style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            Contacter pour le lot <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default function LiviMarketPage() {
  const { data: products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const isMobile = window.innerWidth < 768;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 80, fontFamily: "'Outfit', sans-serif" }}>
      {/* Header Premium (Compact on mobile) */}
      <div style={{ 
        background: '#0f172a', 
        padding: isMobile ? '20px 20px 40px' : '40px 5% 60px', 
        color: '#fff', 
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32,
        transition: 'padding 0.3s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 20 : 32 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={isMobile ? 18 : 20} /> <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>Hub</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 950, letterSpacing: '-1.5px', margin: 0 }}>LiviMarket™</h2>
          </div>
        </div>
        
        <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 950, marginBottom: 8, lineHeight: 1 }}>Promotions <span style={{ color: '#f59e0b' }}>B2B</span></h1>
        <p style={{ color: '#94a3b8', fontSize: isMobile ? 14 : 16, maxWidth: 600, margin: 0 }}>Les meilleures opportunités du Sénégal en temps réel.</p>
        
        <div style={{ marginTop: 24, display: 'flex', gap: 10, maxWidth: 800 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
             <Search size={16} color="#94a3b8" />
             <input 
               placeholder="Produit..." 
               style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: 14 }}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '0 16px', borderRadius: 16, fontWeight: 950, fontSize: 13 }}>Trier</button>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: -20 }}>
        {/* Featured Section (Touch Slider) */}
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          marginBottom: 32, 
          overflowX: 'auto', 
          paddingBottom: 10, 
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ minWidth: isMobile ? 260 : 320, background: 'linear-gradient(135deg, #6366f1, #4338ca)', padding: isMobile ? 24 : 32, borderRadius: 24, color: '#fff', boxShadow: '0 15px 30px rgba(99,102,241,0.2)' }}>
             <Zap size={isMobile ? 24 : 32} style={{ marginBottom: 16 }} />
             <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>OFFRE ÉCLAIR</div>
             <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, marginTop: 4 }}>-15% Riz Siam</div>
             <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, display: 'inline-block', marginTop: 12, fontWeight: 800 }}>H-4 FIN</div>
          </div>
          <div style={{ minWidth: isMobile ? 260 : 320, background: 'linear-gradient(135deg, #10b981, #047857)', padding: isMobile ? 24 : 32, borderRadius: 24, color: '#fff', boxShadow: '0 15px 30px rgba(16,185,129,0.2)' }}>
             <TrendingUp size={isMobile ? 24 : 32} style={{ marginBottom: 16 }} />
             <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>TOP DÉBIT</div>
             <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, marginTop: 4 }}>Huile Dinor 20L</div>
             <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, display: 'inline-block', marginTop: 12, fontWeight: 800 }}>STOCK FRAIS</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 950, color: '#0f172a', margin: 0 }}>Catalogue</h2>
          <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800 }}>{filteredProducts.length} ARTICLES</div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>SYNCHRONISATION...</div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: isMobile ? 16 : 24, 
            marginBottom: 40 
          }}>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>

      {/* Persistent Mobile Action Bar */}
      {isMobile && (
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          background: '#fff', borderTop: '1px solid #e2e8f0', 
          padding: '12px 20px', display: 'flex', gap: 12, 
          zIndex: 1000, paddingBottom: 'calc(12px + env(safe-area-inset-bottom))'
        }}>
          <button style={{ flex: 1, background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 14 }}>Aide Directe</button>
          <button style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 900, fontSize: 14 }}>Connexion Pro</button>
        </div>
      )}
    </div>
  );
}
