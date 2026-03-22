import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { commandesTable, commandeItemsTable, walletTransactionsTable, preuvesLivraisonTable, geolocationsTable, messagesTable } from "@workspace/db/schema";
import { boutiquesTable, produitsTable, chauffeursTable, livraisonsTable, tourneesTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { signDocument, bcSignaturePayload, verifyDocument, generateIdempotencyKey } from "../lib/security";
import { requireBoutiqueAuth } from "../middleware/requireAuth";

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

router.post("/commandes", requireBoutiqueAuth, async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { boutiqueId, items, notes } = req.body;
    if (!boutiqueId || !items?.length) return res.status(400).json({ error: "boutiqueId et items requis" });

    // Vérification que la boutique autentifiée correspond à la boutique dans la requête
    if (req.boutiqueAuth && req.boutiqueAuth.boutiqueId !== parseInt(boutiqueId)) {
      return res.status(403).json({ error: "Vous ne pouvez passer des commandes que pour votre propre boutique", code: "FORBIDDEN" });
    }

    const [boutique] = await db.select({ id: boutiquesTable.id, statut: boutiquesTable.statut, limiteCredit: boutiquesTable.limiteCredit, soldeCredit: boutiquesTable.soldeCredit })
      .from(boutiquesTable).where(eq(boutiquesTable.id, parseInt(boutiqueId))).limit(1);
    if (!boutique) return res.status(404).json({ error: "Boutique introuvable" });
    if (boutique.statut === "suspendu") return res.status(403).json({ error: "Boutique suspendue", code: "BOUTIQUE_SUSPENDED" });

    let montantTotal = 0;
    const itemsResolved = await Promise.all(items.map(async (it: { produitId: number; quantite: number }) => {
      const [prod] = await db.select().from(produitsTable).where(eq(produitsTable.id, it.produitId)).limit(1);
      if (!prod) throw new Error(`Produit ${it.produitId} introuvable`);
      const montant = parseFloat(prod.prixUnitaire) * it.quantite;
      montantTotal += montant;
      return { produitId: it.produitId, quantite: it.quantite, prixUnitaire: prod.prixUnitaire };
    }));

    const [commande] = await db.insert(commandesTable).values({
      grossisteId, boutiqueId: parseInt(boutiqueId), montantTotal: String(montantTotal), notes: notes ?? null, statut: "en_attente",
    }).returning();

    await db.insert(commandeItemsTable).values(itemsResolved.map(it => ({ commandeId: commande.id, ...it })));

    // Générer la signature HMAC du bon de commande
    const signature = signDocument(bcSignaturePayload(commande as any));
    const [signed] = await db.update(commandesTable)
      .set({ signature })
      .where(eq(commandesTable.id, commande.id))
      .returning();

    res.json({ ...signed, numeroBc: `BC-${String(signed.id).padStart(5, "0")}`, signature });
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

router.post("/wallet/:actorType/:actorId", requireBoutiqueAuth, async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { actorType, actorId } = req.params;
    const { type, montant, description, reference, methodePaiement, idempotencyKey } = req.body;

    // Vérification d'autorisation — le boutiquier ne peut opérer que sur son propre wallet
    if (req.boutiqueAuth && actorType === "boutique" && req.boutiqueAuth.boutiqueId !== parseInt(actorId)) {
      return res.status(403).json({ error: "Accès non autorisé à ce wallet", code: "FORBIDDEN" });
    }

    if (!montant || !description || !type) {
      return res.status(400).json({ error: "montant, description et type requis" });
    }
    if (parseFloat(String(montant)) <= 0) {
      return res.status(400).json({ error: "Le montant doit être positif" });
    }

    // Clé d'idempotence — auto-générée si non fournie par le client
    const iKey = idempotencyKey || generateIdempotencyKey(actorType, parseInt(actorId), String(montant), description);

    // Vérification idempotence — si la clé existe déjà, retourner la transaction existante
    const [existing] = await db.select().from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.idempotencyKey, iKey)).limit(1);
    if (existing) {
      return res.json({ ...existing, idempotent: true, message: "Transaction déjà enregistrée" });
    }

    const [tx] = await db.insert(walletTransactionsTable).values({
      grossisteId, actorType, actorId: parseInt(actorId), type, montant: String(montant),
      description, reference: reference ?? null, methodePaiement: methodePaiement ?? "especes",
      idempotencyKey: iKey,
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

// ─── BON DE COMMANDE DÉTAIL ────────────────────────────────────────────────

router.get("/commandes/:commandeId", async (req, res) => {
  try {
    const [commande] = await db.select().from(commandesTable)
      .where(eq(commandesTable.id, parseInt(req.params.commandeId))).limit(1);
    if (!commande) return res.status(404).json({ error: "Commande introuvable" });

    const [boutique] = await db.select().from(boutiquesTable).where(eq(boutiquesTable.id, commande.boutiqueId)).limit(1);
    const items = await db.select().from(commandeItemsTable).where(eq(commandeItemsTable.commandeId, commande.id));
    const itemsEnriched = await Promise.all(items.map(async (it) => {
      const [prod] = await db.select().from(produitsTable).where(eq(produitsTable.id, it.produitId)).limit(1);
      return { ...it, produit: prod ?? null };
    }));

    res.json({
      ...commande,
      numeroBc: `BC-${String(commande.id).padStart(5, "0")}`,
      boutique: boutique ?? null,
      items: itemsEnriched,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── BONS DE LIVRAISON ─────────────────────────────────────────────────────

router.get("/bons-livraison", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const livraisons = await db.select().from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(sql`${tourneesTable.grossisteId} = ${grossisteId} AND ${livraisonsTable.statut} = 'livree'`)
      .orderBy(desc(livraisonsTable.createdAt));

    const enriched = await Promise.all(livraisons.map(async (row) => {
      const liv = row.livraisons;
      const [boutique] = await db.select().from(boutiquesTable).where(eq(boutiquesTable.id, liv.boutiqueId)).limit(1);
      const preuves = await db.select().from(preuvesLivraisonTable).where(eq(preuvesLivraisonTable.livraisonId, liv.id));
      return {
        ...liv,
        numeroBl: `BL-${String(liv.id).padStart(5, "0")}`,
        boutique: boutique ?? null,
        tournee: row.tournees,
        preuves,
      };
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── RAPPROCHEMENT BC / BL ─────────────────────────────────────────────────

router.get("/rapprochement", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);

    const commandes = await db.select().from(commandesTable)
      .where(eq(commandesTable.grossisteId, grossisteId))
      .orderBy(desc(commandesTable.createdAt));

    const livraisons = await db.select({
      id: livraisonsTable.id,
      boutiqueId: livraisonsTable.boutiqueId,
      montant: livraisonsTable.montantTotal,
      statut: livraisonsTable.statut,
      methodePaiement: livraisonsTable.methodePaiement,
      createdAt: livraisonsTable.createdAt,
      tourneeId: livraisonsTable.tourneeId,
    })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(eq(tourneesTable.grossisteId, grossisteId));

    const boutiquesRows = await db.select({ id: boutiquesTable.id, nom: boutiquesTable.nom })
      .from(boutiquesTable).where(eq(boutiquesTable.grossisteId, grossisteId));
    const boutiquesMap = Object.fromEntries(boutiquesRows.map(b => [b.id, b.nom]));

    const livByBoutique: Record<number, typeof livraisons> = {};
    for (const l of livraisons) {
      if (!livByBoutique[l.boutiqueId]) livByBoutique[l.boutiqueId] = [];
      livByBoutique[l.boutiqueId].push(l);
    }

    const rows = await Promise.all(commandes.map(async (bc) => {
      const items = await db.select({ count: sql<number>`count(*)` })
        .from(commandeItemsTable).where(eq(commandeItemsTable.commandeId, bc.id));
      const nbItems = Number(items[0]?.count ?? 0);

      const livsBoutique = livByBoutique[bc.boutiqueId] ?? [];
      const bcDate = new Date(bc.createdAt).getTime();
      const matched = livsBoutique
        .filter(l => Math.abs(new Date(l.createdAt).getTime() - bcDate) < 7 * 24 * 60 * 60 * 1000)
        .sort((a, b) => Math.abs(new Date(a.createdAt).getTime() - bcDate) - Math.abs(new Date(b.createdAt).getTime() - bcDate))[0];

      const montantBc = parseFloat(bc.montantTotal as string) || 0;
      const montantBl = matched ? parseFloat(matched.montant as string) || 0 : 0;
      const ecart = matched ? montantBl - montantBc : 0;

      let statut: string;
      if (bc.statut === "annulee") statut = "annulee";
      else if (!matched && bc.statut === "livree") statut = "non_rapproche";
      else if (matched && bc.statut === "livree" && Math.abs(ecart) < 100) statut = "rapproche";
      else if (matched && bc.statut === "livree" && Math.abs(ecart) >= 100) statut = "ecart";
      else statut = "en_cours";

      return {
        numeroBc: `BC-${String(bc.id).padStart(5, "0")}`,
        commandeId: bc.id,
        boutiqueId: bc.boutiqueId,
        boutiqueNom: boutiquesMap[bc.boutiqueId] ?? "Boutique #" + bc.boutiqueId,
        dateBc: bc.createdAt,
        statutCommande: bc.statut,
        montantBc,
        nbItems,
        numeroBl: matched ? `BL-${String(matched.id).padStart(5, "0")}` : null,
        livraisonId: matched?.id ?? null,
        dateBl: matched?.createdAt ?? null,
        montantBl,
        methodePaiement: matched?.methodePaiement ?? null,
        ecart,
        statut,
      };
    }));

    const totaux = {
      totalBc: rows.length,
      totalBl: rows.filter(r => r.numeroBl).length,
      rapproches: rows.filter(r => r.statut === "rapproche").length,
      ecarts: rows.filter(r => r.statut === "ecart").length,
      nonRapproches: rows.filter(r => r.statut === "non_rapproche").length,
      enCours: rows.filter(r => r.statut === "en_cours").length,
      montantTotalBc: rows.reduce((s, r) => s + r.montantBc, 0),
      montantTotalBl: rows.reduce((s, r) => s + r.montantBl, 0),
    };

    res.json({ rows, totaux });
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
