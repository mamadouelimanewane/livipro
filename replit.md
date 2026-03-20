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
- **Frontend**: React 19 + Vite + TailwindCSS + shadcn/ui

## Applications

| Application | URL | Description |
|---|---|---|
| **Backoffice Administrateur** | `/` | Super-admin: gestion de tous les grossistes, KPIs globaux, supervision |
| **Backoffice Grossiste** | `/grossiste/` | Espace personnel par grossiste: chauffeurs, boutiques, tournées |
| **API Server** | `/api` | Express API REST |

## Structure

```text
artifacts/
├── admin-backoffice/     # Backoffice Super Admin (React + Vite)
├── grossiste-backoffice/ # Backoffice Grossiste (React + Vite)
└── api-server/           # Express API Server
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
- `GET/POST /api/grossistes/:id/tournees` — CRUD tournées
- `GET/PUT /api/grossistes/:id/tournees/:tid` — Détails et MAJ statut
- `GET /api/grossistes/:id/livraisons` — Livraisons du grossiste

## Développement

```bash
# Lancer tous les services
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/admin-backoffice run dev
pnpm --filter @workspace/grossiste-backoffice run dev

# Codegen (après modification openapi.yaml)
pnpm --filter @workspace/api-spec run codegen

# Migration DB
pnpm --filter @workspace/db run push
```

## Données de démo

4 grossistes pré-chargés :
1. **Diallo Distribution SA** — Dakar (actif)
2. **Fofana Frères SARL** — Abidjan (actif)
3. **Konaté & Fils** — Bamako (actif)
4. **TransLog Conakry** — Conakry (inactif)

## Note sur l'APK Android

L'application mobile (LiviPro Distri + LiviDash Boutiquier) était initialement construite avec React + Vite + Capacitor (voir le dépôt GitHub https://github.com/mamadouelimanewane/livipro). Pour générer l'APK, il faut :
1. Cloner le repo GitHub localement
2. Installer les dépendances (`npm install`)
3. Builder (`npm run build`)
4. Synchroniser Capacitor (`npx cap sync android`)
5. Compiler avec Android Studio ou `./gradlew assembleDebug`
