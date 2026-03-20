import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  grossistesTable,
  chauffeursTable,
  boutiquesTable,
  tourneesTable,
  livraisonsTable,
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

export default router;
