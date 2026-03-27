// ================================================
// LIVIPRO B2B - DONNÉES CENTRALISÉES
// Données de démonstration pour le Ministère du Commerce du Sénégal
// ================================================

export const PRODUCTS = [
  // Céréales - Marchés Stratégiques Nationaux
  { id: "p1", name: "Riz Parfumé Thai (Sac 50kg)", price: 21500, stock: 450, promo: false, category: "Céréales", wholesaler: "Grossiste Al-Amine", origin: "Importation - Port de Dakar" },
  { id: "p2", name: "Riz Brisé Local Casamance (Sac 50kg)", price: 18500, stock: 1200, promo: true, category: "Céréales", wholesaler: "Coopérative Rizicole Sédhiou", origin: "Production Locale 🇸🇳" },
  { id: "p3", name: "Sucre Subventionné (Gouv SN - Fardeau)", price: 18000, stock: 5000, promo: true, category: "Soutien Étatique", wholesaler: "Ministère du Commerce", origin: "Compagnie Sucrière Sénégalaise (CSS)" },
  { id: "p3b", name: "Sucre St Louis (Fardeau)", price: 21000, stock: 15, promo: false, category: "Alimentaire", wholesaler: "Ets Saliou", origin: "CSS Richard-Toll" },
  // Alimentaire - Denrées de Première Nécessité
  { id: "p4", name: "Huile Dinor 20L", price: 28500, stock: 80, promo: true, category: "Alimentaire", wholesaler: "Dakar Port Hub", origin: "Importation" },
  { id: "p5", name: "Lait Nido (Carton 12)", price: 45000, stock: 210, promo: false, category: "Laitier", wholesaler: "Mboro Distribution", origin: "Nestlé Abidjan" },
  { id: "p6", name: "Café Touba Artisanal (Lot 10kg)", price: 7500, stock: 140, promo: false, category: "Boissons", wholesaler: "Diagne Distribution", origin: "Touba, Sénégal 🇸🇳" },
  { id: "p7", name: "Pâtes Madar (Carton)", price: 12500, stock: 95, promo: false, category: "Alimentaire", wholesaler: "Ets Saliou", origin: "Importation Turquie" },
  // Entretien
  { id: "p8", name: "Savon Diama (Lot 24)", price: 6200, stock: 300, promo: false, category: "Entretien", wholesaler: "Dakar Port Hub", origin: "Sénégal 🇸🇳" },
  { id: "p9", name: "Omo 1kg (Lot 12)", price: 18000, stock: 55, promo: false, category: "Entretien", wholesaler: "Grossiste Al-Amine", origin: "Unilever" },
  // BTP - Matériaux de Construction (Nouveau segment)
  { id: "p10", name: "Ciment SOCOCIM (Tonne)", price: 73000, stock: 200, promo: false, category: "BTP", wholesaler: "Ets Saliou", origin: "Rufisque, Sénégal 🇸🇳" },
  { id: "p11", name: "Fer à Béton (Barre 12mm x100)", price: 425000, stock: 30, promo: false, category: "BTP", wholesaler: "Dakar Port Hub", origin: "Importation Turquie" },
  // Agricole - Intrants
  { id: "p12", name: "Engrais NPK (Sac 50kg)", price: 32000, stock: 800, promo: true, category: "Agricole", wholesaler: "Ministère du Commerce", origin: "Programme National Souveraineté Alimentaire 🇸🇳" },
];

export const MEMBERS = [
  // Institutions (Sponsor)
  { id: "M0", type: "institutional", name: "Ministère du Commerce, de la Consommation et des PME", location: "Diamniadio, Dakar", phone: "+221 33 800 00 00", rating: 5.0, status: "Sponsor Officiel & Régulateur", karma: 9999, ninea: "GOUV-SN-001" },
  // Grossistes
  { id: "M1", type: "wholesaler", name: "Grossiste Al-Amine", location: "Dakar Port, Zone B", phone: "+221 77 123 45 67", rating: 4.8, status: "Certifié Platinum", karma: 980, ninea: "5472631001" },
  { id: "M3", type: "wholesaler", name: "Diagne Distribution", location: "Kaolack Marché Central", phone: "+221 76 543 21 09", rating: 4.7, status: "Actif", karma: 850, ninea: "3847291002" },
  { id: "M6", type: "wholesaler", name: "Mboro Distribution", location: "Zone Maraîchère, Mboro", phone: "+221 77 333 44 55", rating: 4.6, status: "Producteur Local", karma: 890, ninea: "7382940003" },
  { id: "M7", type: "wholesaler", name: "Ets Saliou & Frères", location: "Saint-Louis, Sor", phone: "+221 76 222 33 44", rating: 4.5, status: "Certifié Gold", karma: 870, ninea: "9281730004" },
  { id: "M8", type: "wholesaler", name: "Coopérative Rizicole Sédhiou", location: "Sédhiou Centre", phone: "+221 77 555 66 77", rating: 4.4, status: "Production Nationale", karma: 830, ninea: "6183720005" },
  // Boutiquiers (Réseau Distribution de proximité)
  { id: "M2", type: "boutique", name: "Supermarché Médina", location: "Rue 10 x Blaise Diagne, Dakar", phone: "+221 78 987 65 43", rating: 4.9, status: "Hub Relais S1", karma: 942, ninea: "4729310006" },
  { id: "M4", type: "boutique", name: "Alimentation Pikine", location: "Bountou Pikine, Dakar", phone: "+221 77 111 22 33", rating: 4.5, status: "Sociétaire Tontine", karma: 720, ninea: "8293740007" },
  { id: "M5", type: "boutique", name: "Boutique Podor Hub", location: "Quartier Escale, Podor", phone: "+221 70 444 55 66", rating: 4.3, status: "Relais Fleuve S3", karma: 810, ninea: "1928370008" },
  { id: "M9", type: "boutique", name: "Kiosque Thiès Gare", location: "Avenue Léopold Sédar Senghor, Thiès", phone: "+221 77 888 99 00", rating: 4.2, status: "Nouveau Partenaire", karma: 650, ninea: "5738291009" },
  { id: "M10", type: "boutique", name: "Épicerie Ziguinchor Centre", location: "Marché St-Maur, Ziguinchor", phone: "+221 78 777 88 99", rating: 4.6, status: "Relais Casamance S2", karma: 780, ninea: "3918270010" },
];

export const LOANS = [
  { id: "LN-2026-001", applicant: "Supermarché Médina", amount: "2.500.000 F", type: "Réassort Flash", risk: "Bas", score: 942, status: "Validé", guarantor: "Ministère du Commerce (Programme PME)" },
  { id: "LN-2026-002", applicant: "Alimentation Pikine", amount: "4.800.000 F", type: "Expansion Camion", risk: "Moyen", score: 720, status: "En Audit", guarantor: "Auto-garanti (Karma)" },
  { id: "LN-2026-003", applicant: "Boutique Podor Hub", amount: "1.200.000 F", type: "Fonds de Roulement", risk: "Bas", score: 810, status: "Attente Signature", guarantor: "Tontine LiviPro #12" },
  { id: "LN-2026-004", applicant: "Épicerie Ziguinchor Centre", amount: "3.200.000 F", type: "Stock Hivernal Casamance", risk: "Bas", score: 780, status: "Validé", guarantor: "Coopérative Rizicole Sédhiou" },
];

export const FLEET = [
  { id: "DK-2211-A", name: "Vaisseau-Mère North", type: "Mothership", driver: "Amath Sy", fuel: 85, cargo: 92, status: "Ancré (Thiès)" },
  { id: "DK-4481-M", name: "LiviAnt 01", type: "Ant", driver: "Ibrahima Fall", fuel: 40, cargo: 12, status: "En Livraison (Médina)" },
  { id: "SL-0012-P", name: "Pick-up Relais", type: "Relay", driver: "Samba Ka", fuel: 72, cargo: 100, status: "Transit Saint-Louis" },
  { id: "DK-9910-G", name: "Camion Frigorifique #1", type: "Froid", driver: "Moussa Sow", fuel: 60, cargo: 80, status: "Route Kaolack → Ziguinchor" },
];

export const RELAY_STAGES = [
  { 
    id: "COR-NORTH-01", 
    route: "Dakar → Saint-Louis → Podor",
    sponsor: "Ministère du Commerce - Corridor Nord",
    stages: [
      { segment: "Dakar → Thiès", status: "Terminé", driver: "Pape Diouf", vehicle: "Semi-DK-22" },
      { segment: "Thiès → Saint-Louis", status: "Terminé", driver: "Amath Sy", vehicle: "Porteur-DK-44" },
      { segment: "Saint-Louis → Podor", status: "En Cours", driver: "Ibrahima Fall", vehicle: "4x4-DK-11" }
    ]
  },
  { 
    id: "COR-SOUTH-01", 
    route: "Dakar → Kaolack → Ziguinchor",
    sponsor: "Programme Casamance - Gouv SN",
    stages: [
      { segment: "Dakar → Kaolack", status: "Terminé", driver: "Moussa Sow", vehicle: "Frigo-DK-99" },
      { segment: "Kaolack → Kolda", status: "En Cours", driver: "Oumar Ba", vehicle: "Porteur-KL-12" },
      { segment: "Kolda → Ziguinchor", status: "Planifié", driver: "À assigner", vehicle: "Relais Local" }
    ]
  }
];

export const GROUPAGE_OFFERS = [
  { id: "GRP-001", productId: "p5", name: "Opération Lait Nido", minOrders: 5, currentOrders: 2, discount: "15%", deadline: "2 jours", status: "En cours" },
  { id: "GRP-002", productId: "p1", name: "Bulk Riz Parfumé", minOrders: 10, currentOrders: 8, discount: "20%", deadline: "6h restantes", status: "Presque plein" },
  { id: "GRP-003", productId: "p3", name: "Campagne Sucre Solidarité (Ministère)", minOrders: 50, currentOrders: 42, discount: "35%", deadline: "15 jours", status: "Soutenu par le Ministère du Commerce 🇸🇳", sponsor: true },
  { id: "GRP-004", productId: "p12", name: "Engrais Solidaire - Saison Agricole", minOrders: 100, currentOrders: 67, discount: "40%", deadline: "30 jours", status: "Programme National", sponsor: true },
];

export const RELAY_POINTS = [
  { id: "RLY-001", shopName: "Supermarché Médina (Relais Central)", capacity: "80%", earningTotal: "125.000 F", status: "Actif", zone: "Dakar Centre" },
  { id: "RLY-002", shopName: "Alimentation Pikine", capacity: "30%", earningTotal: "45.000 F", status: "Prêt", zone: "Banlieue Dakar" },
  { id: "RLY-003", shopName: "Boutique Podor Hub", capacity: "55%", earningTotal: "82.000 F", status: "Actif", zone: "Fleuve Nord" },
  { id: "RLY-004", shopName: "Épicerie Ziguinchor Centre", capacity: "40%", earningTotal: "63.000 F", status: "Nouveau", zone: "Casamance" },
];

export const SOCIAL_FEED = [
  { id: "S0", author: "Ministère du Commerce", text: "✅ COMMUNIQUÉ OFFICIEL : Le Ministère annonce une subvention sur le Sucre Local pour les mois de Ramadan. Les prix sont bloqués via LiviChain sur notre portail. Toute spéculation sera sanctionnée.", time: "Il y a 10 min", likes: 542, verified: true },
  { id: "S1", author: "Ministère du Commerce", text: "📊 ALERTE PRIX : L'observatoire national des prix constate une hausse de 3% sur le Riz Importé. Les grossistes certifiés LiviPro maintiennent leurs tarifs grâce au programme de stabilisation.", time: "Il y a 45 min", likes: 318, verified: true },
  { id: "S2", author: "Grossiste Al-Amine", text: "🚚 ARRIVÉE MASSIVE : 500 sacs de Sucre St-Louis disponibles au Port. Prix préférentiel pour les membres LiviPro.", time: "Il y a 2h", likes: 24 },
  { id: "S3", author: "Coopérative Rizicole Sédhiou", text: "🌾 PRODUCTION LOCALE : Récolte record de riz paddy en Casamance. 200 tonnes disponibles directement via LiviGroupage à prix producteur.", time: "Il y a 3h", likes: 89 },
  { id: "S4", author: "Système LiviPro", text: "⚠️ ALERTE TRAFIC : Zone Fass bloquée par travaux. Les livreurs de la tournée DKR-9824 auront 30mn de retard.", time: "Il y a 4h", likes: 5 },
];

// Statistiques nationales pour le tableau de bord Ministère
export const NATIONAL_STATS = {
  totalTransactions: "12.847",
  volumeTotal: "847.500.000 FCFA",
  boutiquesActives: 342,
  grossistesActifs: 28,
  livreursCertifies: 156,
  corridorsActifs: 4,
  tauxConformite: "97.3%",
  emploisIndirects: "+2.140",
  regionsConnectees: ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Kolda", "Sédhiou", "Podor"],
};
