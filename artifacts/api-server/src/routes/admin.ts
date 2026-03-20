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

export default router;
