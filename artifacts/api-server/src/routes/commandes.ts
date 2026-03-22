import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { commandesTable, commandeItemsTable, walletTransactionsTable, preuvesLivraisonTable, geolocationsTable, messagesTable } from "@workspace/db/schema";
import { boutiquesTable, produitsTable, chauffeursTable, livraisonsTable, tourneesTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

// ─── COMMANDES ──────────────────────────────────────────────────────────────

router.get("/commandes", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const commandes = await db.select().from(commandesTable)
      .where(eq(commandesTable.grossisteId, grossisteId))
      .orderBy(desc(commandesTable.createdAt));

    const enriched = await Promise.all(commandes.map(async (c) => {
      const boutique = await db.select({ nom: boutiquesTable.nom, proprietaire: boutiquesTable.proprietaire })
        .from(boutiquesTable).where(eq(boutiquesTable.id, c.boutiqueId)).limit(1);
      const items = await db.select().from(commandeItemsTable).where(eq(commandeItemsTable.commandeId, c.id));
      const itemsEnriched = await Promise.all(items.map(async (it) => {
        const prod = await db.select({ nom: produitsTable.nom, unite: produitsTable.unite })
          .from(produitsTable).where(eq(produitsTable.id, it.produitId)).limit(1);
        return { ...it, produit: prod[0] ?? null };
      }));
      return { ...c, boutique: boutique[0] ?? null, items: itemsEnriched };
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/commandes", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { boutiqueId, items, notes } = req.body;
    if (!boutiqueId || !items?.length) return res.status(400).json({ error: "boutiqueId et items requis" });

    let montantTotal = 0;
    const itemsResolved = await Promise.all(items.map(async (it: { produitId: number; quantite: number }) => {
      const [prod] = await db.select().from(produitsTable).where(eq(produitsTable.id, it.produitId)).limit(1);
      if (!prod) throw new Error(`Produit ${it.produitId} introuvable`);
      const montant = parseFloat(prod.prixUnitaire) * it.quantite;
      montantTotal += montant;
      return { produitId: it.produitId, quantite: it.quantite, prixUnitaire: prod.prixUnitaire };
    }));

    const [commande] = await db.insert(commandesTable).values({
      grossisteId, boutiqueId, montantTotal: String(montantTotal), notes: notes ?? null, statut: "en_attente",
    }).returning();

    await db.insert(commandeItemsTable).values(itemsResolved.map(it => ({ commandeId: commande.id, ...it })));

    res.json(commande);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.patch("/commandes/:commandeId/statut", async (req, res) => {
  try {
    const { statut } = req.body;
    const [updated] = await db.update(commandesTable)
      .set({ statut })
      .where(eq(commandesTable.id, parseInt(req.params.commandeId)))
      .returning();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── WALLET ────────────────────────────────────────────────────────────────

router.get("/wallet/:actorType/:actorId", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { actorType, actorId } = req.params;
    const transactions = await db.select().from(walletTransactionsTable)
      .where(and(
        eq(walletTransactionsTable.grossisteId, grossisteId),
        eq(walletTransactionsTable.actorType, actorType),
        eq(walletTransactionsTable.actorId, parseInt(actorId))
      ))
      .orderBy(desc(walletTransactionsTable.createdAt))
      .limit(50);

    const solde = transactions.reduce((acc, t) => {
      return t.type === "credit" ? acc + parseFloat(t.montant) : acc - parseFloat(t.montant);
    }, 0);

    res.json({ solde, transactions });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/wallet/:actorType/:actorId", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { actorType, actorId } = req.params;
    const { type, montant, description, reference, methodePaiement } = req.body;
    const [tx] = await db.insert(walletTransactionsTable).values({
      grossisteId, actorType, actorId: parseInt(actorId), type, montant: String(montant),
      description, reference: reference ?? null, methodePaiement: methodePaiement ?? "especes",
    }).returning();
    res.json(tx);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── MESSAGES / CHAT ───────────────────────────────────────────────────────

router.get("/messages", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { tourneeId, fromType, fromId, toType, toId } = req.query;
    let query = db.select().from(messagesTable).where(eq(messagesTable.grossisteId, grossisteId));
    const msgs = await db.select().from(messagesTable)
      .where(eq(messagesTable.grossisteId, grossisteId))
      .orderBy(desc(messagesTable.createdAt))
      .limit(100);
    res.json(msgs.reverse());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { tourneeId, livraisonId, expediteurType, expediteurId, destinataireType, destinataireId, contenu } = req.body;
    const [msg] = await db.insert(messagesTable).values({
      grossisteId, tourneeId: tourneeId ?? null, livraisonId: livraisonId ?? null,
      expediteurType, expediteurId, destinataireType, destinataireId, contenu, lu: false,
    }).returning();
    res.json(msg);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── GÉOLOCALISATION ───────────────────────────────────────────────────────

router.get("/geo", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const latest = await db.execute(sql`
      SELECT DISTINCT ON (chauffeur_id) g.*, c.nom, c.prenom, c.statut as chauffeur_statut
      FROM geolocations g
      JOIN chauffeurs c ON c.id = g.chauffeur_id
      WHERE g.grossiste_id = ${grossisteId}
      ORDER BY chauffeur_id, g.created_at DESC
    `);
    res.json(latest.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/geo", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { chauffeurId, tourneeId, lat, lng } = req.body;
    const [geo] = await db.insert(geolocationsTable).values({
      grossisteId, chauffeurId, tourneeId: tourneeId ?? null, lat: String(lat), lng: String(lng),
    }).returning();
    res.json(geo);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── PREUVES DE LIVRAISON ──────────────────────────────────────────────────

router.get("/livraisons/:livraisonId/preuves", async (req, res) => {
  try {
    const preuves = await db.select().from(preuvesLivraisonTable)
      .where(eq(preuvesLivraisonTable.livraisonId, parseInt(req.params.livraisonId)));
    res.json(preuves);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/livraisons/:livraisonId/preuves", async (req, res) => {
  try {
    const { type, dataUrl, commentaire } = req.body;
    const [preuve] = await db.insert(preuvesLivraisonTable).values({
      livraisonId: parseInt(req.params.livraisonId), type, dataUrl, commentaire: commentaire ?? null,
    }).returning();
    res.json(preuve);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── BOUTIQUES — commandes ─────────────────────────────────────────────────

router.get("/boutiques/:boutiqueId/commandes", async (req, res) => {
  try {
    const boutiqueId = parseInt(req.params.boutiqueId);
    const commandes = await db.select().from(commandesTable)
      .where(eq(commandesTable.boutiqueId, boutiqueId))
      .orderBy(desc(commandesTable.createdAt));

    const enriched = await Promise.all(commandes.map(async (c) => {
      const items = await db.select().from(commandeItemsTable).where(eq(commandeItemsTable.commandeId, c.id));
      const itemsEnriched = await Promise.all(items.map(async (it) => {
        const [prod] = await db.select({ nom: produitsTable.nom, unite: produitsTable.unite })
          .from(produitsTable).where(eq(produitsTable.id, it.produitId)).limit(1);
        return { ...it, produit: prod ?? null };
      }));
      return { ...c, items: itemsEnriched };
    }));
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
