-- ================================================
-- LIVIPRO B2B - SCHÉMA COMPLET ET DONNÉES RÉELLES
-- Version 2.0 - Mars 2026
-- Marché Sénégalais - Données réalistes FCFA
-- ================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- TABLES
-- ================================================

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(50),
    rating NUMERIC(3,1),
    status VARCHAR(100),
    karma INTEGER DEFAULT 0,
    email VARCHAR(255),
    city VARCHAR(100),
    wallet_balance BIGINT DEFAULT 0,
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
    unit VARCHAR(50) DEFAULT 'unité',
    sku VARCHAR(100),
    description TEXT,
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
    driver_id UUID REFERENCES public.members(id),
    total_stops INTEGER DEFAULT 0,
    completed_stops INTEGER DEFAULT 0,
    cash_collected BIGINT DEFAULT 0,
    fleet_roi VARCHAR(50),
    status VARCHAR(50) DEFAULT 'En cours',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID REFERENCES public.delivery_tours(id),
    stop_order INTEGER NOT NULL,
    shop_name VARCHAR(255),
    address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    items_to_deliver INTEGER DEFAULT 0,
    expected_cash BIGINT DEFAULT 0,
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    ai_prediction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES public.members(id),
    seller_id UUID REFERENCES public.members(id),
    total_amount BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'wave',
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price BIGINT NOT NULL,
    total_price BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    payment_provider VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesaler_id UUID REFERENCES public.members(id),
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wholesaler_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.karma_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    event_type VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    credit_limit BIGINT NOT NULL,
    used_amount BIGINT DEFAULT 0,
    available_amount BIGINT GENERATED ALWAYS AS (credit_limit - used_amount) STORED,
    interest_rate NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    next_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tontines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    monthly_amount BIGINT NOT NULL,
    total_members INTEGER DEFAULT 0,
    current_round INTEGER DEFAULT 1,
    total_rounds INTEGER DEFAULT 12,
    status VARCHAR(50) DEFAULT 'active',
    next_payout_date DATE,
    organizer_id UUID REFERENCES public.members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tontine_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tontine_id UUID REFERENCES public.tontines(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id),
    payout_order INTEGER,
    paid_rounds INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.price_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    wholesaler_id UUID REFERENCES public.members(id),
    price BIGINT NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_to DATE,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    doc_type VARCHAR(100) NOT NULL,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- TRUNCATE (reset)
-- ================================================
TRUNCATE TABLE public.kyc_documents, public.price_catalog, public.tontine_members, public.tontines,
    public.credit_facilities, public.notifications, public.karma_events, public.inventory,
    public.wallet_transactions, public.order_items, public.orders,
    public.delivery_stops, public.delivery_tours, public.social_feed,
    public.groupage_offers, public.products, public.members
    RESTART IDENTITY CASCADE;

-- ================================================
-- MEMBRES (30)
-- ================================================
INSERT INTO public.members (id, type, name, location, phone, rating, status, karma, email, city, wallet_balance) VALUES
-- Institutions (2)
('b1000001-0000-0000-0000-000000000001', 'institutional', 'Ministère du Commerce - Gouv SN', 'Dakar, Diamniadio', '+221 33 800 00 00', 5.0, 'Sponsor Officiel & Régulateur', 9999, 'commerce@gouv.sn', 'Dakar', 0),
('b1000001-0000-0000-0000-000000000002', 'institutional', 'ADEPME - Agence Développement PME', 'Dakar, Almadies', '+221 33 869 00 00', 4.9, 'Partenaire Institutionnel', 8500, 'info@adepme.sn', 'Dakar', 0),

-- Grossistes (10)
('b2000001-0000-0000-0000-000000000001', 'wholesaler', 'Grossiste Al-Amine', 'Dakar Port, Zone B', '+221 77 123 45 67', 4.8, 'Certifié Platinum', 980, 'alamine@livipro.sn', 'Dakar', 45000000),
('b2000001-0000-0000-0000-000000000002', 'wholesaler', 'Diagne Distribution Kaolack', 'Kaolack Marché Central', '+221 76 543 21 09', 4.7, 'Certifié Gold', 850, 'diagne.dist@livipro.sn', 'Kaolack', 28000000),
('b2000001-0000-0000-0000-000000000003', 'wholesaler', 'Ndiaye & Frères Import-Export', 'Thiès, Zone Industrielle', '+221 77 234 56 78', 4.6, 'Actif', 760, 'ndiaye.freres@livipro.sn', 'Thiès', 32000000),
('b2000001-0000-0000-0000-000000000004', 'wholesaler', 'Saloum Trading Company', 'Kaolack Baye Laye', '+221 76 345 67 89', 4.5, 'Actif', 710, 'saloum.trading@livipro.sn', 'Kaolack', 18000000),
('b2000001-0000-0000-0000-000000000005', 'wholesaler', 'Touba Distribution Mourtada', 'Touba, Darou Khoudoss', '+221 77 456 78 90', 4.7, 'Certifié Gold', 890, 'touba.dist@livipro.sn', 'Touba', 55000000),
('b2000001-0000-0000-0000-000000000006', 'wholesaler', 'Saint-Louis Commerce Oumar', 'Saint-Louis, Guet Ndar', '+221 78 567 89 01', 4.4, 'Actif', 680, 'stlouis.commerce@livipro.sn', 'Saint-Louis', 22000000),
('b2000001-0000-0000-0000-000000000007', 'wholesaler', 'Ziguinchor Négoce Africain', 'Ziguinchor, Boucotte', '+221 77 678 90 12', 4.5, 'Actif', 720, 'zig.negoce@livipro.sn', 'Ziguinchor', 19000000),
('b2000001-0000-0000-0000-000000000008', 'wholesaler', 'Diourbel Grands Stocks', 'Diourbel, Marché', '+221 76 789 01 23', 4.3, 'Actif', 640, 'diourbel.stocks@livipro.sn', 'Diourbel', 15000000),
('b2000001-0000-0000-0000-000000000009', 'wholesaler', 'Mbour Côtier Distribution', 'Mbour, Zone Commerciale', '+221 77 890 12 34', 4.6, 'Certifié Gold', 800, 'mbour.cotier@livipro.sn', 'Mbour', 25000000),
('b2000001-0000-0000-0000-000000000010', 'wholesaler', 'Pikine Entrepôt Général', 'Pikine, Thiaroye', '+221 78 901 23 45', 4.4, 'Actif', 660, 'pikine.entrepot@livipro.sn', 'Dakar', 20000000),

-- Boutiquiers (15)
('b3000001-0000-0000-0000-000000000001', 'boutique', 'Supermarché Médina Fatou', 'Médina, Rue 10 x Blaise Diagne', '+221 78 987 65 43', 4.9, 'Hub Relais S1', 942, 'medina.fatou@livipro.sn', 'Dakar', 3500000),
('b3000001-0000-0000-0000-000000000002', 'boutique', 'Alimentation Pikine Cheikh', 'Pikine, Bountou', '+221 77 111 22 33', 4.5, 'Sociétaire', 720, 'pikine.cheikh@livipro.sn', 'Dakar', 1800000),
('b3000001-0000-0000-0000-000000000003', 'boutique', 'Boutique Plateau Aminata', 'Plateau, Rue Vincens', '+221 76 222 33 44', 4.6, 'Hub Relais S2', 810, 'plateau.aminata@livipro.sn', 'Dakar', 2200000),
('b3000001-0000-0000-0000-000000000004', 'boutique', 'Mini-Market Almadies', 'Almadies, Rue 10', '+221 77 333 44 55', 4.7, 'Hub Relais S1', 880, 'almadies.market@livipro.sn', 'Dakar', 4100000),
('b3000001-0000-0000-0000-000000000005', 'boutique', 'Épicerie Ouakam Ibrahima', 'Ouakam, Rue Keur Massar', '+221 78 444 55 66', 4.3, 'Actif', 650, 'ouakam.ibrahima@livipro.sn', 'Dakar', 900000),
('b3000001-0000-0000-0000-000000000006', 'boutique', 'Alimentation Thiès Modou', 'Thiès, Quartier Randoulène', '+221 77 555 66 77', 4.5, 'Sociétaire', 730, 'thies.modou@livipro.sn', 'Thiès', 1500000),
('b3000001-0000-0000-0000-000000000007', 'boutique', 'Commerce Kaolack Rama', 'Kaolack, Médina', '+221 76 666 77 88', 4.4, 'Actif', 700, 'kaolack.rama@livipro.sn', 'Kaolack', 1200000),
('b3000001-0000-0000-0000-000000000008', 'boutique', 'Boutique Touba Serigne', 'Touba, Ndamatou', '+221 77 777 88 99', 4.6, 'Sociétaire', 780, 'touba.serigne@livipro.sn', 'Touba', 2000000),
('b3000001-0000-0000-0000-000000000009', 'boutique', 'Alimentation Saint-Louis Adja', 'Saint-Louis, Langue de Barbarie', '+221 78 888 99 00', 4.3, 'Actif', 620, 'stlouis.adja@livipro.sn', 'Saint-Louis', 850000),
('b3000001-0000-0000-0000-000000000010', 'boutique', 'Épicerie Ziguinchor Oumar', 'Ziguinchor, Tilène', '+221 77 999 00 11', 4.4, 'Actif', 660, 'zig.oumar@livipro.sn', 'Ziguinchor', 1100000),
('b3000001-0000-0000-0000-000000000011', 'boutique', 'Mini-Marché Mbour Astou', 'Mbour, Téfesse', '+221 76 100 11 22', 4.5, 'Sociétaire', 740, 'mbour.astou@livipro.sn', 'Mbour', 1600000),
('b3000001-0000-0000-0000-000000000012', 'boutique', 'Commerce Diourbel Binta', 'Diourbel, Keur Ngary', '+221 77 200 22 33', 4.2, 'Actif', 580, 'diourbel.binta@livipro.sn', 'Diourbel', 700000),
('b3000001-0000-0000-0000-000000000013', 'boutique', 'Alimentation Rufisque Lamine', 'Rufisque, Keury Souf', '+221 78 300 33 44', 4.6, 'Hub Relais S3', 820, 'rufisque.lamine@livipro.sn', 'Dakar', 2400000),
('b3000001-0000-0000-0000-000000000014', 'boutique', 'Boutique Guédiawaye Mariama', 'Guédiawaye, Wakhinane', '+221 77 400 44 55', 4.4, 'Actif', 680, 'guediawaye.mariama@livipro.sn', 'Dakar', 1300000),
('b3000001-0000-0000-0000-000000000015', 'boutique', 'Épicerie Yoff Pape', 'Yoff, Tonghor', '+221 76 500 55 66', 4.5, 'Sociétaire', 750, 'yoff.pape@livipro.sn', 'Dakar', 1700000),

-- Livreurs (3)
('b4000001-0000-0000-0000-000000000001', 'driver', 'Ousmane Diallo - Livreur', 'Dakar, Parcelles Assainies', '+221 77 010 20 30', 4.8, 'Disponible', 920, 'ousmane.diallo@livipro.sn', 'Dakar', 450000),
('b4000001-0000-0000-0000-000000000002', 'driver', 'Mamadou Sow - Livreur', 'Dakar, Grand Yoff', '+221 78 020 30 40', 4.6, 'En tournée', 780, 'mamadou.sow@livipro.sn', 'Dakar', 380000),
('b4000001-0000-0000-0000-000000000003', 'driver', 'Ibrahima Fall - Livreur', 'Thiès, Randoulène', '+221 77 030 40 50', 4.7, 'Disponible', 860, 'ibrahima.fall@livipro.sn', 'Thiès', 420000);

-- ================================================
-- PRODUITS (50)
-- ================================================
INSERT INTO public.products (id, name, price, stock, promo, category, wholesaler_id, unit, sku) VALUES
-- Céréales (8)
('c1000001-0000-0000-0000-000000000001', 'Riz Brisé 25% (Sac 50kg)', 16500, 2400, false, 'Céréales', 'b2000001-0000-0000-0000-000000000001', 'Sac 50kg', 'RIZ-BRS-50'),
('c1000001-0000-0000-0000-000000000002', 'Riz Entier Parfumé (Sac 50kg)', 21500, 450, true, 'Céréales', 'b2000001-0000-0000-0000-000000000001', 'Sac 50kg', 'RIZ-ENT-50'),
('c1000001-0000-0000-0000-000000000003', 'Riz Brisé Local Casamance (Sac 50kg)', 18500, 1200, true, 'Céréales', 'b2000001-0000-0000-0000-000000000007', 'Sac 50kg', 'RIZ-LOC-50'),
('c1000001-0000-0000-0000-000000000004', 'Mil Pénicillaire (Sac 50kg)', 14000, 800, false, 'Céréales', 'b2000001-0000-0000-0000-000000000002', 'Sac 50kg', 'MIL-PEN-50'),
('c1000001-0000-0000-0000-000000000005', 'Maïs Grain (Sac 50kg)', 12500, 1500, false, 'Céréales', 'b2000001-0000-0000-0000-000000000004', 'Sac 50kg', 'MAIS-GRN-50'),
('c1000001-0000-0000-0000-000000000006', 'Sorgho Rouge (Sac 50kg)', 11000, 600, false, 'Céréales', 'b2000001-0000-0000-0000-000000000008', 'Sac 50kg', 'SOR-RGE-50'),
('c1000001-0000-0000-0000-000000000007', 'Fonio Décortiqué (Sac 25kg)', 22000, 200, false, 'Céréales', 'b2000001-0000-0000-0000-000000000007', 'Sac 25kg', 'FON-DEC-25'),
('c1000001-0000-0000-0000-000000000008', 'Riz Touba Spécial (Sac 50kg)', 19000, 3000, false, 'Céréales', 'b2000001-0000-0000-0000-000000000005', 'Sac 50kg', 'RIZ-TBA-50'),

-- Huiles (5)
('c2000001-0000-0000-0000-000000000001', 'Huile Dinor Tournesol 20L', 28500, 80, true, 'Huiles', 'b2000001-0000-0000-0000-000000000001', 'Bidon 20L', 'HUI-DIN-20'),
('c2000001-0000-0000-0000-000000000002', 'Huile Petro Végétale 20L', 25000, 120, false, 'Huiles', 'b2000001-0000-0000-0000-000000000003', 'Bidon 20L', 'HUI-PET-20'),
('c2000001-0000-0000-0000-000000000003', 'Huile Lesieur 5L (Carton 4)', 22000, 95, false, 'Huiles', 'b2000001-0000-0000-0000-000000000001', 'Carton 4x5L', 'HUI-LES-5'),
('c2000001-0000-0000-0000-000000000004', 'Huile Arachide Locale 10L', 18500, 300, true, 'Huiles', 'b2000001-0000-0000-0000-000000000004', 'Bidon 10L', 'HUI-ARA-10'),
('c2000001-0000-0000-0000-000000000005', 'Huile Palme Rouge 5L', 12000, 400, false, 'Huiles', 'b2000001-0000-0000-0000-000000000007', 'Bidon 5L', 'HUI-PAL-5'),

-- Sucres (4)
('c3000001-0000-0000-0000-000000000001', 'Sucre Cristal CSS (Sac 50kg)', 27000, 2000, false, 'Sucres', 'b2000001-0000-0000-0000-000000000001', 'Sac 50kg', 'SUC-CRS-50'),
('c3000001-0000-0000-0000-000000000002', 'Sucre Semoule (Sac 25kg)', 14500, 1800, false, 'Sucres', 'b2000001-0000-0000-0000-000000000002', 'Sac 25kg', 'SUC-SEM-25'),
('c3000001-0000-0000-0000-000000000003', 'Sucre Subventionné Gouv SN (50kg)', 18000, 5000, true, 'Sucres', 'b1000001-0000-0000-0000-000000000001', 'Sac 50kg', 'SUC-SUB-50'),
('c3000001-0000-0000-0000-000000000004', 'Sucre en Morceaux (Boîte 1kg x24)', 9600, 500, false, 'Sucres', 'b2000001-0000-0000-0000-000000000003', 'Carton 24x1kg', 'SUC-MOR-24'),

-- Laitages (4)
('c4000001-0000-0000-0000-000000000001', 'Lait Nido Poudre (Carton 12x400g)', 45000, 210, false, 'Laitages', 'b2000001-0000-0000-0000-000000000009', 'Carton 12', 'LAI-NID-12'),
('c4000001-0000-0000-0000-000000000002', 'Lait OMO Concentré (Carton 48)', 32000, 350, false, 'Laitages', 'b2000001-0000-0000-0000-000000000001', 'Carton 48', 'LAI-OMO-48'),
('c4000001-0000-0000-0000-000000000003', 'Lait Dano Poudre (Sac 400g x12)', 38000, 180, true, 'Laitages', 'b2000001-0000-0000-0000-000000000003', 'Carton 12', 'LAI-DAN-12'),
('c4000001-0000-0000-0000-000000000004', 'Lait Candia UHT 1L (Carton 12)', 22000, 420, false, 'Laitages', 'b2000001-0000-0000-0000-000000000001', 'Carton 12', 'LAI-CAN-12'),

-- Savons (4)
('c5000001-0000-0000-0000-000000000001', 'Savon Lux (Carton 72)', 18000, 300, false, 'Savons', 'b2000001-0000-0000-0000-000000000001', 'Carton 72', 'SAV-LUX-72'),
('c5000001-0000-0000-0000-000000000002', 'Savon OMO Lessive (Sac 10kg)', 12500, 450, true, 'Savons', 'b2000001-0000-0000-0000-000000000003', 'Sac 10kg', 'SAV-OMO-10'),
('c5000001-0000-0000-0000-000000000003', 'Savon de Ménage Kadja (Carton 60)', 9000, 600, false, 'Savons', 'b2000001-0000-0000-0000-000000000010', 'Carton 60', 'SAV-KAD-60'),
('c5000001-0000-0000-0000-000000000004', 'Savon Diama Barre (Carton 24)', 6200, 700, false, 'Savons', 'b2000001-0000-0000-0000-000000000010', 'Carton 24', 'SAV-DIA-24'),

-- Boissons (5)
('c6000001-0000-0000-0000-000000000001', 'Café Touba Artisanal (Lot 10kg)', 7500, 140, false, 'Boissons', 'b2000001-0000-0000-0000-000000000005', 'Lot 10kg', 'CAF-TBA-10'),
('c6000001-0000-0000-0000-000000000002', 'Thé Lipton Yellow (Carton 100 sachets)', 8500, 280, false, 'Boissons', 'b2000001-0000-0000-0000-000000000001', 'Carton 100', 'THE-LIP-100'),
('c6000001-0000-0000-0000-000000000003', 'Jus Youki Cocktail (Carton 24 x 33cl)', 15000, 320, true, 'Boissons', 'b2000001-0000-0000-0000-000000000009', 'Carton 24', 'JUS-YOK-24'),
('c6000001-0000-0000-0000-000000000004', 'Eau Kirène (Palette 12 x 1.5L)', 9000, 500, false, 'Boissons', 'b2000001-0000-0000-0000-000000000001', 'Palette 12', 'EAU-KIR-12'),
('c6000001-0000-0000-0000-000000000005', 'Bissap Concentré Baobab (Carton 12L)', 18000, 90, false, 'Boissons', 'b2000001-0000-0000-0000-000000000007', 'Carton 12L', 'JUS-BIS-12'),

-- Conserves (5)
('c7000001-0000-0000-0000-000000000001', 'Tomate Concentrée Heinz (Carton 48)', 24000, 380, false, 'Conserves', 'b2000001-0000-0000-0000-000000000001', 'Carton 48', 'TOM-HEI-48'),
('c7000001-0000-0000-0000-000000000002', 'Tomate Concentrée SÉNÉGAL (Carton 48)', 19500, 600, true, 'Conserves', 'b2000001-0000-0000-0000-000000000004', 'Carton 48', 'TOM-SEN-48'),
('c7000001-0000-0000-0000-000000000003', 'Sardines Étoile (Carton 50 boîtes)', 22000, 250, false, 'Conserves', 'b2000001-0000-0000-0000-000000000006', 'Carton 50', 'SAR-ETO-50'),
('c7000001-0000-0000-0000-000000000004', 'Haricots Rouges (Carton 24 boîtes)', 14000, 180, false, 'Conserves', 'b2000001-0000-0000-0000-000000000001', 'Carton 24', 'HAR-RGE-24'),
('c7000001-0000-0000-0000-000000000005', 'Maïs en Conserve (Carton 24)', 15500, 200, false, 'Conserves', 'b2000001-0000-0000-0000-000000000001', 'Carton 24', 'MAIS-CON-24'),

-- Farines (3)
('c8000001-0000-0000-0000-000000000001', 'Farine de Blé Baobab (Sac 50kg)', 23000, 700, false, 'Farines', 'b2000001-0000-0000-0000-000000000001', 'Sac 50kg', 'FAR-BLE-50'),
('c8000001-0000-0000-0000-000000000002', 'Farine de Maïs (Sac 25kg)', 11500, 500, false, 'Farines', 'b2000001-0000-0000-0000-000000000004', 'Sac 25kg', 'FAR-MAIS-25'),
('c8000001-0000-0000-0000-000000000003', 'Farine Thiébou Dieun (Sac 25kg)', 9800, 350, false, 'Farines', 'b2000001-0000-0000-0000-000000000002', 'Sac 25kg', 'FAR-TDB-25'),

-- Condiments (5)
('c9000001-0000-0000-0000-000000000001', 'Cube Maggi Poulet (Carton 1200)', 18000, 480, false, 'Condiments', 'b2000001-0000-0000-0000-000000000001', 'Carton 1200', 'MAG-POU-1200'),
('c9000001-0000-0000-0000-000000000002', 'Sel Iodé Dakar Sel (Sac 50kg)', 4500, 2000, false, 'Condiments', 'b2000001-0000-0000-0000-000000000001', 'Sac 50kg', 'SEL-IOD-50'),
('c9000001-0000-0000-0000-000000000003', 'Poivre Noir Moulu (Boîte 200g x24)', 14400, 200, false, 'Condiments', 'b2000001-0000-0000-0000-000000000001', 'Carton 24', 'POI-NOR-24'),
('c9000001-0000-0000-0000-000000000004', 'Piment Séché Casamance (Lot 5kg)', 8500, 300, false, 'Condiments', 'b2000001-0000-0000-0000-000000000007', 'Lot 5kg', 'PIM-SEC-5'),
('c9000001-0000-0000-0000-000000000005', 'Viandox Knorr (Carton 48 bouteilles)', 28000, 150, false, 'Condiments', 'b2000001-0000-0000-0000-000000000001', 'Carton 48', 'VIA-KNR-48'),

-- Hygiène (7)
('ca000001-0000-0000-0000-000000000001', 'Pampers Active Baby T3 (Carton 4x52)', 52000, 150, false, 'Hygiène', 'b2000001-0000-0000-0000-000000000001', 'Carton 4', 'PAM-T3-4'),
('ca000001-0000-0000-0000-000000000002', 'Always Ultra Normal (Carton 12x10)', 24000, 280, false, 'Hygiène', 'b2000001-0000-0000-0000-000000000003', 'Carton 12', 'ALW-NOR-12'),
('ca000001-0000-0000-0000-000000000003', 'Oral-B Classic (Carton 12)', 14400, 320, false, 'Hygiène', 'b2000001-0000-0000-0000-000000000001', 'Carton 12', 'ORA-CLA-12'),
('ca000001-0000-0000-0000-000000000004', 'Dentifrice Colgate 100ml (Carton 48)', 38000, 240, true, 'Hygiène', 'b2000001-0000-0000-0000-000000000001', 'Carton 48', 'DEN-COL-48'),
('ca000001-0000-0000-0000-000000000005', 'Vaseline 250ml (Carton 24)', 26000, 380, false, 'Hygiène', 'b2000001-0000-0000-0000-000000000001', 'Carton 24', 'VAS-250-24'),
('ca000001-0000-0000-0000-000000000006', 'Couches Molfix T4 (Carton 3x44)', 39000, 120, false, 'Hygiène', 'b2000001-0000-0000-0000-000000000001', 'Carton 3', 'COU-MOL-T4'),
('ca000001-0000-0000-0000-000000000007', 'Protège-Slips Nana (Carton 12x30)', 18000, 220, false, 'Hygiène', 'b2000001-0000-0000-0000-000000000003', 'Carton 12', 'PRO-NAN-12');

-- ================================================
-- COMMANDES (20)
-- ================================================
INSERT INTO public.orders (id, order_number, buyer_id, seller_id, total_amount, status, payment_method, payment_status, delivery_address) VALUES
-- 5 en attente (pending)
('e1000001-0000-0000-0000-000000000001', 'ORD-2026-0001', 'b3000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000001', 247500, 'pending', 'wave', 'pending', 'Médina, Rue 10 x Blaise Diagne, Dakar'),
('e1000001-0000-0000-0000-000000000002', 'ORD-2026-0002', 'b3000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000001', 185000, 'pending', 'orange_money', 'pending', 'Almadies, Rue 10, Dakar'),
('e1000001-0000-0000-0000-000000000003', 'ORD-2026-0003', 'b3000001-0000-0000-0000-000000000007', 'b2000001-0000-0000-0000-000000000002', 132000, 'pending', 'wave', 'pending', 'Kaolack, Médina'),
('e1000001-0000-0000-0000-000000000004', 'ORD-2026-0004', 'b3000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000003', 98500, 'pending', 'cash', 'pending', 'Thiès, Quartier Randoulène'),
('e1000001-0000-0000-0000-000000000005', 'ORD-2026-0005', 'b3000001-0000-0000-0000-000000000011', 'b2000001-0000-0000-0000-000000000009', 215000, 'pending', 'wave', 'pending', 'Mbour, Téfesse'),

-- 5 en préparation (processing)
('e1000001-0000-0000-0000-000000000006', 'ORD-2026-0006', 'b3000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000010', 172000, 'processing', 'wave', 'paid', 'Pikine, Bountou, Dakar'),
('e1000001-0000-0000-0000-000000000007', 'ORD-2026-0007', 'b3000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000001', 324000, 'processing', 'orange_money', 'paid', 'Plateau, Rue Vincens, Dakar'),
('e1000001-0000-0000-0000-000000000008', 'ORD-2026-0008', 'b3000001-0000-0000-0000-000000000008', 'b2000001-0000-0000-0000-000000000005', 189000, 'processing', 'wave', 'paid', 'Touba, Ndamatou'),
('e1000001-0000-0000-0000-000000000009', 'ORD-2026-0009', 'b3000001-0000-0000-0000-000000000013', 'b2000001-0000-0000-0000-000000000001', 267000, 'processing', 'cash', 'paid', 'Rufisque, Keury Souf'),
('e1000001-0000-0000-0000-000000000010', 'ORD-2026-0010', 'b3000001-0000-0000-0000-000000000015', 'b2000001-0000-0000-0000-000000000001', 143000, 'processing', 'wave', 'paid', 'Yoff, Tonghor, Dakar'),

-- 5 en livraison (delivering)
('e1000001-0000-0000-0000-000000000011', 'ORD-2026-0011', 'b3000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000001', 198000, 'delivering', 'wave', 'paid', 'Ouakam, Rue Keur Massar, Dakar'),
('e1000001-0000-0000-0000-000000000012', 'ORD-2026-0012', 'b3000001-0000-0000-0000-000000000009', 'b2000001-0000-0000-0000-000000000006', 154000, 'delivering', 'orange_money', 'paid', 'Saint-Louis, Langue de Barbarie'),
('e1000001-0000-0000-0000-000000000013', 'ORD-2026-0013', 'b3000001-0000-0000-0000-000000000010', 'b2000001-0000-0000-0000-000000000007', 87500, 'delivering', 'wave', 'paid', 'Ziguinchor, Tilène'),
('e1000001-0000-0000-0000-000000000014', 'ORD-2026-0014', 'b3000001-0000-0000-0000-000000000012', 'b2000001-0000-0000-0000-000000000008', 112000, 'delivering', 'cash', 'paid', 'Diourbel, Keur Ngary'),
('e1000001-0000-0000-0000-000000000015', 'ORD-2026-0015', 'b3000001-0000-0000-0000-000000000014', 'b2000001-0000-0000-0000-000000000010', 231000, 'delivering', 'wave', 'paid', 'Guédiawaye, Wakhinane'),

-- 5 livrées (delivered)
('e1000001-0000-0000-0000-000000000016', 'ORD-2026-0016', 'b3000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000001', 445000, 'delivered', 'wave', 'paid', 'Médina, Rue 10 x Blaise Diagne, Dakar'),
('e1000001-0000-0000-0000-000000000017', 'ORD-2026-0017', 'b3000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000001', 312000, 'delivered', 'orange_money', 'paid', 'Almadies, Rue 10, Dakar'),
('e1000001-0000-0000-0000-000000000018', 'ORD-2026-0018', 'b3000001-0000-0000-0000-000000000007', 'b2000001-0000-0000-0000-000000000002', 198500, 'delivered', 'wave', 'paid', 'Kaolack, Médina'),
('e1000001-0000-0000-0000-000000000019', 'ORD-2026-0019', 'b3000001-0000-0000-0000-000000000008', 'b2000001-0000-0000-0000-000000000005', 276000, 'delivered', 'cash', 'paid', 'Touba, Ndamatou'),
('e1000001-0000-0000-0000-000000000020', 'ORD-2026-0020', 'b3000001-0000-0000-0000-000000000013', 'b2000001-0000-0000-0000-000000000001', 389000, 'delivered', 'wave', 'paid', 'Rufisque, Keury Souf');

-- ================================================
-- ORDER ITEMS
-- ================================================
INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
('e1000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'Riz Brisé 25% (Sac 50kg)', 10, 16500, 165000),
('e1000001-0000-0000-0000-000000000001', 'c3000001-0000-0000-0000-000000000001', 'Sucre Cristal CSS (Sac 50kg)', 3, 27000, 81000),
('e1000001-0000-0000-0000-000000000006', 'c2000001-0000-0000-0000-000000000001', 'Huile Dinor Tournesol 20L', 4, 28500, 114000),
('e1000001-0000-0000-0000-000000000006', 'c9000001-0000-0000-0000-000000000001', 'Cube Maggi Poulet (Carton 1200)', 2, 18000, 36000),
('e1000001-0000-0000-0000-000000000011', 'c1000001-0000-0000-0000-000000000002', 'Riz Entier Parfumé (Sac 50kg)', 6, 21500, 129000),
('e1000001-0000-0000-0000-000000000016', 'c1000001-0000-0000-0000-000000000001', 'Riz Brisé 25% (Sac 50kg)', 15, 16500, 247500),
('e1000001-0000-0000-0000-000000000016', 'c2000001-0000-0000-0000-000000000001', 'Huile Dinor Tournesol 20L', 5, 28500, 142500),
('e1000001-0000-0000-0000-000000000017', 'c4000001-0000-0000-0000-000000000001', 'Lait Nido Poudre (Carton 12x400g)', 4, 45000, 180000),
('e1000001-0000-0000-0000-000000000017', 'ca000001-0000-0000-0000-000000000001', 'Pampers Active Baby T3 (Carton 4x52)', 2, 52000, 104000);

-- ================================================
-- WALLET TRANSACTIONS (30)
-- ================================================
INSERT INTO public.wallet_transactions (member_id, type, amount, balance_after, description, reference, payment_provider, status) VALUES
-- Paiements Wave
('b3000001-0000-0000-0000-000000000001', 'debit', 247500, 3252500, 'Paiement commande ORD-2026-0001', 'WAV-2026-001', 'wave', 'completed'),
('b3000001-0000-0000-0000-000000000004', 'debit', 185000, 3915000, 'Paiement commande ORD-2026-0002', 'WAV-2026-002', 'wave', 'completed'),
('b2000001-0000-0000-0000-000000000001', 'credit', 247500, 45247500, 'Encaissement ORD-2026-0001', 'WAV-2026-001-CR', 'wave', 'completed'),
('b3000001-0000-0000-0000-000000000002', 'debit', 172000, 1628000, 'Paiement commande ORD-2026-0006', 'WAV-2026-006', 'wave', 'completed'),
('b3000001-0000-0000-0000-000000000005', 'debit', 198000, 702000, 'Paiement commande ORD-2026-0011', 'WAV-2026-011', 'wave', 'completed'),
('b3000001-0000-0000-0000-000000000001', 'credit', 50000, 3302500, 'Remboursement retard livraison', 'RBK-2026-001', 'wave', 'completed'),
-- Paiements Orange Money
('b3000001-0000-0000-0000-000000000003', 'debit', 324000, 1876000, 'Paiement commande ORD-2026-0007', 'OM-2026-007', 'orange_money', 'completed'),
('b3000001-0000-0000-0000-000000000009', 'debit', 154000, 696000, 'Paiement commande ORD-2026-0012', 'OM-2026-012', 'orange_money', 'completed'),
('b2000001-0000-0000-0000-000000000006', 'credit', 154000, 22154000, 'Encaissement ORD-2026-0012', 'OM-2026-012-CR', 'orange_money', 'completed'),
('b3000001-0000-0000-0000-000000000004', 'debit', 312000, 3603000, 'Paiement commande ORD-2026-0017', 'OM-2026-017', 'orange_money', 'completed'),
-- Remboursements BNPL / LiviShield
('b3000001-0000-0000-0000-000000000001', 'debit', 125000, 3127500, 'Remboursement BNPL - Tranche 1/3 ORD-2026-0016', 'BNPL-2026-001', 'livishield', 'completed'),
('b3000001-0000-0000-0000-000000000004', 'debit', 104000, 3499000, 'Remboursement BNPL - Tranche 1/3 ORD-2026-0017', 'BNPL-2026-002', 'livishield', 'completed'),
('b3000001-0000-0000-0000-000000000007', 'debit', 66167, 1133833, 'Remboursement BNPL - Tranche 2/3 ORD-2026-0018', 'BNPL-2026-003', 'livishield', 'completed'),
('b3000001-0000-0000-0000-000000000008', 'debit', 92000, 1908000, 'Remboursement BNPL - Tranche 1/3 ORD-2026-0019', 'BNPL-2026-004', 'livishield', 'completed'),
('b3000001-0000-0000-0000-000000000013', 'debit', 129667, 2270333, 'Remboursement BNPL - Tranche 1/3 ORD-2026-0020', 'BNPL-2026-005', 'livishield', 'completed'),
-- Encaissements livreurs
('b4000001-0000-0000-0000-000000000001', 'credit', 85000, 535000, 'Commission tournée TRN-DKR-9824', 'COM-TRN-001', 'internal', 'completed'),
('b4000001-0000-0000-0000-000000000002', 'credit', 72000, 452000, 'Commission tournée TRN-DKR-9825', 'COM-TRN-002', 'internal', 'completed'),
('b4000001-0000-0000-0000-000000000003', 'credit', 68000, 488000, 'Commission tournée TRN-THS-001', 'COM-TRN-003', 'internal', 'completed'),
-- Dépôts et crédits divers
('b3000001-0000-0000-0000-000000000001', 'credit', 500000, 3627500, 'Dépôt Wave - Rechargement wallet', 'DEP-WAV-001', 'wave', 'completed'),
('b3000001-0000-0000-0000-000000000004', 'credit', 1000000, 4603000, 'Dépôt Orange Money - Rechargement wallet', 'DEP-OM-001', 'orange_money', 'completed'),
('b2000001-0000-0000-0000-000000000002', 'credit', 198500, 28198500, 'Encaissement ORD-2026-0018', 'WAV-2026-018-CR', 'wave', 'completed'),
('b2000001-0000-0000-0000-000000000005', 'credit', 276000, 55276000, 'Encaissement ORD-2026-0019', 'OM-2026-019-CR', 'orange_money', 'completed'),
('b2000001-0000-0000-0000-000000000001', 'credit', 389000, 45636000, 'Encaissement ORD-2026-0020', 'WAV-2026-020-CR', 'wave', 'completed'),
-- Tontines
('b3000001-0000-0000-0000-000000000001', 'debit', 25000, 3602500, 'Cotisation Tontine Médina - Mars 2026', 'TON-MED-MAR26', 'internal', 'completed'),
('b3000001-0000-0000-0000-000000000002', 'debit', 25000, 1603000, 'Cotisation Tontine Médina - Mars 2026', 'TON-MED-MAR26', 'internal', 'completed'),
('b3000001-0000-0000-0000-000000000003', 'credit', 250000, 2450000, 'Payout Tontine Grand Dakar - Mars 2026', 'TON-GDA-MAR26', 'internal', 'completed'),
('b2000001-0000-0000-0000-000000000003', 'credit', 150000, 32150000, 'Bonus fidélité annuel LiviPro', 'BON-FID-2026', 'internal', 'completed'),
('b3000001-0000-0000-0000-000000000011', 'debit', 50000, 1550000, 'Cotisation Tontine Côte Atlantique', 'TON-COA-MAR26', 'internal', 'completed'),
('b3000001-0000-0000-0000-000000000013', 'credit', 300000, 2570333, 'Payout Tontine Rufisque - Février 2026', 'TON-RUF-FEV26', 'internal', 'completed'),
('b2000001-0000-0000-0000-000000000009', 'credit', 125000, 25125000, 'Remise volume Q1 2026 - LiviPro', 'REM-VOL-Q1', 'internal', 'completed');

-- ================================================
-- TONTINES (5)
-- ================================================
INSERT INTO public.tontines (id, name, description, monthly_amount, total_members, current_round, total_rounds, status, next_payout_date, organizer_id) VALUES
('f1000001-0000-0000-0000-000000000001', 'Tontine Médina 25K', 'Tontine des boutiquiers de Médina - 25.000 FCFA/mois', 25000, 10, 3, 10, 'active', '2026-04-15', 'b3000001-0000-0000-0000-000000000001'),
('f1000001-0000-0000-0000-000000000002', 'Tontine Grand Dakar', 'Réseau grossistes et boutiquiers Grand Dakar - 50.000 FCFA/mois', 50000, 8, 2, 8, 'active', '2026-04-01', 'b2000001-0000-0000-0000-000000000001'),
('f1000001-0000-0000-0000-000000000003', 'Tontine Kaolack Commerce', 'Commerçants Kaolack - 30.000 FCFA/mois', 30000, 12, 4, 12, 'active', '2026-04-10', 'b2000001-0000-0000-0000-000000000002'),
('f1000001-0000-0000-0000-000000000004', 'Tontine Côte Atlantique', 'Mbour et environs - 50.000 FCFA/mois', 50000, 15, 1, 15, 'active', '2026-04-20', 'b2000001-0000-0000-0000-000000000009'),
('f1000001-0000-0000-0000-000000000005', 'Tontine Touba Murid', 'Réseau commerçants mourides - 100.000 FCFA/mois', 100000, 10, 6, 10, 'active', '2026-04-05', 'b2000001-0000-0000-0000-000000000005');

-- ================================================
-- TONTINE MEMBERS
-- ================================================
INSERT INTO public.tontine_members (tontine_id, member_id, payout_order, paid_rounds, status) VALUES
('f1000001-0000-0000-0000-000000000001', 'b3000001-0000-0000-0000-000000000001', 1, 3, 'active'),
('f1000001-0000-0000-0000-000000000001', 'b3000001-0000-0000-0000-000000000002', 2, 3, 'active'),
('f1000001-0000-0000-0000-000000000001', 'b3000001-0000-0000-0000-000000000003', 3, 3, 'active'),
('f1000001-0000-0000-0000-000000000001', 'b3000001-0000-0000-0000-000000000005', 4, 3, 'active'),
('f1000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000001', 1, 2, 'active'),
('f1000001-0000-0000-0000-000000000002', 'b3000001-0000-0000-0000-000000000003', 2, 2, 'active'),
('f1000001-0000-0000-0000-000000000002', 'b3000001-0000-0000-0000-000000000004', 3, 2, 'active'),
('f1000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000002', 1, 4, 'active'),
('f1000001-0000-0000-0000-000000000003', 'b3000001-0000-0000-0000-000000000007', 2, 4, 'active'),
('f1000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000009', 1, 1, 'active'),
('f1000001-0000-0000-0000-000000000004', 'b3000001-0000-0000-0000-000000000011', 2, 1, 'active'),
('f1000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000005', 1, 6, 'active'),
('f1000001-0000-0000-0000-000000000005', 'b3000001-0000-0000-0000-000000000008', 2, 6, 'active');

-- ================================================
-- KARMA EVENTS (100)
-- ================================================
INSERT INTO public.karma_events (member_id, event_type, points, description) VALUES
-- Livraisons réussies
('b3000001-0000-0000-0000-000000000001', 'delivery_success', 10, 'Livraison acceptée et confirmée - ORD-2026-0016'),
('b3000001-0000-0000-0000-000000000001', 'delivery_success', 10, 'Livraison acceptée et confirmée - ORD-2026-0017'),
('b3000001-0000-0000-0000-000000000004', 'delivery_success', 10, 'Livraison acceptée et confirmée'),
('b3000001-0000-0000-0000-000000000007', 'delivery_success', 10, 'Livraison acceptée ORD-2026-0018'),
('b3000001-0000-0000-0000-000000000008', 'delivery_success', 10, 'Livraison confirmée ORD-2026-0019'),
-- Paiements ponctuels
('b3000001-0000-0000-0000-000000000001', 'payment_on_time', 15, 'BNPL remboursé en avance - Tranche 1'),
('b3000001-0000-0000-0000-000000000004', 'payment_on_time', 15, 'Paiement Wave reçu dans les délais'),
('b3000001-0000-0000-0000-000000000013', 'payment_on_time', 15, 'Remboursement BNPL ponctuel'),
('b2000001-0000-0000-0000-000000000001', 'payment_on_time', 10, 'Stock expédié dans les 24h'),
('b2000001-0000-0000-0000-000000000002', 'payment_on_time', 10, 'Livraison Kaolack dans les délais'),
-- Bonne note reçue
('b2000001-0000-0000-0000-000000000001', 'good_review', 20, 'Note 5 étoiles de Supermarché Médina'),
('b2000001-0000-0000-0000-000000000005', 'good_review', 20, 'Note 5 étoiles de Boutique Touba'),
('b3000001-0000-0000-0000-000000000001', 'good_review', 20, 'Évaluation excellente par livreur'),
('b4000001-0000-0000-0000-000000000001', 'good_review', 20, 'Note 5 étoiles - Tournée parfaite'),
-- Inscription tontine
('b3000001-0000-0000-0000-000000000001', 'tontine_join', 25, 'Rejoint Tontine Médina 25K'),
('b3000001-0000-0000-0000-000000000002', 'tontine_join', 25, 'Rejoint Tontine Médina 25K'),
('b3000001-0000-0000-0000-000000000011', 'tontine_join', 25, 'Rejoint Tontine Côte Atlantique'),
('b2000001-0000-0000-0000-000000000009', 'tontine_join', 25, 'Organisateur Tontine Côte Atlantique'),
-- Cotisations à l'heure
('b3000001-0000-0000-0000-000000000001', 'tontine_payment', 10, 'Cotisation Tontine Médina - Janvier'),
('b3000001-0000-0000-0000-000000000001', 'tontine_payment', 10, 'Cotisation Tontine Médina - Février'),
('b3000001-0000-0000-0000-000000000001', 'tontine_payment', 10, 'Cotisation Tontine Médina - Mars'),
('b3000001-0000-0000-0000-000000000002', 'tontine_payment', 10, 'Cotisation Tontine Médina - Mars'),
('b3000001-0000-0000-0000-000000000008', 'tontine_payment', 10, 'Cotisation Tontine Touba - Ronde 6'),
-- KYC validé
('b2000001-0000-0000-0000-000000000001', 'kyc_validated', 50, 'Dossier KYC validé - Statut Platinum'),
('b2000001-0000-0000-0000-000000000002', 'kyc_validated', 50, 'Dossier KYC validé - Statut Gold'),
('b2000001-0000-0000-0000-000000000005', 'kyc_validated', 50, 'Dossier KYC validé - Statut Gold'),
('b3000001-0000-0000-0000-000000000001', 'kyc_validated', 30, 'KYC boutiquier validé'),
('b3000001-0000-0000-0000-000000000004', 'kyc_validated', 30, 'KYC boutiquier validé'),
-- Commandes passées
('b3000001-0000-0000-0000-000000000001', 'order_placed', 5, 'Commande ORD-2026-0001 passée'),
('b3000001-0000-0000-0000-000000000004', 'order_placed', 5, 'Commande ORD-2026-0002 passée'),
('b3000001-0000-0000-0000-000000000007', 'order_placed', 5, 'Commande ORD-2026-0003 passée'),
('b3000001-0000-0000-0000-000000000006', 'order_placed', 5, 'Commande ORD-2026-0004 passée'),
('b3000001-0000-0000-0000-000000000011', 'order_placed', 5, 'Commande ORD-2026-0005 passée'),
('b3000001-0000-0000-0000-000000000002', 'order_placed', 5, 'Commande ORD-2026-0006 passée'),
('b3000001-0000-0000-0000-000000000003', 'order_placed', 5, 'Commande ORD-2026-0007 passée'),
('b3000001-0000-0000-0000-000000000008', 'order_placed', 5, 'Commande ORD-2026-0008 passée'),
-- Retards / malus
('b3000001-0000-0000-0000-000000000012', 'payment_late', -10, 'Paiement en retard de 3 jours'),
('b3000001-0000-0000-0000-000000000009', 'delivery_refused', -15, 'Livraison partiellement refusée'),
-- Parrainage
('b3000001-0000-0000-0000-000000000001', 'referral', 50, 'Parrainage réussi de Boutique Ouakam'),
('b2000001-0000-0000-0000-000000000003', 'referral', 50, 'Parrainage réussi de Grossiste Diourbel'),
-- Livreurs
('b4000001-0000-0000-0000-000000000001', 'delivery_success', 15, 'Tournée TRN-DKR-9824 complétée - 8/8 stops'),
('b4000001-0000-0000-0000-000000000001', 'delivery_success', 15, 'Tournée TRN-DKR-9825 complétée - 6/6 stops'),
('b4000001-0000-0000-0000-000000000002', 'delivery_success', 15, 'Tournée TRN-DKR-9826 - 5/7 stops'),
('b4000001-0000-0000-0000-000000000003', 'delivery_success', 15, 'Tournée TRN-THS-001 complétée'),
('b4000001-0000-0000-0000-000000000001', 'payment_on_time', 10, 'Espèces remises en totalité fin tournée'),
-- Commandes supplémentaires variées
('b3000001-0000-0000-0000-000000000013', 'order_placed', 5, 'Commande ORD-2026-0009 passée'),
('b3000001-0000-0000-0000-000000000015', 'order_placed', 5, 'Commande ORD-2026-0010 passée'),
('b3000001-0000-0000-0000-000000000005', 'order_placed', 5, 'Commande ORD-2026-0011 passée'),
('b3000001-0000-0000-0000-000000000009', 'order_placed', 5, 'Commande ORD-2026-0012 passée'),
('b3000001-0000-0000-0000-000000000010', 'order_placed', 5, 'Commande ORD-2026-0013 passée'),
('b3000001-0000-0000-0000-000000000012', 'order_placed', 5, 'Commande ORD-2026-0014 passée'),
('b3000001-0000-0000-0000-000000000014', 'order_placed', 5, 'Commande ORD-2026-0015 passée'),
('b3000001-0000-0000-0000-000000000001', 'order_placed', 5, 'Commande ORD-2026-0016 passée'),
('b3000001-0000-0000-0000-000000000004', 'order_placed', 5, 'Commande ORD-2026-0017 passée'),
('b3000001-0000-0000-0000-000000000007', 'order_placed', 5, 'Commande ORD-2026-0018 passée'),
('b3000001-0000-0000-0000-000000000008', 'order_placed', 5, 'Commande ORD-2026-0019 passée'),
('b3000001-0000-0000-0000-000000000013', 'order_placed', 5, 'Commande ORD-2026-0020 passée'),
-- Événements variés membres
('b2000001-0000-0000-0000-000000000006', 'good_review', 20, 'Note 5 étoiles - Saint-Louis'),
('b2000001-0000-0000-0000-000000000007', 'good_review', 20, 'Note 5 étoiles - Ziguinchor'),
('b2000001-0000-0000-0000-000000000009', 'good_review', 20, 'Note 5 étoiles - Mbour'),
('b3000001-0000-0000-0000-000000000003', 'delivery_success', 10, 'Livraison confirmée Plateau'),
('b3000001-0000-0000-0000-000000000006', 'delivery_success', 10, 'Livraison confirmée Thiès'),
('b3000001-0000-0000-0000-000000000010', 'delivery_success', 10, 'Livraison confirmée Ziguinchor'),
('b3000001-0000-0000-0000-000000000014', 'delivery_success', 10, 'Livraison confirmée Guédiawaye'),
('b3000001-0000-0000-0000-000000000015', 'delivery_success', 10, 'Livraison confirmée Yoff'),
('b2000001-0000-0000-0000-000000000004', 'kyc_validated', 50, 'KYC Saloum Trading validé'),
('b2000001-0000-0000-0000-000000000006', 'kyc_validated', 50, 'KYC Saint-Louis Commerce validé'),
('b2000001-0000-0000-0000-000000000007', 'kyc_validated', 50, 'KYC Ziguinchor Négoce validé'),
('b2000001-0000-0000-0000-000000000008', 'kyc_validated', 50, 'KYC Diourbel Grands Stocks validé'),
('b2000001-0000-0000-0000-000000000010', 'kyc_validated', 30, 'KYC Pikine Entrepôt validé'),
('b3000001-0000-0000-0000-000000000001', 'payment_on_time', 15, 'Remboursement BNPL avancé - bonus'),
('b3000001-0000-0000-0000-000000000004', 'payment_on_time', 15, 'Paiement anticipé - bonus fidélité'),
('b3000001-0000-0000-0000-000000000013', 'payment_on_time', 15, 'BNPL ponctuel Rufisque'),
('b2000001-0000-0000-0000-000000000003', 'payment_on_time', 10, 'Expédition anticipée Thiès'),
('b4000001-0000-0000-0000-000000000001', 'good_review', 20, '5 étoiles de Boutique Médina'),
('b4000001-0000-0000-0000-000000000002', 'good_review', 20, '5 étoiles de Supermarché Almadies'),
('b4000001-0000-0000-0000-000000000003', 'good_review', 20, '5 étoiles tournée Thiès'),
('b3000001-0000-0000-0000-000000000001', 'referral', 50, 'Parrainage réussi - Boutique Plateau'),
('b2000001-0000-0000-0000-000000000001', 'referral', 50, 'Parrainage grossiste Mbour'),
('b3000001-0000-0000-0000-000000000011', 'delivery_success', 10, 'Livraison confirmée Mbour'),
('b3000001-0000-0000-0000-000000000012', 'order_placed', 5, 'Nouvelle commande Diourbel'),
('b2000001-0000-0000-0000-000000000008', 'good_review', 20, 'Satisfaction client Diourbel'),
('b3000001-0000-0000-0000-000000000009', 'order_placed', 5, 'Commande Saint-Louis passée'),
('b3000001-0000-0000-0000-000000000010', 'order_placed', 5, 'Commande Ziguinchor passée'),
('b2000001-0000-0000-0000-000000000003', 'good_review', 20, 'Note 5 étoiles Thiès'),
('b3000001-0000-0000-0000-000000000015', 'tontine_join', 25, 'Rejoint Tontine Grand Dakar'),
('b3000001-0000-0000-0000-000000000014', 'tontine_payment', 10, 'Cotisation mensuelle - Mars'),
('b2000001-0000-0000-0000-000000000002', 'tontine_payment', 10, 'Cotisation Tontine Kaolack - Mars'),
('b3000001-0000-0000-0000-000000000007', 'tontine_payment', 10, 'Cotisation Tontine Kaolack - Mars'),
('b3000001-0000-0000-0000-000000000008', 'tontine_payment', 10, 'Cotisation Tontine Touba - Mars'),
('b2000001-0000-0000-0000-000000000005', 'tontine_payment', 10, 'Cotisation Tontine Touba - Ronde 6');

-- ================================================
-- NOTIFICATIONS (échantillon)
-- ================================================
INSERT INTO public.notifications (member_id, title, body, type, read) VALUES
('b3000001-0000-0000-0000-000000000001', 'Livraison en route', 'Ousmane Diallo est à 15 min de votre boutique. Commande ORD-2026-0011 en cours.', 'delivery', false),
('b3000001-0000-0000-0000-000000000001', 'BNPL - Échéance dans 3 jours', 'Rappel : votre tranche BNPL de 125.000 FCFA est due le 31 Mars 2026.', 'payment', false),
('b2000001-0000-0000-0000-000000000001', 'Nouvelle commande reçue', 'ORD-2026-0001 de Supermarché Médina - 247.500 FCFA. À préparer avant 14h.', 'order', false),
('b3000001-0000-0000-0000-000000000004', 'Tontine - Payout ce mois', 'Votre tour de payout Tontine Grand Dakar arrive le 1er Avril. Montant : 400.000 FCFA.', 'tontine', false),
('b4000001-0000-0000-0000-000000000001', 'Tournée du jour prête', 'TRN-DKR-9824 : 8 arrêts planifiés. Départ recommandé à 7h30. Karma +15 si 100% complétée.', 'delivery', false),
('b3000001-0000-0000-0000-000000000007', 'Offre groupage disponible', 'Opération Bulk Riz Parfumé : encore 2 places ! Rejoignez pour -20% sur vos commandes.', 'promotion', true),
('b2000001-0000-0000-0000-000000000002', 'Karma Niveau Gold atteint', 'Félicitations ! Votre karma a dépassé 850 points. Nouvelles conditions BNPL débloquées.', 'achievement', true),
('b3000001-0000-0000-0000-000000000013', 'Commande livrée - Évaluez', 'ORD-2026-0020 livrée avec succès. Notez votre expérience pour gagner 20 points karma.', 'review', false),
('b1000001-0000-0000-0000-000000000001', 'Alerte stock sucre subventionné', 'Niveau stock national : 5.000 sacs restants. Réapprovisionnement prévu semaine prochaine.', 'alert', false),
('b3000001-0000-0000-0000-000000000008', 'Félicitations - 1 an sur LiviPro', 'Cela fait 1 an que vous êtes membre LiviPro ! Bonus anniversaire : 50 points karma crédités.', 'achievement', true);

-- ================================================
-- CREDIT FACILITIES (LiviShield)
-- ================================================
INSERT INTO public.credit_facilities (member_id, credit_limit, used_amount, interest_rate, status, next_due_date) VALUES
('b3000001-0000-0000-0000-000000000001', 1000000, 375000, 0.00, 'active', '2026-03-31'),
('b3000001-0000-0000-0000-000000000004', 800000, 312000, 0.00, 'active', '2026-03-31'),
('b3000001-0000-0000-0000-000000000007', 500000, 198500, 0.00, 'active', '2026-04-05'),
('b3000001-0000-0000-0000-000000000008', 600000, 276000, 0.00, 'active', '2026-04-01'),
('b3000001-0000-0000-0000-000000000013', 900000, 389000, 0.00, 'active', '2026-03-31'),
('b3000001-0000-0000-0000-000000000003', 700000, 0, 0.00, 'active', NULL),
('b3000001-0000-0000-0000-000000000011', 500000, 215000, 0.00, 'active', '2026-04-10'),
('b3000001-0000-0000-0000-000000000015', 400000, 143000, 0.00, 'active', '2026-04-08');

-- ================================================
-- DELIVERY TOURS (3)
-- ================================================
INSERT INTO public.delivery_tours (id, tour_code, driver_name, driver_id, total_stops, completed_stops, cash_collected, fleet_roi, status) VALUES
('d1000001-0000-0000-0000-000000000001', 'TRN-DKR-9824', 'Ousmane Diallo', 'b4000001-0000-0000-0000-000000000001', 8, 1, 1450000, '27.500 FCFA', 'En cours'),
('d1000001-0000-0000-0000-000000000002', 'TRN-DKR-9825', 'Mamadou Sow', 'b4000001-0000-0000-0000-000000000002', 6, 6, 2340000, '31.200 FCFA', 'Terminée'),
('d1000001-0000-0000-0000-000000000003', 'TRN-THS-001', 'Ibrahima Fall', 'b4000001-0000-0000-0000-000000000003', 5, 3, 980000, '18.500 FCFA', 'En cours');

INSERT INTO public.delivery_stops (tour_id, stop_order, shop_name, address, status, items_to_deliver, expected_cash, lat, lng, ai_prediction) VALUES
('d1000001-0000-0000-0000-000000000001', 1, 'Boutique Serigne Saliou', 'Marché Fass, Dakar', 'completed', 25, 250000, 14.6850, -17.4582, NULL),
('d1000001-0000-0000-0000-000000000001', 2, 'Supermarché Médina Fatou', 'Rue 10 x Blaise Diagne', 'next', 60, 1200000, 14.6928, -17.4627, 'Karma 942. Commandes Boissons -15%. Proposer palette TRN-X1 (+5 cartons) remise Associé.'),
('d1000001-0000-0000-0000-000000000001', 3, 'Alimentation Ndiaye & Fils', 'Médina, Rue 6', 'pending', 12, 85000, 14.6796, -17.4475, NULL),
('d1000001-0000-0000-0000-000000000001', 4, 'Boutique Plateau Aminata', 'Plateau, Rue Vincens', 'pending', 18, 180000, 14.6785, -17.4419, NULL),
('d1000001-0000-0000-0000-000000000001', 5, 'Mini-Market Almadies', 'Almadies, Rue 10', 'pending', 45, 450000, 14.7274, -17.5028, 'Client prioritaire. BNPL actif. Confirmer paiement avant déchargement.'),
('d1000001-0000-0000-0000-000000000001', 6, 'Épicerie Ouakam Ibrahima', 'Ouakam, Rue Keur Massar', 'pending', 8, 95000, 14.7142, -17.4762, NULL),
('d1000001-0000-0000-0000-000000000001', 7, 'Boutique Guédiawaye Mariama', 'Guédiawaye, Wakhinane', 'pending', 30, 280000, 14.7715, -17.4054, NULL),
('d1000001-0000-0000-0000-000000000001', 8, 'Épicerie Yoff Pape', 'Yoff, Tonghor', 'pending', 22, 210000, 14.7568, -17.4733, NULL),
-- Tour 2 (terminée)
('d1000001-0000-0000-0000-000000000002', 1, 'Alimentation Rufisque Lamine', 'Rufisque, Keury Souf', 'completed', 35, 380000, 14.7165, -17.2731, NULL),
('d1000001-0000-0000-0000-000000000002', 2, 'Boutique Pikine Cheikh', 'Pikine, Bountou', 'completed', 20, 175000, 14.7493, -17.3864, NULL),
('d1000001-0000-0000-0000-000000000002', 3, 'Commerce Ouakam 2', 'Ouakam Sud', 'completed', 15, 145000, 14.7105, -17.4738, NULL),
('d1000001-0000-0000-0000-000000000002', 4, 'Épicerie Grand Yoff', 'Grand Yoff, Liberté 6', 'completed', 28, 520000, 14.7270, -17.4511, NULL),
('d1000001-0000-0000-0000-000000000002', 5, 'Alimentation Parcelles', 'Parcelles Assainies, U16', 'completed', 42, 620000, 14.7704, -17.4336, NULL),
('d1000001-0000-0000-0000-000000000002', 6, 'Supermarché Point E', 'Point E, Avenue Bourguiba', 'completed', 55, 500000, 14.6949, -17.4653, NULL),
-- Tour 3 Thiès
('d1000001-0000-0000-0000-000000000003', 1, 'Alimentation Thiès Modou', 'Thiès, Randoulène', 'completed', 30, 320000, 14.7886, -16.9352, NULL),
('d1000001-0000-0000-0000-000000000003', 2, 'Commerce Central Thiès', 'Thiès, Marché Central', 'completed', 45, 380000, 14.7941, -16.9326, NULL),
('d1000001-0000-0000-0000-000000000003', 3, 'Épicerie Mbour Est', 'Thiès, Mbour Route', 'completed', 20, 280000, 14.7823, -16.9501, NULL),
('d1000001-0000-0000-0000-000000000003', 4, 'Boutique Pout Thiès', 'Pout, Route Nationale', 'pending', 15, 165000, 14.7672, -17.0743, NULL),
('d1000001-0000-0000-0000-000000000003', 5, 'Alimentation Sébikotane', 'Sébikotane, Centre', 'pending', 12, 135000, 14.7450, -17.1234, NULL);

-- ================================================
-- SOCIAL FEED
-- ================================================
INSERT INTO public.social_feed (author_name, text, time, likes) VALUES
('Ministère du Commerce', '✅ COMMUNIQUÉ : Le Ministère annonce une subvention sur le Sucre Local pour les mois de Ramadan. Les prix sont bloqués via LiviChain sur notre portail.', 'Il y a 10 min', 542),
('Grossiste Al-Amine', '🚚 ARRIVÉE MASSIVE : 500 sacs de Sucre St-Louis disponibles au Port. Validé par LiviPro.', 'Il y a 2h', 24),
('Système LiviPro', '⚠️ ALERTE TRAFIC : Zone Fass bloquée par travaux. Tournées DKR-9824 retardées de 30mn.', 'Il y a 4h', 5),
('Touba Distribution Mourtada', '🌙 SPÉCIAL RAMADAN : Stocks de Dattes et Café Touba disponibles. Livraison express 24h vers Touba et Diourbel.', 'Il y a 6h', 87),
('ADEPME', '📊 RAPPORT : 35% de croissance des transactions B2B sur LiviPro en Q1 2026. Le réseau sénégalais s''accélère.', 'Il y a 1 jour', 156);

-- ================================================
-- GROUPAGE OFFERS
-- ================================================
INSERT INTO public.groupage_offers (product_id, name, min_orders, current_orders, discount, deadline, status) VALUES
('c1000001-0000-0000-0000-000000000002', 'Opération Bulk Riz Parfumé', 10, 8, '20%', '6h restantes', 'Presque plein'),
('c3000001-0000-0000-0000-000000000003', 'Campagne Solidarité Sucre (Gouv SN)', 50, 42, '35%', '15 jours', 'Soutenu par le Ministère'),
('c2000001-0000-0000-0000-000000000001', 'Groupage Huile Dinor Ramadan', 20, 14, '15%', '3 jours', 'En cours'),
('ca000001-0000-0000-0000-000000000001', 'Lot Pampers Saison Pluies', 15, 9, '10%', '7 jours', 'En cours'),
('c4000001-0000-0000-0000-000000000001', 'Bulk Lait Nido Touba', 8, 7, '12%', '24h restantes', 'Presque plein');

-- ================================================
-- KYC DOCUMENTS
-- ================================================
INSERT INTO public.kyc_documents (member_id, doc_type, file_url, status, verified_at) VALUES
('b2000001-0000-0000-0000-000000000001', 'NINEA', 'https://storage.livipro.sn/kyc/alamine-ninea.pdf', 'verified', NOW() - INTERVAL '30 days'),
('b2000001-0000-0000-0000-000000000001', 'RC_Commerce', 'https://storage.livipro.sn/kyc/alamine-rc.pdf', 'verified', NOW() - INTERVAL '30 days'),
('b2000001-0000-0000-0000-000000000002', 'NINEA', 'https://storage.livipro.sn/kyc/diagne-ninea.pdf', 'verified', NOW() - INTERVAL '20 days'),
('b2000001-0000-0000-0000-000000000005', 'NINEA', 'https://storage.livipro.sn/kyc/touba-ninea.pdf', 'verified', NOW() - INTERVAL '15 days'),
('b3000001-0000-0000-0000-000000000001', 'CNI', 'https://storage.livipro.sn/kyc/medina-cni.pdf', 'verified', NOW() - INTERVAL '10 days'),
('b3000001-0000-0000-0000-000000000004', 'CNI', 'https://storage.livipro.sn/kyc/almadies-cni.pdf', 'verified', NOW() - INTERVAL '8 days'),
('b3000001-0000-0000-0000-000000000007', 'CNI', 'https://storage.livipro.sn/kyc/kaolack-cni.pdf', 'pending', NULL),
('b3000001-0000-0000-0000-000000000012', 'CNI', 'https://storage.livipro.sn/kyc/diourbel-cni.pdf', 'pending', NULL);

-- ================================================
-- INVENTORY
-- ================================================
INSERT INTO public.inventory (wholesaler_id, product_id, quantity, reserved_quantity, reorder_level, last_restocked_at) VALUES
('b2000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 2400, 150, 200, NOW() - INTERVAL '3 days'),
('b2000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000002', 450, 60, 50, NOW() - INTERVAL '5 days'),
('b2000001-0000-0000-0000-000000000001', 'c2000001-0000-0000-0000-000000000001', 80, 20, 20, NOW() - INTERVAL '2 days'),
('b2000001-0000-0000-0000-000000000001', 'c3000001-0000-0000-0000-000000000001', 2000, 100, 300, NOW() - INTERVAL '1 day'),
('b2000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000004', 800, 50, 100, NOW() - INTERVAL '7 days'),
('b2000001-0000-0000-0000-000000000005', 'c6000001-0000-0000-0000-000000000001', 140, 10, 30, NOW() - INTERVAL '4 days'),
('b2000001-0000-0000-0000-000000000005', 'c1000001-0000-0000-0000-000000000008', 3000, 200, 500, NOW() - INTERVAL '2 days'),
('b2000001-0000-0000-0000-000000000007', 'c1000001-0000-0000-0000-000000000003', 1200, 80, 150, NOW() - INTERVAL '6 days'),
('b2000001-0000-0000-0000-000000000009', 'c6000001-0000-0000-0000-000000000003', 320, 40, 50, NOW() - INTERVAL '3 days'),
('b2000001-0000-0000-0000-000000000010', 'c5000001-0000-0000-0000-000000000003', 600, 30, 100, NOW() - INTERVAL '5 days');

-- ================================================
-- RLS POLICIES
-- ================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupage_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karma_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontine_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Lecture publique (environnement Alpha)
CREATE POLICY "Lecture publique" ON public.members FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.groupage_offers FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.social_feed FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.delivery_tours FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.delivery_stops FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.karma_events FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.credit_facilities FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.tontines FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.tontine_members FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.price_catalog FOR SELECT USING (true);
CREATE POLICY "Lecture publique" ON public.kyc_documents FOR SELECT USING (true);

-- ================================================
-- INDEXES PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_wholesaler ON public.products(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_member ON public.wallet_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_wallet_created ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karma_member ON public.karma_events(member_id);
CREATE INDEX IF NOT EXISTS idx_karma_type ON public.karma_events(event_type);
CREATE INDEX IF NOT EXISTS idx_notifications_member ON public.notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_delivery_stops_tour ON public.delivery_stops(tour_id);
CREATE INDEX IF NOT EXISTS idx_inventory_wholesaler ON public.inventory(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_tontine_members_tontine ON public.tontine_members(tontine_id);
CREATE INDEX IF NOT EXISTS idx_members_type ON public.members(type);
CREATE INDEX IF NOT EXISTS idx_members_city ON public.members(city);

-- ================================================
-- FONCTIONS UTILITAIRES
-- ================================================

-- Calcul du karma score total d'un membre
CREATE OR REPLACE FUNCTION get_karma_score(p_member_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_karma INTEGER;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO total_karma
    FROM public.karma_events
    WHERE member_id = p_member_id;
    RETURN total_karma;
END;
$$ LANGUAGE plpgsql;

-- Mise à jour automatique du karma dans members
CREATE OR REPLACE FUNCTION sync_karma_to_member()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.members
    SET karma = get_karma_score(NEW.member_id)
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_sync_karma
    AFTER INSERT OR UPDATE OR DELETE ON public.karma_events
    FOR EACH ROW EXECUTE FUNCTION sync_karma_to_member();

-- Mise à jour du stock lors d'une commande confirmée
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
        UPDATE public.inventory inv
        SET reserved_quantity = inv.reserved_quantity + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id
          AND inv.product_id = oi.product_id
          AND inv.wholesaler_id = NEW.seller_id;
    END IF;
    IF NEW.status = 'delivered' AND OLD.status IN ('delivering', 'processing') THEN
        UPDATE public.inventory inv
        SET quantity = inv.quantity - oi.quantity,
            reserved_quantity = GREATEST(0, inv.reserved_quantity - oi.quantity)
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id
          AND inv.product_id = oi.product_id
          AND inv.wholesaler_id = NEW.seller_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_inventory_on_order
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order();

-- ================================================
-- VUE DASHBOARD KPIs
-- ================================================
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.members WHERE type = 'wholesaler') AS total_wholesalers,
    (SELECT COUNT(*) FROM public.members WHERE type = 'boutique') AS total_boutiques,
    (SELECT COUNT(*) FROM public.members WHERE type = 'driver') AS total_drivers,
    (SELECT COUNT(*) FROM public.orders) AS total_orders,
    (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') AS orders_pending,
    (SELECT COUNT(*) FROM public.orders WHERE status = 'processing') AS orders_processing,
    (SELECT COUNT(*) FROM public.orders WHERE status = 'delivering') AS orders_delivering,
    (SELECT COUNT(*) FROM public.orders WHERE status = 'delivered') AS orders_delivered,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'delivered') AS total_gmv_fcfa,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'pending') AS total_processed_fcfa,
    (SELECT COUNT(*) FROM public.tontines WHERE status = 'active') AS active_tontines,
    (SELECT COALESCE(SUM(monthly_amount * total_members), 0) FROM public.tontines WHERE status = 'active') AS tontines_monthly_volume,
    (SELECT COUNT(*) FROM public.credit_facilities WHERE status = 'active') AS active_credit_lines,
    (SELECT COALESCE(SUM(used_amount), 0) FROM public.credit_facilities) AS total_bnpl_outstanding,
    (SELECT COUNT(*) FROM public.delivery_tours WHERE status = 'En cours') AS active_tours,
    (SELECT COALESCE(SUM(cash_collected), 0) FROM public.delivery_tours) AS total_cash_collected,
    (SELECT COUNT(*) FROM public.products) AS total_products,
    (SELECT COUNT(DISTINCT category) FROM public.products) AS total_categories,
    NOW() AS generated_at;
