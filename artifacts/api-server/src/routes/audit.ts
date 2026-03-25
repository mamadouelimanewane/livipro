import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { auditTrailTable } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/audit", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { action, ressource, limit: lim } = req.query;
    const logs = await db.select().from(auditTrailTable)
      .where(eq(auditTrailTable.grossisteId, grossisteId))
      .orderBy(desc(auditTrailTable.createdAt))
      .limit(parseInt(lim as string) || 100);
    let filtered = logs;
    if (action) filtered = filtered.filter(l => l.action === action);
    if (ressource) filtered = filtered.filter(l => l.ressource === ressource);
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/audit", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { acteurType, acteurId, acteurNom, action, ressource, ressourceId, details } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const [log] = await db.insert(auditTrailTable).values({
      grossisteId,
      acteurType,
      acteurId,
      acteurNom,
      action,
      ressource,
      ressourceId,
      details: details ? JSON.stringify(details) : null,
      ip,
      userAgent,
    }).returning();
    res.status(201).json(log);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export const logAudit = async (grossisteId: number, acteurType: string, acteurNom: string, action: string, ressource: string, ressourceId?: number, details?: unknown) => {
  try {
    await db.insert(auditTrailTable).values({
      grossisteId,
      acteurType,
      acteurNom,
      action,
      ressource,
      ressourceId,
      details: details ? JSON.stringify(details) : null,
    });
  } catch {}
};

export default router;
