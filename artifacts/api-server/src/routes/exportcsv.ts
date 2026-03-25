import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { commandesTable, walletTransactionsTable, commandeItemsTable } from "@workspace/db/schema";
import { livraisonsTable, tourneesTable, boutiquesTable, chauffeursTable } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(";"),
    ...rows.map(r => headers.map(h => {
      const v = r[h];
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(";") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    }).join(";"))
  ];
  return lines.join("\n");
}

router.get("/export/commandes", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { debut, fin } = req.query;
    const commandes = await db.select({
      id: commandesTable.id,
      statut: commandesTable.statut,
      montantTotal: commandesTable.montantTotal,
      notes: commandesTable.notes,
      createdAt: commandesTable.createdAt,
      boutique: boutiquesTable.nom,
    })
      .from(commandesTable)
      .leftJoin(boutiquesTable, eq(commandesTable.boutiqueId, boutiquesTable.id))
      .where(and(
        eq(commandesTable.grossisteId, grossisteId),
        debut ? sql`DATE(${commandesTable.createdAt}) >= ${debut}` : sql`true`,
        fin ? sql`DATE(${commandesTable.createdAt}) <= ${fin}` : sql`true`,
      ))
      .orderBy(desc(commandesTable.createdAt));
    const rows = commandes.map(c => ({
      ID: c.id,
      Boutique: c.boutique,
      Statut: c.statut,
      "Montant (FCFA)": parseFloat(c.montantTotal || "0").toFixed(0),
      Notes: c.notes || "",
      Date: new Date(c.createdAt).toLocaleDateString("fr-FR"),
    }));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="commandes_${grossisteId}_${new Date().toISOString().split("T")[0]}.csv"`);
    res.send("\uFEFF" + toCSV(rows));
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/export/livraisons", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { debut, fin } = req.query;
    const livraisons = await db.select({
      id: livraisonsTable.id,
      statut: livraisonsTable.statut,
      montantTotal: livraisonsTable.montantTotal,
      methodePaiement: livraisonsTable.methodePaiement,
      dateReception: livraisonsTable.dateReception,
      createdAt: livraisonsTable.createdAt,
      boutique: boutiquesTable.nom,
      chauffeur: chauffeursTable.nom,
    })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .leftJoin(boutiquesTable, eq(livraisonsTable.boutiqueId, boutiquesTable.id))
      .leftJoin(chauffeursTable, eq(tourneesTable.chauffeurId, chauffeursTable.id))
      .where(and(
        eq(tourneesTable.grossisteId, grossisteId),
        debut ? sql`DATE(${livraisonsTable.createdAt}) >= ${debut}` : sql`true`,
        fin ? sql`DATE(${livraisonsTable.createdAt}) <= ${fin}` : sql`true`,
      ))
      .orderBy(desc(livraisonsTable.createdAt));
    const rows = livraisons.map(l => ({
      ID: l.id,
      Boutique: l.boutique,
      Chauffeur: l.chauffeur,
      Statut: l.statut,
      "Montant (FCFA)": parseFloat(l.montantTotal || "0").toFixed(0),
      Paiement: l.methodePaiement || "",
      Date: new Date(l.createdAt).toLocaleDateString("fr-FR"),
    }));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="livraisons_${grossisteId}_${new Date().toISOString().split("T")[0]}.csv"`);
    res.send("\uFEFF" + toCSV(rows));
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/export/transactions", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { debut, fin } = req.query;
    const txs = await db.select().from(walletTransactionsTable)
      .where(and(
        eq(walletTransactionsTable.grossisteId, grossisteId),
        debut ? sql`DATE(${walletTransactionsTable.createdAt}) >= ${debut}` : sql`true`,
        fin ? sql`DATE(${walletTransactionsTable.createdAt}) <= ${fin}` : sql`true`,
      ))
      .orderBy(desc(walletTransactionsTable.createdAt));
    const rows = txs.map(t => ({
      ID: t.id,
      "Type acteur": t.actorType,
      "ID acteur": t.actorId,
      Type: t.type,
      "Montant (FCFA)": parseFloat(t.montant || "0").toFixed(0),
      Description: t.description,
      "Méthode paiement": t.methodePaiement || "",
      Référence: t.reference || "",
      Date: new Date(t.createdAt).toLocaleDateString("fr-FR"),
    }));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="transactions_${grossisteId}_${new Date().toISOString().split("T")[0]}.csv"`);
    res.send("\uFEFF" + toCSV(rows));
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
