-- ==============================================
-- LIVIPRO B2B - SCRIPT D'INITIALISATION SUPABASE
-- ==============================================

-- 1. CRÉATION DES TABLES
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'wholesaler', 'boutique', 'institutional'
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(50),
    rating NUMERIC(3, 1),
    status VARCHAR(100),
    karma INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    promo BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    wholesaler_id UUID REFERENCES public.members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.groupage_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    name VARCHAR(255) NOT NULL,
    min_orders INTEGER DEFAULT 5,
    current_orders INTEGER DEFAULT 0,
    discount VARCHAR(50),
    deadline VARCHAR(100),
    status VARCHAR(50) DEFAULT 'En cours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    time VARCHAR(100),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_code VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    total_stops INTEGER DEFAULT 0,
    completed_stops INTEGER DEFAULT 0,
    cash_collected INTEGER DEFAULT 0,
    fleet_roi VARCHAR(50),
    status VARCHAR(50) DEFAULT 'En cours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID REFERENCES public.delivery_tours(id),
    stop_order INTEGER NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    items_to_deliver INTEGER DEFAULT 0,
    expected_cash INTEGER DEFAULT 0,
    lat NUMERIC(10, 6),
    lng NUMERIC(10, 6),
    ai_prediction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==============================================
-- 2. INSERTION DES DONNÉES DE DÉMONSTRATION
-- ==============================================

-- Vidage préventif
TRUNCATE TABLE public.social_feed, public.groupage_offers, public.products, public.members, public.delivery_stops, public.delivery_tours RESTART IDENTITY CASCADE;

-- Insertion Membres Spéciaux (Ministère sponsor) & Acteurs B2B
INSERT INTO public.members (id, type, name, location, phone, rating, status, karma) VALUES
('b33fffa1-a7fc-4e4f-8b2b-111111111111', 'institutional', 'Ministère du Commerce - Gouv SN', 'Dakar, Diamniadio', '+221 33 800 00 00', 5.0, 'Sponsor Officiel & Régulateur', 9999),
('b33fffa2-a7fc-4e4f-8b2b-222222222222', 'wholesaler', 'Grossiste Al-Amine', 'Dakar Port', '+221 77 123 45 67', 4.8, 'Certifié Platinum', 980),
('b33fffa3-a7fc-4e4f-8b2b-333333333333', 'boutique', 'Supermarché Médina', 'Rue 10 x Blaise Diagne', '+221 78 987 65 43', 4.9, 'Hub Relais S1', 942),
('b33fffa4-a7fc-4e4f-8b2b-444444444444', 'wholesaler', 'Diagne Distribution', 'Kaolack Marché Central', '+221 76 543 21 09', 4.7, 'Actif', 850);

-- Insertion Produits
INSERT INTO public.products (id, name, price, stock, promo, category, wholesaler_id) VALUES
('c44fffa1-b8fc-5f5a-9c3c-111111111111', 'Riz Parfumé (Sac 50kg)', 21500, 450, false, 'Céréales', 'b33fffa2-a7fc-4e4f-8b2b-222222222222'),
('c44fffa2-b8fc-5f5a-9c3c-222222222222', 'Huile Dinor 20L', 28500, 80, true, 'Alimentaire', 'b33fffa4-a7fc-4e4f-8b2b-444444444444'),
('c44fffa3-b8fc-5f5a-9c3c-333333333333', 'Sucre Subventionné (Gouv SN)', 18000, 5000, true, 'Soutien Étatique', 'b33fffa1-a7fc-4e4f-8b2b-111111111111');

-- Insertion Groupages
INSERT INTO public.groupage_offers (product_id, name, min_orders, current_orders, discount, deadline, status) VALUES
('c44fffa1-b8fc-5f5a-9c3c-111111111111', 'Opération Bulk Riz Parfumé', 10, 8, '20%', '6h restantes', 'Presque plein'),
('c44fffa3-b8fc-5f5a-9c3c-333333333333', 'Campagne de Solidarité Étatique - Sucre', 50, 42, '35%', '15 jours', 'Soutenu par le Ministère');

-- Insertion Flux Social
INSERT INTO public.social_feed (author_name, text, time, likes) VALUES
('Ministère du Commerce', '✅ COMMUNIQUÉ : Le Ministère annonce une subvention sur le Sucre Local pour les mois de Ramadan. Les prix sont bloqués via LiviChain sur notre portail.', 'Il y a 10 min', 542),
('Grossiste Al-Amine', '🚚 ARIVÉE MASSIVE : 500 sacs de Sucre St-Louis disponibles au Port. Validé par LiviPro.', 'Il y a 2h', 24);

-- Insertion Tournée Livreur
INSERT INTO public.delivery_tours (id, tour_code, driver_name, total_stops, completed_stops, cash_collected, fleet_roi, status) VALUES
('d55fffa1-c9fc-6a6b-ad4d-111111111111', 'TRN-DKR-9824', 'Ousmane Diallo', 8, 1, 1450000, '27.500 FCFA', 'En cours');

INSERT INTO public.delivery_stops (tour_id, stop_order, shop_name, address, status, items_to_deliver, expected_cash, lat, lng, ai_prediction) VALUES
('d55fffa1-c9fc-6a6b-ad4d-111111111111', 1, 'Boutique Serigne Saliou', 'Marché Fass, Dakar', 'completed', 25, 250000, 14.6850, -17.4582, NULL),
('d55fffa1-c9fc-6a6b-ad4d-111111111111', 2, 'Supermarché Al-Amine', 'Avenue Cheikh Anta Diop, Point E', 'next', 60, 1200000, 14.6928, -17.4627, 'Ce partenaire a un Karma de 942. Il a réduit ses commandes de Boissons Gazéifiées de 15%. Proposez le déstockage de la palette TRN-X1 (+5 cartons) avec remise Associé.'),
('d55fffa1-c9fc-6a6b-ad4d-111111111111', 3, 'Alimentation Ndiaye & Fils', 'Médina, Rue 6', 'pending', 12, 85000, 14.6796, -17.4475, NULL);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupage_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_stops ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture publique (pour l'environnement Alpha)
CREATE POLICY "Lecture publique autorisée" ON public.members FOR SELECT USING (true);
CREATE POLICY "Lecture publique autorisée" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lecture publique autorisée" ON public.groupage_offers FOR SELECT USING (true);
CREATE POLICY "Lecture publique autorisée" ON public.social_feed FOR SELECT USING (true);
CREATE POLICY "Lecture publique autorisée" ON public.delivery_tours FOR SELECT USING (true);
CREATE POLICY "Lecture publique autorisée" ON public.delivery_stops FOR SELECT USING (true);
