import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/notifications", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { destinataireType, destinataireId, nonLu } = req.query;
    let query = db.select().from(notificationsTable)
      .where(eq(notificationsTable.grossisteId, grossisteId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
    const notifs = await query;
    let filtered = notifs;
    if (destinataireType) filtered = filtered.filter(n => n.destinataireType === destinataireType);
    if (destinataireId) filtered = filtered.filter(n => n.destinataireId === parseInt(destinataireId as string));
    if (nonLu === "true") filtered = filtered.filter(n => !n.lu);
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { destinataireType, destinataireId, titre, message, type, lienType, lienId } = req.body;
    const [notif] = await db.insert(notificationsTable).values({
      grossisteId,
      destinataireType,
      destinataireId,
      titre,
      message,
      type: type || "info",
      lienType,
      lienId,
    }).returning();
    res.status(201).json(notif);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/notifications/:id/lire", async (req, res) => {
  try {
    const [notif] = await db.update(notificationsTable)
      .set({ lu: true })
      .where(eq(notificationsTable.id, parseInt(req.params.id)))
      .returning();
    res.json(notif);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/notifications/tout-lire", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    await db.update(notificationsTable)
      .set({ lu: true })
      .where(eq(notificationsTable.grossisteId, grossisteId));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
