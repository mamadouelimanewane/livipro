import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { facturesTable, commandesTable, commandeItemsTable } from "@workspace/db/schema";
import { boutiquesTable, livraisonsTable, tourneesTable } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

function genNumero(grossisteId: number): string {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FAC-${grossisteId}-${yr}${mo}-${rand}`;
}

router.get("/factures", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const factures = await db.select({
      id: facturesTable.id,
      numero: facturesTable.numero,
      periode: facturesTable.periode,
      montantHT: facturesTable.montantHT,
      tva: facturesTable.tva,
      montantTTC: facturesTable.montantTTC,
      statut: facturesTable.statut,
      echeance: facturesTable.echeance,
      createdAt: facturesTable.createdAt,
      payeeLe: facturesTable.payeeLe,
      boutique: { nom: boutiquesTable.nom, id: boutiquesTable.id },
    })
      .from(facturesTable)
      .leftJoin(boutiquesTable, eq(facturesTable.boutiqueId, boutiquesTable.id))
      .where(eq(facturesTable.grossisteId, grossisteId))
      .orderBy(desc(facturesTable.createdAt));
    res.json(factures);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/factures/generer", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { boutiqueId, periode } = req.body;
    const [annee, mois] = (periode || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`).split("-");
    const commandes = await db.select().from(commandesTable)
      .where(and(
        eq(commandesTable.grossisteId, grossisteId),
        boutiqueId ? eq(commandesTable.boutiqueId, parseInt(boutiqueId)) : sql`true`,
        sql`EXTRACT(YEAR FROM ${commandesTable.createdAt}) = ${annee} AND EXTRACT(MONTH FROM ${commandesTable.createdAt}) = ${mois}`,
      ));
    const montantHT = commandes.reduce((s, c) => s + parseFloat(c.montantTotal || "0"), 0);
    const tva = montantHT * 0.18;
    const montantTTC = montantHT + tva;
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30);
    const [facture] = await db.insert(facturesTable).values({
      grossisteId,
      boutiqueId: boutiqueId ? parseInt(boutiqueId) : null,
      numero: genNumero(grossisteId),
      periode: `${annee}-${mois}`,
      montantHT: montantHT.toFixed(2),
      tva: tva.toFixed(2),
      montantTTC: montantTTC.toFixed(2),
      statut: "en_attente",
      echeance,
      commandeIds: JSON.stringify(commandes.map(c => c.id)),
    }).returning();
    res.status(201).json(facture);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/factures/:id/statut", async (req, res) => {
  try {
    const { statut } = req.body;
    const updates: Record<string, unknown> = { statut };
    if (statut === "payee") updates.payeeLe = new Date();
    const [facture] = await db.update(facturesTable)
      .set(updates as any)
      .where(eq(facturesTable.id, parseInt(req.params.id)))
      .returning();
    res.json(facture);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/factures/stats", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const factures = await db.select().from(facturesTable).where(eq(facturesTable.grossisteId, grossisteId));
    const total = factures.reduce((s, f) => s + parseFloat(f.montantTTC || "0"), 0);
    const payees = factures.filter(f => f.statut === "payee").reduce((s, f) => s + parseFloat(f.montantTTC || "0"), 0);
    const enAttente = factures.filter(f => f.statut === "en_attente").reduce((s, f) => s + parseFloat(f.montantTTC || "0"), 0);
    const enRetard = factures.filter(f => f.statut === "en_retard").length;
    res.json({ total, payees, enAttente, enRetard, count: factures.length });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
