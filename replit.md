# LiviPro B2B - Plateforme Logistique & Distribution

## Vision
LiviPro est un **Système d'Exécution Logistique (LES) Mobile** B2B qui transforme la chaîne d'approvisionnement des grossistes et distributeurs (FMCG, BTP, Agroalimentaire).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React 19 + Vite + TailwindCSS + shadcn/ui + Recharts
- **Mobile**: Expo (React Native) SDK 54

## Applications

| Application | URL | Description |
|---|---|---|
| **Backoffice Administrateur** | `/` | Super-admin: gestion de tous les grossistes, KPIs globaux, graphiques tendanciels |
| **Backoffice Grossiste** | `/grossiste/` | Espace personnel par grossiste: chauffeurs, boutiques, tournées + optimisation itinéraire |
| **API Server** | `/api` | Express API REST |
| **App Mobile Livreur** | Expo Go / APK | App chauffeur: login PIN, manifeste, photo, scanner, historique, stats |
| **App Boutiquier PWA** | `/boutiquier/` | App mobile PWA pour boutiquiers: login, dashboard, livraisons, fidélité, profil |
| **App Grossiste Mobile PWA** | `/grossiste-mobile/` | App mobile PWA pour grossistes: dashboard KPIs, tournées live, boutiques scores, alertes fraude |

## Structure

```text
artifacts/
├── admin-backoffice/     # Backoffice Super Admin (React + Vite + Recharts)
├── grossiste-backoffice/ # Backoffice Grossiste (React + Vite)
├── api-server/           # Express API Server
└── livreur-app/          # App Mobile Expo (React Native)
    ├── app/
    │   ├── index.tsx        # Login 3 étapes + PIN à 4 chiffres
    │   ├── manifest.tsx     # Redirect → (main)
    │   └── (main)/
    │       ├── _layout.tsx  # Navigation par onglets (3 tabs)
    │       ├── index.tsx    # Manifeste tournée active + photo + scanner
    │       ├── historique.tsx # Historique des tournées passées
    │       └── stats.tsx    # Statistiques personnelles du chauffeur
    └── components/
        ├── SignatureModal.tsx  # Pad de signature gestuelle
        ├── QRModal.tsx        # QR paiement Wave/Orange/Espèces
        ├── LitigeModal.tsx    # Déclaration litige avec déduction
        ├── PhotoModal.tsx     # Preuve photo avec expo-image-picker
        ├── ScannerModal.tsx   # Scanner codes-barres avec expo-camera
        ├── AppMap.native.tsx  # Carte GPS (natif)
        └── AppMap.web.tsx     # Placeholder carte (web)
lib/
├── api-spec/             # OpenAPI spec + Orval codegen
├── api-client-react/     # Generated React Query hooks
├── api-zod/              # Generated Zod schemas
└── db/                   # Drizzle ORM schema + DB connection
```

## Database Schema

- **grossistes** — Les grossistes/distributeurs (actif/inactif/suspendu)
- **chauffeurs** — Chauffeurs par grossiste (disponible/en_tournee/inactif)
- **boutiques** — Boutiques clientes par grossiste (avec limite de crédit)
- **produits** — Catalogue produits par grossiste
- **tournees** — Tournées de livraison par grossiste (planifiée/en_cours/terminée/annulée)
- **livraisons** — Livraisons par tournée et boutique (statut + paiement)

## API Endpoints

### Admin (Super Admin)
- `GET /api/admin/stats` — KPIs globaux
- `GET/POST /api/admin/grossistes` — CRUD grossistes
- `GET/PUT/DELETE /api/admin/grossistes/:id` — CRUD grossiste individuel
- `GET /api/admin/tournees` — Toutes les tournées
- `GET /api/admin/livraisons` — Toutes les livraisons

### Grossiste (par grossisteId)
- `GET /api/grossistes/:id/stats` — KPIs du grossiste
- `GET/POST /api/grossistes/:id/chauffeurs` — CRUD chauffeurs
- `GET/POST /api/grossistes/:id/boutiques` — CRUD boutiques
- `GET/POST /api/grossistes/:id/produits` — CRUD produits
- `GET /api/grossistes/:id/tournees?chauffeurId=X` — Tournées (filtrables par chauffeur)
- `GET /api/grossistes/:id/chauffeurs/:chauffeurId/stats` — Stats personnelles d'un chauffeur
- `GET/POST /api/grossistes/:id/tournees` — CRUD tournées
- `GET/PUT /api/grossistes/:id/tournees/:tid` — Détails et MAJ statut
- `GET /api/grossistes/:id/livraisons` — Livraisons du grossiste

## Nouvelles Tables DB (Innovation)

- **ratings** — Notations mutuelles chauffeur ↔ boutique (type, score 1-5, commentaire)
- **whatsapp_orders** — Commandes reçues via WhatsApp Business (boutique, produits JSON, statut, montant estimé)

## Nouveaux Endpoints API (Innovations)

Tous sous `/api/grossistes/:id/innovations/` :
- `GET /credit-scores` — Score crédit 0-100 pour chaque boutique (calculé depuis livraisons)
- `GET /cashflow-prevision` — Flux de trésorerie 6 semaines + prévision semaine+1
- `GET /demand-forecast` — Prévision commande prochaine par boutique (régression linéaire)
- `GET /fraud-alerts` — Alertes anomalies chauffeurs (litige élevé, montants suspects)
- `GET /fidelite` — Programme fidélité boutiques (Bronze/Argent/Or/Platine)
- `GET/POST /ratings` — Notations mutuelles chauffeur ↔ boutique
- `GET/POST /whatsapp-orders` — Commandes WhatsApp
- `PUT /whatsapp-orders/:id/statut` — Mise à jour statut commande

Admin : `GET /api/admin/benchmark` — Benchmark inter-grossistes + score ESG

## Fonctionnalités Implémentées

### App Mobile Livreur
1. **Login 3 étapes** — Distributeur → Chauffeur → PIN 4 chiffres
2. **PIN auth** — Premier login: création, retour: vérification (AsyncStorage)
3. **3 onglets** — Tournée | Historique | Mes Stats
4. **Manifeste tournée** — Carte GPS, arrêt en cours, actions (Signer/QR/Litige/Photo/Scanner)
5. **Preuve photo** — expo-image-picker avec prévisualisation et horodatage
6. **Scanner codes-barres** — expo-camera + saisie manuelle fallback
7. **Mode hors-ligne** — AsyncStorage cache pour fonctionner sans réseau
8. **Historique tournées** — Filtrable par statut, expansion détails, taux réussite
9. **Stats personnelles** — CA cumulé, taux réussite, graphique barre 6 semaines, eval (Excellent/Bon/À améliorer)

### Backoffice Admin
10. **Analytics recharts** — LineChart CA 6 mois, PieChart statuts, BarChart grossistes, indicateurs clés

### Backoffice Grossiste
11. **Optimisation d'itinéraire** — Bouton "Optimiser" + réorganisation manuelle (↑↓) des arrêts
12. **Profil boutique au survol** — Affichage zone géographique lors de la sélection

## Développement

```bash
# Lancer tous les services
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/admin-backoffice run dev
pnpm --filter @workspace/grossiste-backoffice run dev
pnpm --filter @workspace/livreur-app run dev

# Codegen (après modification openapi.yaml)
pnpm --filter @workspace/api-spec run codegen

# Migration DB
pnpm --filter @workspace/db run push

# Build APK Android (depuis artifacts/livreur-app/)
# npm install -g eas-cli && eas login && eas build -p android --profile preview
```

## Fonctionnalités Premium (nouvelles)

### App Boutiquier PWA (`/boutiquier/`)
- **Login 3 étapes** — Distributeur → Boutique → PIN 4 chiffres
- **5 onglets** — Accueil | Commander | Livraisons | Wallet | Profil
- **Catalogue produits** — Grille + recherche + filtres par catégorie + panier avec badge
- **Commande en ligne** — Sélection produits, quantités, notes → envoi au grossiste
- **Suivi livraison (Leaflet)** — Carte Dakar avec position livreur en temps réel + étapes
- **Wallet** — Solde, historique transactions, enregistrement paiement (Espèces/Wave/Crédit)
- **Chat** — Messagerie bidirectionnelle avec le grossiste (polling 5s)
- **Programme fidélité** — Niveaux Bronze/Argent/Or/Platine avec avantages détaillés
- **Score crédit** — Barre de progression + limite de crédit sur le profil

### Backoffice Grossiste (`/grossiste/`)
- **Carte Live** — Leaflet map Dakar avec positions GPS simulées des chauffeurs, statuts, boutiques
- **Commandes** — Gestion des commandes reçues des boutiques (Confirmer → Préparer → Livrer)

### App Livreur Expo
- **Wallet** — Solde à remettre, enregistrement collectes, historique transactions
- **4 onglets** — Tournée | Wallet | Historique | Mes Stats

## Nouvelles Tables DB

- **commandes** — Commandes passées par les boutiques (en_attente/confirmée/en_preparation/livree/annulee)
- **commande_items** — Lignes de commandes (produit × quantite × prix)
- **wallet_transactions** — Transactions financières (credit/debit, especes/mobile_money/credit)
- **messages** — Chat bidirectionnel boutique ↔ grossiste ↔ chauffeur
- **preuves_livraison** — Photos et signatures de preuve (dataUrl base64)
- **geolocations** — Positions GPS des chauffeurs horodatées

## Nouveaux Endpoints API (Premium)

- `GET/POST /api/grossistes/:id/commandes` — CRUD commandes boutiquiers
- `PATCH /api/grossistes/:id/commandes/:commandeId/statut` — Mise à jour statut commande
- `GET/POST /api/grossistes/:id/wallet/:actorType/:actorId` — Wallet (boutique/chauffeur)
- `GET/POST /api/grossistes/:id/messages` — Chat messages
- `GET/POST /api/grossistes/:id/geo` — Géolocalisation chauffeurs
- `GET/POST /api/grossistes/:id/livraisons/:livraisonId/preuves` — Preuves de livraison
- `GET /api/grossistes/:id/boutiques/:boutiqueId/commandes` — Commandes d'une boutique

## Données de démo

4 grossistes pré-chargés :
1. **Diallo Distribution SA** — Dakar (actif)
2. **Fofana Frères SARL** — Abidjan (actif)
3. **Konaté & Fils** — Bamako (actif)
4. **TransLog Conakry** — Conakry (inactif)

## Notes importantes

- `react-native-maps` est pinné à 1.18.0 avec des fichiers platform-specific (AppMap.native.tsx / AppMap.web.tsx)
- Les livraisons retournent `{ boutique: { id, nom, adresse, proprietaire, telephone }, montant, statut, ... }` (objet imbriqué)
- Les chauffeurs retournent `prenom` et `nom` séparément → les combiner avec `${prenom} ${nom}`
- Les statuts de livraison valides: `"en_attente"`, `"livree"`, `"echec"`, `"litige"`
- Le PIN est stocké dans AsyncStorage sous la clé `pin_{chauffeurId}`
- Les photos de preuve sont stockées localement dans AsyncStorage sous `localPhotos`
