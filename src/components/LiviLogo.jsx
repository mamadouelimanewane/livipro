export default function LiviLogo({ size = 120, style = {} }) {
  // Couleurs LiviPro
  const PURPLE = "#6366f1"; // Grossiste
  const GREEN = "#10b981";  // Boutiquier
  const ORANGE = "#f59e0b";  // Livreur

  const strokeWidth = 8;
  const radius = 35;
  
  return (
    <div style={{ display: 'inline-block', ...style }}>
      <svg 
        width={size} 
        height={size * 0.8} 
        viewBox="0 0 200 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.3))' }}
      >
        {/* Anneau Bas Gauche - GREEN (On le dessine en entier avant les autres) */}
        <circle 
          cx="70" cy="100" r={radius} 
          stroke={GREEN} strokeWidth={strokeWidth} 
        />
        
        {/* Anneau Bas Droite - ORANGE */}
        <circle 
          cx="130" cy="100" r={radius} 
          stroke={ORANGE} strokeWidth={strokeWidth} 
        />

        {/* Anneau du Haut (Milieu) - PURPLE */}
        <circle 
          cx="100" cy="55" r={radius} 
          stroke={PURPLE} strokeWidth={strokeWidth} 
        />

        {/* Masquage de continuité pour l'entrelacement parfait */}
        <path 
          d="M70 65 A35 35 0 0 1 100 95" 
          stroke={GREEN} strokeWidth={strokeWidth} strokeLinecap="round" 
        />
        <path 
          d="M100 20 A35 35 0 0 1 135 55" 
          stroke={PURPLE} strokeWidth={strokeWidth} strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}
