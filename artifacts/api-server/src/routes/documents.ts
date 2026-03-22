import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { documentsTable } from "@workspace/db/schema";
import { boutiquesTable } from "@workspace/db/schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

// ─── LIST DOCUMENTS ──────────────────────────────────────────────────────────
// GET /api/grossistes/:grossisteId/documents?boutiqueId=X
// Returns documents visible to a boutique (boutiqueId match OR null = all)

router.get("/documents", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const boutiqueId = req.query.boutiqueId ? parseInt(req.query.boutiqueId as string) : null;

    const docs = boutiqueId
      ? await db.select({
          id: documentsTable.id,
          grossisteId: documentsTable.grossisteId,
          boutiqueId: documentsTable.boutiqueId,
          type: documentsTable.type,
          nom: documentsTable.nom,
          description: documentsTable.description,
          mimeType: documentsTable.mimeType,
          taille: documentsTable.taille,
          createdAt: documentsTable.createdAt,
        }).from(documentsTable).where(
          and(
            eq(documentsTable.grossisteId, grossisteId),
            or(eq(documentsTable.boutiqueId, boutiqueId), isNull(documentsTable.boutiqueId))
          )
        ).orderBy(desc(documentsTable.createdAt))
      : await db.select({
          id: documentsTable.id,
          grossisteId: documentsTable.grossisteId,
          boutiqueId: documentsTable.boutiqueId,
          type: documentsTable.type,
          nom: documentsTable.nom,
          description: documentsTable.description,
          mimeType: documentsTable.mimeType,
          taille: documentsTable.taille,
          createdAt: documentsTable.createdAt,
        }).from(documentsTable).where(
          eq(documentsTable.grossisteId, grossisteId)
        ).orderBy(desc(documentsTable.createdAt));

    // Enrich with boutique name
    const enriched = await Promise.all(docs.map(async (d) => {
      if (!d.boutiqueId) return { ...d, boutique: null };
      const [b] = await db.select({ nom: boutiquesTable.nom })
        .from(boutiquesTable).where(eq(boutiquesTable.id, d.boutiqueId)).limit(1);
      return { ...d, boutique: b ?? null };
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── UPLOAD DOCUMENT ─────────────────────────────────────────────────────────
// POST /api/grossistes/:grossisteId/documents

router.post("/documents", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { boutiqueId, type, nom, description, mimeType, taille, contenu } = req.body;

    if (!nom || !contenu) return res.status(400).json({ error: "nom et contenu requis" });

    const [doc] = await db.insert(documentsTable).values({
      grossisteId,
      boutiqueId: boutiqueId ? parseInt(boutiqueId) : null,
      type: type || "autre",
      nom,
      description: description || null,
      mimeType: mimeType || "application/octet-stream",
      taille: taille ? parseInt(taille) : null,
      contenu,
    }).returning();

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── DOWNLOAD DOCUMENT ───────────────────────────────────────────────────────
// GET /api/grossistes/:grossisteId/documents/:docId/download

router.get("/documents/:docId/download", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const docId = parseInt(req.params.docId);

    const [doc] = await db.select().from(documentsTable)
      .where(and(eq(documentsTable.id, docId), eq(documentsTable.grossisteId, grossisteId)))
      .limit(1);

    if (!doc) return res.status(404).json({ error: "Document introuvable" });

    const buf = Buffer.from(doc.contenu.replace(/^data:[^;]+;base64,/, ""), "base64");
    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(doc.nom)}"`);
    res.setHeader("Content-Length", buf.length);
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── DELETE DOCUMENT ─────────────────────────────────────────────────────────
// DELETE /api/grossistes/:grossisteId/documents/:docId

router.delete("/documents/:docId", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const docId = parseInt(req.params.docId);

    await db.delete(documentsTable)
      .where(and(eq(documentsTable.id, docId), eq(documentsTable.grossisteId, grossisteId)));

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
