import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  grossistesTable,
  chauffeursTable,
  boutiquesTable,
  produitsTable,
  tourneesTable,
  livraisonsTable,
} from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/stats", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const [chauffeursCount] = await db
      .select({ count: count() })
      .from(chauffeursTable)
      .where(eq(chauffeursTable.grossisteId, grossisteId));
    const [boutiquesCount] = await db
      .select({ count: count() })
      .from(boutiquesTable)
      .where(eq(boutiquesTable.grossisteId, grossisteId));
    const [tourneesCount] = await db
      .select({ count: count() })
      .from(tourneesTable)
      .where(eq(tourneesTable.grossisteId, grossisteId));
    const [tourneesEnCours] = await db
      .select({ count: count() })
      .from(tourneesTable)
      .where(eq(tourneesTable.statut, "en_cours"));
    const today = new Date().toISOString().split("T")[0];
    const livraisonsToday = await db
      .select({ count: count() })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(
        sql`${tourneesTable.grossisteId} = ${grossisteId} AND DATE(${livraisonsTable.createdAt}) = ${today}`
      );
    const caResult = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${livraisonsTable.montantTotal} AS NUMERIC)), 0)` })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(
        sql`${tourneesTable.grossisteId} = ${grossisteId} AND DATE_TRUNC('month', ${livraisonsTable.createdAt}) = DATE_TRUNC('month', NOW())`
      );
    const livraisonsTotal = await db
      .select({ count: count() })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(eq(tourneesTable.grossisteId, grossisteId));
    const livraisonsReussies = await db
      .select({ count: count() })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(
        sql`${tourneesTable.grossisteId} = ${grossisteId} AND ${livraisonsTable.statut} = 'livree'`
      );
    const tauxReussi =
      Number(livraisonsTotal[0]?.count ?? 0) > 0
        ? (Number(livraisonsReussies[0]?.count ?? 0) / Number(livraisonsTotal[0]?.count ?? 1)) * 100
        : 0;
    res.json({
      totalChauffeurs: Number(chauffeursCount.count),
      totalBoutiques: Number(boutiquesCount.count),
      totalTournees: Number(tourneesCount.count),
      tourneesEnCours: Number(tourneesEnCours.count),
      livraisonsAujourdHui: Number(livraisonsToday[0]?.count ?? 0),
      chiffreAffairesMensuel: Number(caResult[0]?.total ?? 0),
      tauxLivraisonReussi: Math.round(tauxReussi * 10) / 10,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/chauffeurs", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const chauffeurs = await db
      .select()
      .from(chauffeursTable)
      .where(eq(chauffeursTable.grossisteId, grossisteId))
      .orderBy(chauffeursTable.createdAt);
    res.json(chauffeurs.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/chauffeurs", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { nom, prenom, telephone, permis } = req.body;
    const [chauffeur] = await db
      .insert(chauffeursTable)
      .values({ grossisteId, nom, prenom, telephone, permis })
      .returning();
    res.status(201).json({ ...chauffeur, createdAt: chauffeur.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/chauffeurs/:chauffeurId", async (req, res) => {
  try {
    const chauffeurId = parseInt(req.params.chauffeurId);
    const { nom, prenom, telephone, permis, statut } = req.body;
    const updates: Record<string, unknown> = {};
    if (nom !== undefined) updates.nom = nom;
    if (prenom !== undefined) updates.prenom = prenom;
    if (telephone !== undefined) updates.telephone = telephone;
    if (permis !== undefined) updates.permis = permis;
    if (statut !== undefined) updates.statut = statut;
    const [chauffeur] = await db
      .update(chauffeursTable)
      .set(updates)
      .where(eq(chauffeursTable.id, chauffeurId))
      .returning();
    if (!chauffeur) return res.status(404).json({ error: "Chauffeur non trouvé" });
    res.json({ ...chauffeur, createdAt: chauffeur.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/chauffeurs/:chauffeurId", async (req, res) => {
  try {
    const chauffeurId = parseInt(req.params.chauffeurId);
    await db.delete(chauffeursTable).where(eq(chauffeursTable.id, chauffeurId));
    res.json({ success: true, message: "Chauffeur supprimé" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/boutiques", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const boutiques = await db
      .select()
      .from(boutiquesTable)
      .where(eq(boutiquesTable.grossisteId, grossisteId))
      .orderBy(boutiquesTable.createdAt);
    res.json(
      boutiques.map((b) => ({
        ...b,
        limiteCredit: Number(b.limiteCredit),
        soldeCredit: Number(b.soldeCredit),
        createdAt: b.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/boutiques", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { nom, proprietaire, adresse, telephone, limiteCredit } = req.body;
    const [boutique] = await db
      .insert(boutiquesTable)
      .values({ grossisteId, nom, proprietaire, adresse, telephone, limiteCredit: String(limiteCredit) })
      .returning();
    res.status(201).json({
      ...boutique,
      limiteCredit: Number(boutique.limiteCredit),
      soldeCredit: Number(boutique.soldeCredit),
      createdAt: boutique.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/boutiques/:boutiqueId", async (req, res) => {
  try {
    const boutiqueId = parseInt(req.params.boutiqueId);
    const { nom, proprietaire, adresse, telephone, limiteCredit, statut } = req.body;
    const updates: Record<string, unknown> = {};
    if (nom !== undefined) updates.nom = nom;
    if (proprietaire !== undefined) updates.proprietaire = proprietaire;
    if (adresse !== undefined) updates.adresse = adresse;
    if (telephone !== undefined) updates.telephone = telephone;
    if (limiteCredit !== undefined) updates.limiteCredit = String(limiteCredit);
    if (statut !== undefined) updates.statut = statut;
    const [boutique] = await db
      .update(boutiquesTable)
      .set(updates)
      .where(eq(boutiquesTable.id, boutiqueId))
      .returning();
    if (!boutique) return res.status(404).json({ error: "Boutique non trouvée" });
    res.json({
      ...boutique,
      limiteCredit: Number(boutique.limiteCredit),
      soldeCredit: Number(boutique.soldeCredit),
      createdAt: boutique.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/boutiques/:boutiqueId", async (req, res) => {
  try {
    const boutiqueId = parseInt(req.params.boutiqueId);
    await db.delete(boutiquesTable).where(eq(boutiquesTable.id, boutiqueId));
    res.json({ success: true, message: "Boutique supprimée" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/produits", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const produits = await db
      .select()
      .from(produitsTable)
      .where(eq(produitsTable.grossisteId, grossisteId))
      .orderBy(produitsTable.createdAt);
    res.json(
      produits.map((p) => ({
        ...p,
        prixUnitaire: Number(p.prixUnitaire),
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/produits", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { nom, categorie, prixUnitaire, unite, stockDisponible } = req.body;
    const [produit] = await db
      .insert(produitsTable)
      .values({ grossisteId, nom, categorie, prixUnitaire: String(prixUnitaire), unite, stockDisponible })
      .returning();
    res.status(201).json({ ...produit, prixUnitaire: Number(produit.prixUnitaire), createdAt: produit.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/produits/:produitId", async (req, res) => {
  try {
    const produitId = parseInt(req.params.produitId);
    const { nom, categorie, prixUnitaire, unite, stockDisponible } = req.body;
    const updates: Record<string, unknown> = {};
    if (nom !== undefined) updates.nom = nom;
    if (categorie !== undefined) updates.categorie = categorie;
    if (prixUnitaire !== undefined) updates.prixUnitaire = String(prixUnitaire);
    if (unite !== undefined) updates.unite = unite;
    if (stockDisponible !== undefined) updates.stockDisponible = stockDisponible;
    const [produit] = await db
      .update(produitsTable)
      .set(updates)
      .where(eq(produitsTable.id, produitId))
      .returning();
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });
    res.json({ ...produit, prixUnitaire: Number(produit.prixUnitaire), createdAt: produit.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/produits/:produitId", async (req, res) => {
  try {
    const produitId = parseInt(req.params.produitId);
    await db.delete(produitsTable).where(eq(produitsTable.id, produitId));
    res.json({ success: true, message: "Produit supprimé" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/tournees", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const tournees = await db
      .select({
        id: tourneesTable.id,
        grossisteId: tourneesTable.grossisteId,
        chauffeurId: tourneesTable.chauffeurId,
        chauffeurNom: sql<string>`CONCAT(${chauffeursTable.prenom}, ' ', ${chauffeursTable.nom})`,
        date: tourneesTable.date,
        statut: tourneesTable.statut,
        nombreArrets: sql<number>`COUNT(DISTINCT ${livraisonsTable.id})`,
        totalLivraisons: sql<number>`COALESCE(SUM(CAST(${livraisonsTable.montantTotal} AS NUMERIC)), 0)`,
        createdAt: tourneesTable.createdAt,
      })
      .from(tourneesTable)
      .leftJoin(chauffeursTable, eq(tourneesTable.chauffeurId, chauffeursTable.id))
      .leftJoin(livraisonsTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(eq(tourneesTable.grossisteId, grossisteId))
      .groupBy(tourneesTable.id, chauffeursTable.prenom, chauffeursTable.nom)
      .orderBy(sql`${tourneesTable.createdAt} DESC`);
    res.json(tournees.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/tournees", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { chauffeurId, date, boutiqueIds } = req.body;
    const [tournee] = await db
      .insert(tourneesTable)
      .values({ grossisteId, chauffeurId, date })
      .returning();
    if (boutiqueIds && boutiqueIds.length > 0) {
      await db.insert(livraisonsTable).values(
        boutiqueIds.map((boutiqueId: number) => ({
          tourneeId: tournee.id,
          boutiqueId,
        }))
      );
    }
    const [chauffeur] = await db
      .select()
      .from(chauffeursTable)
      .where(eq(chauffeursTable.id, chauffeurId));
    res.status(201).json({
      ...tournee,
      chauffeurNom: chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : "",
      nombreArrets: boutiqueIds?.length ?? 0,
      totalLivraisons: 0,
      createdAt: tournee.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/tournees/:tourneeId", async (req, res) => {
  try {
    const tourneeId = parseInt(req.params.tourneeId);
    const [tournee] = await db
      .select({
        id: tourneesTable.id,
        grossisteId: tourneesTable.grossisteId,
        chauffeurId: tourneesTable.chauffeurId,
        chauffeurNom: sql<string>`CONCAT(${chauffeursTable.prenom}, ' ', ${chauffeursTable.nom})`,
        date: tourneesTable.date,
        statut: tourneesTable.statut,
        nombreArrets: sql<number>`COUNT(DISTINCT ${livraisonsTable.id})`,
        totalLivraisons: sql<number>`COALESCE(SUM(CAST(${livraisonsTable.montantTotal} AS NUMERIC)), 0)`,
        createdAt: tourneesTable.createdAt,
      })
      .from(tourneesTable)
      .leftJoin(chauffeursTable, eq(tourneesTable.chauffeurId, chauffeursTable.id))
      .leftJoin(livraisonsTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(eq(tourneesTable.id, tourneeId))
      .groupBy(tourneesTable.id, chauffeursTable.prenom, chauffeursTable.nom);
    if (!tournee) return res.status(404).json({ error: "Tournée non trouvée" });
    const livraisons = await db
      .select({
        id: livraisonsTable.id,
        tourneeId: livraisonsTable.tourneeId,
        boutiqueId: livraisonsTable.boutiqueId,
        boutiqueNom: boutiquesTable.nom,
        statut: livraisonsTable.statut,
        montantTotal: livraisonsTable.montantTotal,
        methodePaiement: livraisonsTable.methodePaiement,
        createdAt: livraisonsTable.createdAt,
      })
      .from(livraisonsTable)
      .leftJoin(boutiquesTable, eq(livraisonsTable.boutiqueId, boutiquesTable.id))
      .where(eq(livraisonsTable.tourneeId, tourneeId));
    res.json({
      ...tournee,
      livraisons: livraisons.map((l) => ({
        ...l,
        montantTotal: Number(l.montantTotal),
        boutiqueNom: l.boutiqueNom ?? "",
        createdAt: l.createdAt.toISOString(),
      })),
      createdAt: tournee.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/tournees/:tourneeId", async (req, res) => {
  try {
    const tourneeId = parseInt(req.params.tourneeId);
    const { statut } = req.body;
    const [tournee] = await db
      .update(tourneesTable)
      .set({ statut })
      .where(eq(tourneesTable.id, tourneeId))
      .returning();
    if (!tournee) return res.status(404).json({ error: "Tournée non trouvée" });
    const [chauffeur] = await db
      .select()
      .from(chauffeursTable)
      .where(eq(chauffeursTable.id, tournee.chauffeurId));
    res.json({
      ...tournee,
      chauffeurNom: chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : "",
      nombreArrets: 0,
      totalLivraisons: 0,
      createdAt: tournee.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/livraisons", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const livraisons = await db
      .select({
        id: livraisonsTable.id,
        tourneeId: livraisonsTable.tourneeId,
        boutiqueId: livraisonsTable.boutiqueId,
        boutiqueNom: boutiquesTable.nom,
        statut: livraisonsTable.statut,
        montantTotal: livraisonsTable.montantTotal,
        methodePaiement: livraisonsTable.methodePaiement,
        createdAt: livraisonsTable.createdAt,
      })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .leftJoin(boutiquesTable, eq(livraisonsTable.boutiqueId, boutiquesTable.id))
      .where(eq(tourneesTable.grossisteId, grossisteId))
      .orderBy(sql`${livraisonsTable.createdAt} DESC`);
    res.json(
      livraisons.map((l) => ({
        ...l,
        montantTotal: Number(l.montantTotal),
        boutiqueNom: l.boutiqueNom ?? "",
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
