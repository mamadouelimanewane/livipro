import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  grossistesTable,
  chauffeursTable,
  boutiquesTable,
  tourneesTable,
  livraisonsTable,
  parametresSystemeTable,
} from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const [grossistesCount] = await db.select({ count: count() }).from(grossistesTable);
    const [chauffeursCount] = await db.select({ count: count() }).from(chauffeursTable);
    const [boutiquesCount] = await db.select({ count: count() }).from(boutiquesTable);
    const [tourneesCount] = await db.select({ count: count() }).from(tourneesTable);
    const [tourneesEnCours] = await db
      .select({ count: count() })
      .from(tourneesTable)
      .where(eq(tourneesTable.statut, "en_cours"));
    const today = new Date().toISOString().split("T")[0];
    const [livraisonsToday] = await db
      .select({ count: count() })
      .from(livraisonsTable)
      .where(sql`DATE(${livraisonsTable.createdAt}) = ${today}`);
    const [caResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${livraisonsTable.montantTotal} AS NUMERIC)), 0)` })
      .from(livraisonsTable)
      .where(sql`DATE_TRUNC('month', ${livraisonsTable.createdAt}) = DATE_TRUNC('month', NOW())`);
    const [livraisonsTotal] = await db.select({ count: count() }).from(livraisonsTable);
    const [livraisonsReussies] = await db
      .select({ count: count() })
      .from(livraisonsTable)
      .where(eq(livraisonsTable.statut, "livree"));
    const tauxReussi =
      Number(livraisonsTotal.count) > 0
        ? (Number(livraisonsReussies.count) / Number(livraisonsTotal.count)) * 100
        : 0;
    res.json({
      totalGrossistes: Number(grossistesCount.count),
      totalChauffeurs: Number(chauffeursCount.count),
      totalBoutiques: Number(boutiquesCount.count),
      totalTournees: Number(tourneesCount.count),
      tourneesEnCours: Number(tourneesEnCours.count),
      livraisonsAujourdHui: Number(livraisonsToday.count),
      chiffreAffairesMensuel: Number(caResult.total),
      tauxLivraisonReussi: Math.round(tauxReussi * 10) / 10,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/grossistes", async (req, res) => {
  try {
    const grossistes = await db.select().from(grossistesTable).orderBy(grossistesTable.createdAt);
    res.json(grossistes.map((g) => ({ ...g, createdAt: g.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/grossistes", async (req, res) => {
  try {
    const { nom, ville, telephone, email, adresse } = req.body;
    const [grossiste] = await db
      .insert(grossistesTable)
      .values({ nom, ville, telephone, email, adresse })
      .returning();
    res.status(201).json({ ...grossiste, createdAt: grossiste.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/grossistes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [grossiste] = await db.select().from(grossistesTable).where(eq(grossistesTable.id, id));
    if (!grossiste) return res.status(404).json({ error: "Grossiste non trouvé" });
    res.json({ ...grossiste, createdAt: grossiste.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/grossistes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, ville, telephone, email, adresse, statut } = req.body;
    const updates: Record<string, unknown> = {};
    if (nom !== undefined) updates.nom = nom;
    if (ville !== undefined) updates.ville = ville;
    if (telephone !== undefined) updates.telephone = telephone;
    if (email !== undefined) updates.email = email;
    if (adresse !== undefined) updates.adresse = adresse;
    if (statut !== undefined) updates.statut = statut;
    const [grossiste] = await db
      .update(grossistesTable)
      .set(updates)
      .where(eq(grossistesTable.id, id))
      .returning();
    if (!grossiste) return res.status(404).json({ error: "Grossiste non trouvé" });
    res.json({ ...grossiste, createdAt: grossiste.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/grossistes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(grossistesTable).where(eq(grossistesTable.id, id));
    res.json({ success: true, message: "Grossiste supprimé" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/tournees", async (req, res) => {
  try {
    const tournees = await db
      .select({
        id: tourneesTable.id,
        grossisteId: tourneesTable.grossisteId,
        grossisteNom: grossistesTable.nom,
        chauffeurId: tourneesTable.chauffeurId,
        chauffeurNom: sql<string>`CONCAT(${chauffeursTable.prenom}, ' ', ${chauffeursTable.nom})`,
        date: tourneesTable.date,
        statut: tourneesTable.statut,
        nombreArrets: sql<number>`COUNT(DISTINCT ${livraisonsTable.id})`,
        totalLivraisons: sql<number>`COALESCE(SUM(CAST(${livraisonsTable.montantTotal} AS NUMERIC)), 0)`,
        createdAt: tourneesTable.createdAt,
      })
      .from(tourneesTable)
      .leftJoin(grossistesTable, eq(tourneesTable.grossisteId, grossistesTable.id))
      .leftJoin(chauffeursTable, eq(tourneesTable.chauffeurId, chauffeursTable.id))
      .leftJoin(livraisonsTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .groupBy(
        tourneesTable.id,
        grossistesTable.nom,
        chauffeursTable.prenom,
        chauffeursTable.nom
      )
      .orderBy(sql`${tourneesTable.createdAt} DESC`);
    res.json(tournees.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/livraisons", async (req, res) => {
  try {
    const livraisons = await db
      .select({
        id: livraisonsTable.id,
        tourneeId: livraisonsTable.tourneeId,
        grossisteId: tourneesTable.grossisteId,
        grossisteNom: grossistesTable.nom,
        boutiqueId: livraisonsTable.boutiqueId,
        boutiqueNom: boutiquesTable.nom,
        statut: livraisonsTable.statut,
        montantTotal: livraisonsTable.montantTotal,
        methodePaiement: livraisonsTable.methodePaiement,
        createdAt: livraisonsTable.createdAt,
      })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .leftJoin(grossistesTable, eq(tourneesTable.grossisteId, grossistesTable.id))
      .leftJoin(boutiquesTable, eq(livraisonsTable.boutiqueId, boutiquesTable.id))
      .orderBy(sql`${livraisonsTable.createdAt} DESC`);
    res.json(
      livraisons.map((l) => ({
        ...l,
        montantTotal: Number(l.montantTotal),
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/benchmark", async (req, res) => {
  try {
    const grossistes = await db.select().from(grossistesTable);
    const benchmarks = await Promise.all(
      grossistes.map(async (g) => {
        const livraisons = await db
          .select({ statut: livraisonsTable.statut, montant: livraisonsTable.montantTotal, methode: livraisonsTable.methodePaiement })
          .from(livraisonsTable)
          .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
          .where(eq(tourneesTable.grossisteId, g.id));
        const tournees = await db.select({ id: tourneesTable.id, statut: tourneesTable.statut }).from(tourneesTable).where(eq(tourneesTable.grossisteId, g.id));
        const [chauffeursCount] = await db.select({ count: count() }).from(chauffeursTable).where(eq(chauffeursTable.grossisteId, g.id));
        const [boutiquesCount] = await db.select({ count: count() }).from(boutiquesTable).where(eq(boutiquesTable.grossisteId, g.id));

        const total = livraisons.length;
        const livrees = livraisons.filter(l => l.statut === "livree").length;
        const litiges = livraisons.filter(l => l.statut === "litige").length;
        const echecs = livraisons.filter(l => l.statut === "echec").length;
        const caTotal = livraisons.reduce((s, l) => s + Number(l.montant), 0);
        const digitalPay = total > 0 ? livraisons.filter(l => l.methode === "mobile_money").length / total : 0;
        const tauxReussite = total > 0 ? (livrees / total) * 100 : 0;
        const tauxLitige = total > 0 ? (litiges / total) * 100 : 0;
        const tourneesTerminees = tournees.filter(t => t.statut === "terminee").length;

        const jobsScore = Math.min(100, Number(chauffeursCount.count) * 10);
        const boutiquesScore = Math.min(100, Number(boutiquesCount.count) * 5);
        const digitalScore = digitalPay * 100;
        const livraisonScore = tauxReussite;
        const esgScore = Math.round((jobsScore * 0.3 + boutiquesScore * 0.3 + digitalScore * 0.2 + livraisonScore * 0.2));

        return {
          grossisteId: g.id, nom: g.nom, ville: g.ville, statut: g.statut,
          totalLivraisons: total, totalTournees: tournees.length, tourneesTerminees,
          caTotal: Math.round(caTotal), chauffeurs: Number(chauffeursCount.count), boutiques: Number(boutiquesCount.count),
          tauxReussite: Math.round(tauxReussite * 10) / 10, tauxLitige: Math.round(tauxLitige * 10) / 10,
          tauxEchec: Math.round((total > 0 ? echecs / total * 100 : 0) * 10) / 10,
          paiementDigital: Math.round(digitalPay * 100), esgScore,
          jobsScore: Math.round(jobsScore), boutiquesScore: Math.round(boutiquesScore),
          digitalScore: Math.round(digitalScore), livraisonScore: Math.round(livraisonScore),
        };
      })
    );

    const actifs = benchmarks.filter(b => b.statut === "actif");
    const moyenneReussite = actifs.length ? actifs.reduce((s, b) => s + b.tauxReussite, 0) / actifs.length : 0;
    const moyenneDigital = actifs.length ? actifs.reduce((s, b) => s + b.paiementDigital, 0) / actifs.length : 0;
    const moyenneESG = actifs.length ? actifs.reduce((s, b) => s + b.esgScore, 0) / actifs.length : 0;

    res.json({
      grossistes: benchmarks.sort((a, b) => b.esgScore - a.esgScore),
      moyennes: { tauxReussite: Math.round(moyenneReussite * 10) / 10, paiementDigital: Math.round(moyenneDigital), esgScore: Math.round(moyenneESG) },
      totalChauffeurs: benchmarks.reduce((s, b) => s + b.chauffeurs, 0),
      totalBoutiques: benchmarks.reduce((s, b) => s + b.boutiques, 0),
      totalCA: benchmarks.reduce((s, b) => s + b.caTotal, 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── PARAMÈTRES SYSTÈME ─────────────────────────────────────────────────────

const DEFAULT_PARAMS = [
  // Financier
  { cle: "commission_taux", valeur: "3.5", type: "number", categorie: "financier", label: "Taux de commission plateforme (%)", description: "Pourcentage prélevé sur chaque transaction" },
  { cle: "credit_limite_defaut", valeur: "150000", type: "number", categorie: "financier", label: "Limite de crédit par défaut (FCFA)", description: "Plafond de crédit attribué à chaque nouvelle boutique" },
  { cle: "delai_paiement_jours", valeur: "30", type: "number", categorie: "financier", label: "Délai de paiement par défaut (jours)", description: "Nombre de jours accordés pour le règlement d'une facture" },
  { cle: "seuil_alerte_credit_pct", valeur: "80", type: "number", categorie: "financier", label: "Seuil d'alerte crédit (%)", description: "Pourcentage d'utilisation du crédit déclenchant une alerte" },
  // Fidélité
  { cle: "fidelite_bronze_pts", valeur: "0", type: "number", categorie: "fidelite", label: "Seuil niveau Bronze (pts)", description: "Points requis pour atteindre le niveau Bronze" },
  { cle: "fidelite_argent_pts", valeur: "200", type: "number", categorie: "fidelite", label: "Seuil niveau Argent (pts)", description: "Points requis pour atteindre le niveau Argent" },
  { cle: "fidelite_or_pts", valeur: "500", type: "number", categorie: "fidelite", label: "Seuil niveau Or (pts)", description: "Points requis pour atteindre le niveau Or" },
  { cle: "fidelite_platine_pts", valeur: "1000", type: "number", categorie: "fidelite", label: "Seuil niveau Platine (pts)", description: "Points requis pour atteindre le niveau Platine" },
  { cle: "fidelite_pts_livraison", valeur: "10", type: "number", categorie: "fidelite", label: "Points par livraison réussie", description: "Points de fidélité accordés à chaque livraison validée" },
  // Sécurité
  { cle: "pin_longueur", valeur: "4", type: "number", categorie: "securite", label: "Longueur du code PIN", description: "Nombre de chiffres requis pour le code PIN boutiquier" },
  { cle: "pin_tentatives_max", valeur: "5", type: "number", categorie: "securite", label: "Tentatives PIN max", description: "Nombre maximum de tentatives avant blocage du compte" },
  { cle: "jwt_expiry_heures", valeur: "24", type: "number", categorie: "securite", label: "Expiration token JWT (heures)", description: "Durée de validité des tokens d'authentification" },
  { cle: "session_timeout_min", valeur: "60", type: "number", categorie: "securite", label: "Timeout session (minutes)", description: "Durée d'inactivité avant déconnexion automatique" },
  // Géolocalisation
  { cle: "geo_intervalle_sec", valeur: "30", type: "number", categorie: "geolocalisation", label: "Intervalle de géolocalisation (sec)", description: "Fréquence d'envoi des positions GPS des livreurs" },
  { cle: "geo_precision_metres", valeur: "50", type: "number", categorie: "geolocalisation", label: "Précision GPS minimale (m)", description: "Précision minimale en mètres pour accepter une position" },
  { cle: "geo_retention_jours", valeur: "90", type: "number", categorie: "geolocalisation", label: "Rétention données GPS (jours)", description: "Durée de conservation des historiques de position" },
  // Fonctionnalités
  { cle: "feature_chat", valeur: "true", type: "boolean", categorie: "fonctionnalites", label: "Activer le chat en temps réel", description: "Permet aux boutiquiers et livreurs de communiquer via l'app" },
  { cle: "feature_wallet", valeur: "true", type: "boolean", categorie: "fonctionnalites", label: "Activer le wallet numérique", description: "Gestion du portefeuille numérique pour les transactions" },
  { cle: "feature_signature", valeur: "true", type: "boolean", categorie: "fonctionnalites", label: "Activer la signature électronique", description: "Signature numérique lors de la livraison" },
  { cle: "feature_photo_preuve", valeur: "true", type: "boolean", categorie: "fonctionnalites", label: "Activer la photo de preuve", description: "Photo obligatoire lors de chaque livraison" },
  { cle: "feature_colisage", valeur: "true", type: "boolean", categorie: "fonctionnalites", label: "Activer le colisage livreur", description: "Authentification du livreur au retrait entrepôt" },
  { cle: "feature_rapport_pdf", valeur: "true", type: "boolean", categorie: "fonctionnalites", label: "Activer les rapports PDF", description: "Génération de rapports exportables en PDF" },
  // Notifications
  { cle: "notif_livraison_livreur", valeur: "true", type: "boolean", categorie: "notifications", label: "Notifier le livreur à chaque livraison", description: "Envoi d'une notification push au livreur" },
  { cle: "notif_commande_grossiste", valeur: "true", type: "boolean", categorie: "notifications", label: "Notifier le grossiste à chaque commande", description: "Notification SMS/email au grossiste pour chaque commande reçue" },
  { cle: "notif_alerte_litige", valeur: "true", type: "boolean", categorie: "notifications", label: "Alertes litige en temps réel", description: "Notification immédiate en cas de litige de livraison" },
];

async function seedDefaultParams() {
  for (const param of DEFAULT_PARAMS) {
    try {
      await db.insert(parametresSystemeTable).values(param).onConflictDoNothing();
    } catch {}
  }
}

router.get("/parametres", async (req, res) => {
  try {
    await seedDefaultParams();
    const params = await db.select().from(parametresSystemeTable).orderBy(parametresSystemeTable.categorie, parametresSystemeTable.label);
    res.json(params);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/parametres/:cle", async (req, res) => {
  try {
    const { valeur } = req.body;
    if (valeur === undefined) return res.status(400).json({ error: "valeur requise" });
    const [updated] = await db.update(parametresSystemeTable)
      .set({ valeur: String(valeur), updatedAt: new Date() })
      .where(eq(parametresSystemeTable.cle, req.params.cle))
      .returning();
    if (!updated) return res.status(404).json({ error: "Paramètre introuvable" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/parametres/reset", async (req, res) => {
  try {
    await db.delete(parametresSystemeTable);
    await seedDefaultParams();
    const params = await db.select().from(parametresSystemeTable);
    res.json({ message: "Paramètres réinitialisés", count: params.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
