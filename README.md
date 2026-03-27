# 🏗️ LiviPro B2B - Plateforme Logistique & Distribution
**Version:** Prototype 1.0.0
**Écosystème:** LiviGo (Indépendant de la branche B2C)

## 🎯 Vision du Produit
**LiviPro** n'est pas une simple application de livraison, c'est un **Système d'Exécution Logistique (LES) Mobile** couplé à un outil de **Vente B2B**. Son but est de transformer la chaîne d'approvisionnement des grossistes et distributeurs (FMCG, BTP, Agroalimentaire) en la rendant intelligente, transparente, et incitative pour le boutiquier.

---

## 🚀 Écosystème à Double Facette (Multi-Sided Platform)
Le projet contient deux interfaces distinctes, accessibles via le même système de routage initial.

### 1. 🚛 LiviPro Distri (Le Portail Chauffeur & Manutentionnaire)
Dédié à l'exécution de la "Tournée". Le chauffeur dispose d'un Manifeste dématérialisé qui le guide d'arrêt en arrêt. L'outil centralise toute la charge sécuritaire de la tournée :
*   **Geolocalisation (MapView)** : Tracer la route de la flotte visuellement (Leaflet + LocationIQ).
*   **Encaissement Sécurisé (Cash-in-Transit)** : Suivi en direct du coffre-fort virtuel du camion ("Espèces à bord").
*   **Signature & PoD (Proof of Delivery)** : Signature électronique sur `<canvas>` pour clôturer juridiquement une livraison (sans papier).
*   **Gestion de Litige sur place** : Si des cartons sont abîmés, le livreur les déclare. Le système recalcule le total et génère un **Avoir Automatique (Credit Note)**, éliminant les fraudes ou erreurs comptables.
*   **LiviPay B2B (QR Code)** : Génération instantanée d'un QR code pour que le boutiquier puisse payer le grossiste via Mobile Money, réduisant le risque de braquage du livreur.

### 2. 🏪 LiviDash Boutiquier (Le Portail Client)
Dédié au marchand de proximité, grossiste régional, ou détaillant. L'interface efface toute friction pour déclencher le réassort.
*   **Commande "1 Clic" / SmartTag NFC** : Déclenchement d'une commande d'urgence si le rayon est vide (Alerte Batterie faible/Rupture).
*   **LiviKredit (Buy Now, Pay Later B2B)** : Une notation (Scoring) financière automatique indique au commerçant sa limite de crédit avec le grossiste ("Payer à J+7"), ce qui le force à commander davantage.
*   **Upsell Ciblé (Push Marketing)** : Mise en avant du stock invendu présent dans le camion passant à proximité.
*   **LiviGroupage (Achat Collaboratif)** : Rejoindre des offres temporaires et massives avec d'autres boutiquiers pour obtenir des remises "Grossiste" (jusqu'à -20%).
---

## 🤖 L'Innovation Majeure : L'IA "Upselling Prédictif"
Le livreur devient un "Super-Commercial". Au moment d'arriver à la boutique, LiviPro analyse la commande. Si la boutique achète historiquement *20 cartons de lait* par mois, mais n'en a pris que 12 cette fois-ci, **l'application envoie une notification IA jaune scintillante au livreur :**
> *"Le supermarché a commandé moins que son habitude. Il vous reste 5 cartons de lait dans le camion. Proposez-les !"*

D'un seul clic *(Bouton "+ Ajouter 5 cartons")*, le système modifie la livraison, facture le supplément via LiviPay, et augmente le chiffre d'affaires quotidien de la tournée. L'inventaire de l'entrepôt est mis à jour depuis le camion.

---

## 🌍 Fonctionnalités B2B 2.0 (World-Class)
Pour convaincre les acteurs les plus exigeants, LiviPro intègre des fonctionnalités de classe mondiale qui redéfinissent la confiance et la collaboration en Afrique :

1. **LiviChain Traceability (Confiance Totale)** :
   - **Certification** : Scan des prix et produits certifiés numériquement pour garantir l'origine et lutter contre la contrefaçon.
   - **Smart Contracts** : Décaissements Tontines et paiements P2P verrouillés par la blockchain du réseau interne.
2. **LiviRelay (Logistique 2.0 & Revenus Passifs)** :
   - Transforme les supermarchés bien situés en "Hubs" intermédiaires. La boutique stocke temporairement des colis pour les détaillants voisins contre rétribution, optimisant le dernier kilomètre.
3. **LiviVoice AI (Accessibilité Omniprésente)** :
   - Les commerçants, souvent occupés ou peu à l'aise avec la saisie, passent commande ou interrogent les stocks directement à la voix. Assistant NLP intégré.
4. **LiviSocial & Network Health (Transparence & Data)** :
   - Un flux d'alerte logistique (embouteillages, arrivages au port) alimenté par la communauté. Au niveau global, le "Network Health Score" garantit à l'investisseur 98%+ de résilience.
5. **LiviAI Assistant (Insights Prédictifs)** :
   - Un widget IA permanent analyse discrètement les données et notifie le propriétaire en temps réel : opportunités de vente croisée, alertes sur les baisses de Karma, ou conseils de déstockage massif via **LiviGroupage**.
---

## 🛠️ Stack Technique
- **Framework Frontend** : React 19 + Vite 8 (Ultra rapide).
- **Cartographie** : `react-leaflet` et `leaflet` couplés à l'API LocationIQ.
- **Backend / BDD** : Intégration de l'API REST `supabase-js`, connectée au même environnement SaaS que LiviGo (synchronisation en temps réel).
- **Icônes & UI** : `lucide-react` et composants "Glassmorphism" premium via CSS pur (Vanilla CSS) avec polices adaptées `Inter`.
- **Composants Lourds (B2B)** : `react-signature-canvas` pour la signature cryptographique manuscrite.

---

## 🔮 Roadmap & Fonctionnalités à venir (Next-Gen)

Pour s'imposer mondialement, LiviPro doit intégrer des API profondes :
1. **Intégration Télématique & Froid (IoT)** : Connecter l'application aux capteurs Bluetooth embarqués dans les camions frigorifiques. Si un camion livre de la viande, le client peut scanner un QR code remis par le livreur pour *prouver que la courbe de froid (0-4°C) n'a jamais été cassée*.
2. **Scanner OCR "Anti-Fraud" des factures manuscrites** : Utilisation d'une API Cloud Vision pour que le livreur photographie les chèques de banques / traites données par les boutiquiers, les liant instantanément à l'ID de la commande.
3. **Connecteurs ERP Industriels** : Créer un "Webhook" (Passerelle) via Supabase Edge Functions permettant à LiviPro de communiquer discrètement en arrière-plan avec *SAP*, *Odoo*, ou *Sage 100* des grands distributeurs (Nestlé, Coca-Cola...).
4. **Calcul de Rendement Carburant** : L'interface "Tournée" mesure l'écart entre le kilométrage optimal LiviPro et le dédomètre réel du camion pour tracker s'il n'y a pas eu siphonage du gazole.
