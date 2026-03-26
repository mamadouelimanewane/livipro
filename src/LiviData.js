export const PRODUCTS = [
  // Céréales
  { id: "p1", name: "Riz Parfumé (Sac 50kg)", price: 21500, stock: 450, promo: false, category: "Céréales", wholesaler: "Grossiste Al-Amine" },
  { id: "p2", name: "Riz Brisé (Sac 50kg)", price: 18500, stock: 1200, promo: true, category: "Céréales", wholesaler: "Diagne Distribution" },
  { id: "p3", name: "Sucre St Louis (Fardeau)", price: 21000, stock: 15, promo: false, category: "Alimentaire", wholesaler: "Ets Saliou" },
  // Alimentaire
  { id: "p4", name: "Huile Dinor 20L", price: 28500, stock: 80, promo: true, category: "Alimentaire", wholesaler: "Dakar Port Hub" },
  { id: "p5", name: "Lait Nido (Carton 12)", price: 45000, stock: 210, promo: false, category: "Laitier", wholesaler: "Mboro Distribution" },
  { id: "p6", name: "Café Touba (Lot 10)", price: 7500, stock: 140, promo: false, category: "Boissons", wholesaler: "Diagne Distribution" },
  { id: "p7", name: "Pâtes Madar (Carton)", price: 12500, stock: 95, promo: false, category: "Alimentaire", wholesaler: "Ets Saliou" },
  // Entretien
  { id: "p8", name: "Savon Diama (Lot 24)", price: 6200, stock: 300, promo: false, category: "Entretien", wholesaler: "Dakar Port Hub" },
  { id: "p9", name: "Omo 1kg (Lot 12)", price: 18000, stock: 55, promo: false, category: "Entretien", wholesaler: "Grossiste Al-Amine" }
];

export const MEMBERS = [
  { id: "M1", type: "wholesaler", name: "Grossiste Al-Amine", location: "Dakar Port, Zone B", phone: "+221 77 123 45 67", rating: 4.8, status: "Certifié Platinum", karma: 980 },
  { id: "M2", type: "boutique", name: "Supermarché Médina", location: "Rue 10 x Blaise Diagne", phone: "+221 78 987 65 43", rating: 4.9, status: "A+ Karma", karma: 942 },
  { id: "M3", type: "wholesaler", name: "Diagne Distribution", location: "Kaolack Marché Central", phone: "+221 76 543 21 09", rating: 4.7, status: "Actif", karma: 850 },
  { id: "M4", type: "boutique", name: "Alimentation Pikine", location: "Bountou Pikine", phone: "+221 77 111 22 33", rating: 4.5, status: "Sociétaire", karma: 720 },
  { id: "M5", type: "boutique", name: "Boutique Podor Hub", location: "Quartier Escale, Podor", phone: "+221 70 444 55 66", rating: 4.3, status: "Relais S3", karma: 810 },
  { id: "M6", type: "wholesaler", name: "Mboro Distribution", location: "Zone Maraîchère, Mboro", phone: "+221 77 333 44 55", rating: 4.6, status: "Producteur Local", karma: 890 }
];

export const LOANS = [
  { id: "LN-2026-001", applicant: "Supermarché Médina", amount: "2.500.000 F", type: "Réassort Flash", risk: "Bas", score: 942, status: "Validé" },
  { id: "LN-2026-002", applicant: "Alimentation Pikine", amount: "4.800.000 F", type: "Expansion Camion", risk: "Moyen", score: 720, status: "En Audit" },
  { id: "LN-2026-003", applicant: "Boutique Podor Hub", amount: "1.200.000 F", type: "Fonds de Roulement", risk: "Bas", score: 810, status: "Attente Signature" }
];

export const FLEET = [
  { id: "DK-2211-A", name: "Vaisseau-Mère North", type: "Mothership", driver: "Amath Sy", fuel: 85, cargo: 92, status: "Ancré (Thiès)" },
  { id: "DK-4481-M", name: "LiviAnt 01", type: "Ant", driver: "Ibrahima Fall", fuel: 40, cargo: 12, status: "En Livraison (Médina)" },
  { id: "SL-0012-P", name: "Pick-up Relais", type: "Relay", driver: "Samba Ka", fuel: 72, cargo: 100, status: "Transit Saint-Louis" }
];

export const RELAY_STAGES = [
  { 
    id: "COR-NORTH-01", 
    route: "Dakar → Saint-Louis → Podor", 
    stages: [
      { segment: "Dakar → Thiès", status: "Terminé", driver: "Pape Diouf", vehicle: "Semi-DK-22" },
      { segment: "Thiès → Saint-Louis", status: "Terminé", driver: "Amath Sy", vehicle: "Porteur-DK-44" },
      { segment: "Saint-Louis → Podor", status: "En Cours", driver: "Ibrahima Fall", vehicle: "4x4-DK-11" }
    ]
  }
];
