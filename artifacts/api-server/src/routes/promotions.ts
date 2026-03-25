import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { promotionsTable } from "@workspace/db/schema";
import { commandesTable } from "@workspace/db/schema";
import { eq, desc, and, sql, lte, gte } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/promotions", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const promos = await db.select().from(promotionsTable)
      .where(eq(promotionsTable.grossisteId, grossisteId))
      .orderBy(desc(promotionsTable.createdAt));
    res.json(promos);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/promotions/actives", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const now = new Date();
    const promos = await db.select().from(promotionsTable)
      .where(and(
        eq(promotionsTable.grossisteId, grossisteId),
        eq(promotionsTable.actif, true),
      ))
      .orderBy(desc(promotionsTable.createdAt));
    const filtered = promos.filter(p => {
      const debut = p.dateDebut ? new Date(p.dateDebut) : null;
      const fin = p.dateFin ? new Date(p.dateFin) : null;
      if (debut && debut > now) return false;
      if (fin && fin < now) return false;
      if (p.usagesMax !== null && p.usagesActuels >= p.usagesMax) return false;
      return true;
    });
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/promotions/verifier", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { code, montantCommande, boutiqueId } = req.body;
    const [promo] = await db.select().from(promotionsTable)
      .where(and(
        eq(promotionsTable.grossisteId, grossisteId),
        eq(promotionsTable.code, code.toUpperCase()),
        eq(promotionsTable.actif, true),
      ));
    if (!promo) return res.status(404).json({ valid: false, message: "Code promo invalide" });
    const now = new Date();
    if (promo.dateFin && new Date(promo.dateFin) < now)
      return res.json({ valid: false, message: "Code promo expiré" });
    if (promo.usagesMax !== null && promo.usagesActuels >= promo.usagesMax)
      return res.json({ valid: false, message: "Code promo épuisé" });
    if (promo.boutiqueId && promo.boutiqueId !== parseInt(boutiqueId))
      return res.json({ valid: false, message: "Code promo non applicable à cette boutique" });
    if (promo.minCommande && parseFloat(montantCommande) < parseFloat(promo.minCommande))
      return res.json({ valid: false, message: `Commande minimum : ${parseFloat(promo.minCommande).toLocaleString("fr-FR")} FCFA` });
    let remise = 0;
    if (promo.type === "remise_pct") remise = (parseFloat(montantCommande) * parseFloat(promo.valeur)) / 100;
    else if (promo.type === "remise_fixe") remise = parseFloat(promo.valeur);
    res.json({ valid: true, promo, remise });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/promotions", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const data = req.body;
    const [promo] = await db.insert(promotionsTable).values({
      grossisteId,
      code: (data.code || "").toUpperCase(),
      titre: data.titre,
      description: data.description,
      type: data.type || "remise_pct",
      valeur: data.valeur,
      minCommande: data.minCommande || "0",
      usagesMax: data.usagesMax || null,
      boutiqueId: data.boutiqueId || null,
      actif: true,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : new Date(),
      dateFin: data.dateFin ? new Date(data.dateFin) : null,
    }).returning();
    res.status(201).json(promo);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/promotions/:id", async (req, res) => {
  try {
    const data = req.body;
    const updates: Record<string, unknown> = {};
    if (data.actif !== undefined) updates.actif = data.actif;
    if (data.dateFin) updates.dateFin = new Date(data.dateFin);
    if (data.usagesMax !== undefined) updates.usagesMax = data.usagesMax;
    if (data.titre) updates.titre = data.titre;
    if (data.valeur !== undefined) updates.valeur = data.valeur;
    const [promo] = await db.update(promotionsTable)
      .set(updates as any)
      .where(eq(promotionsTable.id, parseInt(req.params.id)))
      .returning();
    res.json(promo);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/promotions/:id", async (req, res) => {
  try {
    await db.delete(promotionsTable).where(eq(promotionsTable.id, parseInt(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
