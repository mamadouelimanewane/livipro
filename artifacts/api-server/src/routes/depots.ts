import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { depotsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/depots", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const depots = await db.select().from(depotsTable)
      .where(eq(depotsTable.grossisteId, grossisteId))
      .orderBy(desc(depotsTable.createdAt));
    if (depots.length === 0) {
      const [defaut] = await db.insert(depotsTable).values({
        grossisteId,
        nom: "Dépôt Principal",
        adresse: "Siège social",
        ville: "Dakar",
        actif: true,
      }).returning();
      return res.json([defaut]);
    }
    res.json(depots);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/depots", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { nom, adresse, ville, lat, lng, responsable, telephone } = req.body;
    const [depot] = await db.insert(depotsTable).values({
      grossisteId,
      nom,
      adresse,
      ville,
      lat: lat || null,
      lng: lng || null,
      responsable,
      telephone,
      actif: true,
    }).returning();
    res.status(201).json(depot);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/depots/:id", async (req, res) => {
  try {
    const data = req.body;
    const [depot] = await db.update(depotsTable)
      .set(data)
      .where(eq(depotsTable.id, parseInt(req.params.id)))
      .returning();
    res.json(depot);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/depots/:id", async (req, res) => {
  try {
    await db.update(depotsTable)
      .set({ actif: false })
      .where(eq(depotsTable.id, parseInt(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
