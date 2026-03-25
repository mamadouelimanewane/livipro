import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { congesChauffeursTable } from "@workspace/db/schema";
import { chauffeursTable } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/conges", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const conges = await db.select({
      id: congesChauffeursTable.id,
      type: congesChauffeursTable.type,
      dateDebut: congesChauffeursTable.dateDebut,
      dateFin: congesChauffeursTable.dateFin,
      motif: congesChauffeursTable.motif,
      statut: congesChauffeursTable.statut,
      createdAt: congesChauffeursTable.createdAt,
      chauffeur: {
        id: chauffeursTable.id,
        nom: chauffeursTable.nom,
        prenom: chauffeursTable.prenom,
        telephone: chauffeursTable.telephone,
      },
    })
      .from(congesChauffeursTable)
      .leftJoin(chauffeursTable, eq(congesChauffeursTable.chauffeurId, chauffeursTable.id))
      .where(eq(congesChauffeursTable.grossisteId, grossisteId))
      .orderBy(desc(congesChauffeursTable.dateDebut));
    res.json(conges);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/conges/disponibilites", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    const congesActifs = await db.select().from(congesChauffeursTable)
      .where(and(
        eq(congesChauffeursTable.grossisteId, grossisteId),
        eq(congesChauffeursTable.statut, "approuve"),
        sql`${congesChauffeursTable.dateDebut} <= ${targetDate} AND ${congesChauffeursTable.dateFin} >= ${targetDate}`,
      ));
    const chauffeursIndisponibles = congesActifs.map(c => c.chauffeurId);
    res.json({ date: targetDate, chauffeursIndisponibles });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/conges", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { chauffeurId, type, dateDebut, dateFin, motif } = req.body;
    const [conge] = await db.insert(congesChauffeursTable).values({
      grossisteId,
      chauffeurId: parseInt(chauffeurId),
      type: type || "conge",
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      motif,
      statut: "approuve",
    }).returning();
    res.status(201).json(conge);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/conges/:id", async (req, res) => {
  try {
    const { statut, motif } = req.body;
    const [conge] = await db.update(congesChauffeursTable)
      .set({ statut, motif })
      .where(eq(congesChauffeursTable.id, parseInt(req.params.id)))
      .returning();
    res.json(conge);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/conges/:id", async (req, res) => {
  try {
    await db.delete(congesChauffeursTable).where(eq(congesChauffeursTable.id, parseInt(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
