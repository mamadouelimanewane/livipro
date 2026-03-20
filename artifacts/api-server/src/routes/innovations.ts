import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  grossistesTable,
  chauffeursTable,
  boutiquesTable,
  tourneesTable,
  livraisonsTable,
  ratingsTable,
  whatsappOrdersTable,
} from "@workspace/db/schema";
import { eq, count, sql, and, desc } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

// ─── CREDIT SCORES ──────────────────────────────────────────────────────────
router.get("/credit-scores", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const boutiques = await db
      .select()
      .from(boutiquesTable)
      .where(eq(boutiquesTable.grossisteId, grossisteId));

    const scores = await Promise.all(
      boutiques.map(async (b) => {
        const livraisons = await db
          .select({
            statut: livraisonsTable.statut,
            montant: livraisonsTable.montantTotal,
            methode: livraisonsTable.methodePaiement,
            createdAt: livraisonsTable.createdAt,
          })
          .from(livraisonsTable)
          .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
          .where(eq(livraisonsTable.boutiqueId, b.id))
          .orderBy(desc(livraisonsTable.createdAt));

        const total = livraisons.length;
        const livrees = livraisons.filter((l) => l.statut === "livree").length;
        const litiges = livraisons.filter((l) => l.statut === "litige").length;
        const echecs = livraisons.filter((l) => l.statut === "echec").length;
        const caTotal = livraisons.reduce((s, l) => s + Number(l.montant), 0);
        const caRecent = livraisons.slice(0, 5).reduce((s, l) => s + Number(l.montant), 0);
        const caOld = livraisons.slice(5).reduce((s, l) => s + Number(l.montant), 0);
        const growth = caOld > 0 ? ((caRecent - caOld / Math.max(1, livraisons.length - 5) * 5) / (caOld / Math.max(1, livraisons.length - 5) * 5)) * 100 : 0;
        const tauxReussite = total > 0 ? (livrees / total) * 100 : 0;
        const tauxLitige = total > 0 ? (litiges / total) * 100 : 0;
        const digitalPay = total > 0 ? livraisons.filter((l) => l.methode === "mobile_money").length / total : 0;

        let score = 50;
        score += tauxReussite * 0.3;
        score -= tauxLitige * 2;
        score -= (echecs / Math.max(1, total)) * 20;
        score += Math.min(15, caTotal / 500000);
        score += Math.min(10, growth * 0.2);
        score += digitalPay * 10;
        score = Math.min(100, Math.max(0, Math.round(score)));

        let risque: "faible" | "modere" | "eleve" | "critique";
        if (score >= 75) risque = "faible";
        else if (score >= 55) risque = "modere";
        else if (score >= 35) risque = "eleve";
        else risque = "critique";

        const limiteRecommandee = Math.round((score / 100) * 1500000 / 50000) * 50000;

        return {
          boutiqueId: b.id,
          boutiqueNom: b.nom,
          proprietaire: b.proprietaire,
          adresse: b.adresse,
          score,
          risque,
          limiteActuelle: Number(b.limiteCredit),
          limiteRecommandee,
          soldeCredit: Number(b.soldeCredit),
          caTotal: Math.round(caTotal),
          totalLivraisons: total,
          tauxReussite: Math.round(tauxReussite),
          tauxLitige: Math.round(tauxLitige * 10) / 10,
          croissanceCA: Math.round(growth),
          derniereLivraison: livraisons[0]?.createdAt?.toISOString() ?? null,
        };
      })
    );

    scores.sort((a, b) => a.score - b.score);
    res.json(scores);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── CASHFLOW PREVISION ──────────────────────────────────────────────────────
router.get("/cashflow-prevision", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);

    const livraisons = await db
      .select({
        montant: livraisonsTable.montantTotal,
        statut: livraisonsTable.statut,
        methode: livraisonsTable.methodePaiement,
        createdAt: livraisonsTable.createdAt,
        boutiqueId: livraisonsTable.boutiqueId,
      })
      .from(livraisonsTable)
      .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
      .where(
        sql`${tourneesTable.grossisteId} = ${grossisteId} AND ${livraisonsTable.createdAt} >= NOW() - INTERVAL '42 days'`
      )
      .orderBy(livraisonsTable.createdAt);

    const weeklyData: Record<number, { encaisse: number; credit: number; count: number }> = {};
    livraisons.forEach((l) => {
      const weekAgo = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / (7 * 24 * 3600 * 1000));
      const week = 5 - weekAgo;
      if (week < 0 || week > 5) return;
      if (!weeklyData[week]) weeklyData[week] = { encaisse: 0, credit: 0, count: 0 };
      const montant = Number(l.montant);
      if (l.methode === "credit") weeklyData[week].credit += montant;
      else weeklyData[week].encaisse += montant;
      weeklyData[week].count++;
    });

    const semaines = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (5 - i) * 7);
      const label = `S${i + 1}`;
      const data = weeklyData[i] ?? { encaisse: 0, credit: 0, count: 0 };
      return { semaine: label, encaisse: Math.round(data.encaisse), credit: Math.round(data.credit), total: Math.round(data.encaisse + data.credit), livraisons: data.count, date: d.toISOString().split("T")[0] };
    });

    const avgEncaisse = semaines.slice(0, 5).reduce((s, w) => s + w.encaisse, 0) / 5;
    const avgCredit = semaines.slice(0, 5).reduce((s, w) => s + w.credit, 0) / 5;
    const prevision = {
      semaine: "Prév.",
      encaisse: Math.round(avgEncaisse * 1.05),
      credit: Math.round(avgCredit * 0.9),
      total: Math.round(avgEncaisse * 1.05 + avgCredit * 0.9),
      livraisons: Math.round(semaines.slice(0, 5).reduce((s, w) => s + w.livraisons, 0) / 5),
      isPrevision: true,
      date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; })(),
    };

    const boutiquesCredit = await db
      .select({ id: boutiquesTable.id, nom: boutiquesTable.nom, solde: boutiquesTable.soldeCredit, proprietaire: boutiquesTable.proprietaire })
      .from(boutiquesTable)
      .where(and(eq(boutiquesTable.grossisteId, grossisteId), sql`${boutiquesTable.soldeCredit} > 0`));

    res.json({
      semaines: [...semaines, prevision],
      encaissTotal: semaines.reduce((s, w) => s + w.encaisse, 0),
      creditEnCours: boutiquesCredit.reduce((s, b) => s + Number(b.solde), 0),
      boutiquesEnCredit: boutiquesCredit.map((b) => ({ id: b.id, nom: b.nom, solde: Number(b.solde), proprietaire: b.proprietaire })),
      previsionSemaine: prevision.total,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── DEMAND FORECAST ────────────────────────────────────────────────────────
router.get("/demand-forecast", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const boutiques = await db
      .select()
      .from(boutiquesTable)
      .where(eq(boutiquesTable.grossisteId, grossisteId));

    const forecasts = await Promise.all(
      boutiques.map(async (b) => {
        const livraisons = await db
          .select({ montant: livraisonsTable.montantTotal, createdAt: livraisonsTable.createdAt, statut: livraisonsTable.statut })
          .from(livraisonsTable)
          .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
          .where(and(eq(livraisonsTable.boutiqueId, b.id), sql`${livraisonsTable.createdAt} >= NOW() - INTERVAL '56 days'`))
          .orderBy(livraisonsTable.createdAt);

        const livraisonsLivrees = livraisons.filter((l) => l.statut === "livree");
        if (livraisonsLivrees.length < 2) {
          return { boutiqueId: b.id, boutiqueNom: b.nom, adresse: b.adresse, previsionMontant: 0, previsionDate: null, tendance: 0, confiance: "faible" as const, commandesRecentes: 0 };
        }

        const firstHalf = livraisonsLivrees.slice(0, Math.floor(livraisonsLivrees.length / 2));
        const secondHalf = livraisonsLivrees.slice(Math.floor(livraisonsLivrees.length / 2));
        const avgFirst = firstHalf.reduce((s, l) => s + Number(l.montant), 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((s, l) => s + Number(l.montant), 0) / secondHalf.length;
        const tendance = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
        const previsionMontant = Math.round(avgSecond * (1 + tendance / 100 * 0.3));

        const daysBetween = livraisonsLivrees.length > 1
          ? (new Date(livraisonsLivrees[livraisonsLivrees.length - 1].createdAt).getTime() - new Date(livraisonsLivrees[0].createdAt).getTime()) / (livraisonsLivrees.length - 1) / (24 * 3600 * 1000)
          : 7;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + Math.round(daysBetween));

        const confiance = livraisonsLivrees.length >= 8 ? "elevee" : livraisonsLivrees.length >= 4 ? "moyenne" : "faible";

        return {
          boutiqueId: b.id,
          boutiqueNom: b.nom,
          adresse: b.adresse,
          previsionMontant,
          previsionDate: nextDate.toISOString().split("T")[0],
          tendance: Math.round(tendance),
          confiance,
          commandesRecentes: livraisonsLivrees.length,
          montantMoyenRecent: Math.round(avgSecond),
        };
      })
    );

    const active = forecasts.filter((f) => f.previsionMontant > 0).sort((a, b) => b.previsionMontant - a.previsionMontant);
    res.json(active);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── FRAUD ALERTS ────────────────────────────────────────────────────────────
router.get("/fraud-alerts", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const chauffeurs = await db.select().from(chauffeursTable).where(eq(chauffeursTable.grossisteId, grossisteId));
    const alerts: any[] = [];

    for (const ch of chauffeurs) {
      const livraisons = await db
        .select({ statut: livraisonsTable.statut, montant: livraisonsTable.montantTotal, methode: livraisonsTable.methodePaiement, createdAt: livraisonsTable.createdAt })
        .from(livraisonsTable)
        .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
        .where(and(eq(tourneesTable.chauffeurId, ch.id), sql`${livraisonsTable.createdAt} >= NOW() - INTERVAL '30 days'`));

      const total = livraisons.length;
      if (total < 3) continue;
      const litiges = livraisons.filter((l) => l.statut === "litige").length;
      const echecs = livraisons.filter((l) => l.statut === "echec").length;
      const tauxLitige = (litiges / total) * 100;
      const tauxEchec = (echecs / total) * 100;

      const montants = livraisons.map((l) => Number(l.montant));
      const montantsRondes = montants.filter((m) => m > 0 && m % 5000 === 0).length;
      const tauxRonds = (montantsRondes / montants.filter((m) => m > 0).length) * 100;

      if (tauxLitige > 25) {
        alerts.push({
          id: `litige-${ch.id}`,
          chauffeurId: ch.id,
          chauffeurNom: `${ch.prenom} ${ch.nom}`,
          type: "litige_eleve",
          severite: tauxLitige > 40 ? "critique" : "eleve",
          description: `Taux de litige anormalement élevé : ${Math.round(tauxLitige)}% (${litiges}/${total} livraisons)`,
          valeur: tauxLitige,
          seuil: 25,
          date: new Date().toISOString(),
        });
      }
      if (tauxEchec > 30) {
        alerts.push({
          id: `echec-${ch.id}`,
          chauffeurId: ch.id,
          chauffeurNom: `${ch.prenom} ${ch.nom}`,
          type: "echec_eleve",
          severite: "modere",
          description: `Taux d'échec élevé : ${Math.round(tauxEchec)}% (${echecs}/${total} livraisons)`,
          valeur: tauxEchec,
          seuil: 30,
          date: new Date().toISOString(),
        });
      }
      if (tauxRonds > 80 && total >= 5) {
        alerts.push({
          id: `ronds-${ch.id}`,
          chauffeurId: ch.id,
          chauffeurNom: `${ch.prenom} ${ch.nom}`,
          type: "montants_suspects",
          severite: "modere",
          description: `${Math.round(tauxRonds)}% des montants sont des multiples de 5 000 FCFA — saisie manuelle suspecte`,
          valeur: tauxRonds,
          seuil: 80,
          date: new Date().toISOString(),
        });
      }
    }

    res.json({ alertes: alerts, totalAlertes: alerts.length, critique: alerts.filter((a) => a.severite === "critique").length, eleve: alerts.filter((a) => a.severite === "eleve").length, modere: alerts.filter((a) => a.severite === "modere").length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── FIDELITE ────────────────────────────────────────────────────────────────
router.get("/fidelite", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const boutiques = await db.select().from(boutiquesTable).where(eq(boutiquesTable.grossisteId, grossisteId));

    const fidelite = await Promise.all(
      boutiques.map(async (b) => {
        const livraisons = await db
          .select({ statut: livraisonsTable.statut, montant: livraisonsTable.montantTotal, methode: livraisonsTable.methodePaiement })
          .from(livraisonsTable)
          .leftJoin(tourneesTable, eq(livraisonsTable.tourneeId, tourneesTable.id))
          .where(eq(livraisonsTable.boutiqueId, b.id));

        const livrees = livraisons.filter((l) => l.statut === "livree");
        const caTotal = livrees.reduce((s, l) => s + Number(l.montant), 0);
        const paiementDigital = livraisons.filter((l) => l.methode === "mobile_money").length;
        const sansLitige = livraisons.filter((l) => l.statut !== "litige").length;

        const points = Math.floor(
          livrees.length * 10 +
          caTotal / 10000 +
          paiementDigital * 5 +
          (livraisons.length > 0 ? (sansLitige / livraisons.length) * 50 : 0)
        );

        let niveau: "Bronze" | "Argent" | "Or" | "Platine";
        if (points >= 1000) niveau = "Platine";
        else if (points >= 400) niveau = "Or";
        else if (points >= 150) niveau = "Argent";
        else niveau = "Bronze";

        const prochainNiveau = niveau === "Platine" ? null : niveau === "Or" ? 1000 : niveau === "Argent" ? 400 : 150;
        const remisePct = niveau === "Platine" ? 5 : niveau === "Or" ? 3 : niveau === "Argent" ? 1.5 : 0;

        return {
          boutiqueId: b.id,
          boutiqueNom: b.nom,
          proprietaire: b.proprietaire,
          points,
          niveau,
          prochainNiveau,
          remisePct,
          totalLivraisons: livraisons.length,
          caTotal: Math.round(caTotal),
        };
      })
    );

    fidelite.sort((a, b) => b.points - a.points);
    res.json(fidelite);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── RATINGS ─────────────────────────────────────────────────────────────────
router.get("/ratings", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const ratings = await db
      .select({
        id: ratingsTable.id,
        chauffeurId: ratingsTable.chauffeurId,
        boutiqueId: ratingsTable.boutiqueId,
        tourneeId: ratingsTable.tourneeId,
        type: ratingsTable.type,
        score: ratingsTable.score,
        commentaire: ratingsTable.commentaire,
        createdAt: ratingsTable.createdAt,
        chauffeurNom: sql<string>`CONCAT(${chauffeursTable.prenom}, ' ', ${chauffeursTable.nom})`,
        boutiqueNom: boutiquesTable.nom,
      })
      .from(ratingsTable)
      .leftJoin(chauffeursTable, eq(ratingsTable.chauffeurId, chauffeursTable.id))
      .leftJoin(boutiquesTable, eq(ratingsTable.boutiqueId, boutiquesTable.id))
      .where(eq(ratingsTable.grossisteId, grossisteId))
      .orderBy(desc(ratingsTable.createdAt))
      .limit(50);

    const chauffeurScores = await db
      .select({
        chauffeurId: ratingsTable.chauffeurId,
        chauffeurNom: sql<string>`CONCAT(${chauffeursTable.prenom}, ' ', ${chauffeursTable.nom})`,
        avgScore: sql<number>`AVG(${ratingsTable.score})`,
        count: count(),
      })
      .from(ratingsTable)
      .leftJoin(chauffeursTable, eq(ratingsTable.chauffeurId, chauffeursTable.id))
      .where(and(eq(ratingsTable.grossisteId, grossisteId), eq(ratingsTable.type, "chauffeur_by_boutique")))
      .groupBy(ratingsTable.chauffeurId, chauffeursTable.prenom, chauffeursTable.nom);

    const boutiqueScores = await db
      .select({
        boutiqueId: ratingsTable.boutiqueId,
        boutiqueNom: boutiquesTable.nom,
        avgScore: sql<number>`AVG(${ratingsTable.score})`,
        count: count(),
      })
      .from(ratingsTable)
      .leftJoin(boutiquesTable, eq(ratingsTable.boutiqueId, boutiquesTable.id))
      .where(and(eq(ratingsTable.grossisteId, grossisteId), eq(ratingsTable.type, "boutique_by_chauffeur")))
      .groupBy(ratingsTable.boutiqueId, boutiquesTable.nom);

    res.json({
      ratings: ratings.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      chauffeurScores: chauffeurScores.map((c) => ({ ...c, avgScore: Math.round(Number(c.avgScore) * 10) / 10 })),
      boutiqueScores: boutiqueScores.map((b) => ({ ...b, avgScore: Math.round(Number(b.avgScore) * 10) / 10 })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/ratings", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { chauffeurId, boutiqueId, tourneeId, type, score, commentaire } = req.body;
    const [rating] = await db
      .insert(ratingsTable)
      .values({ grossisteId, chauffeurId, boutiqueId, tourneeId, type, score, commentaire })
      .returning();
    res.status(201).json(rating);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ─── WHATSAPP ORDERS ─────────────────────────────────────────────────────────
router.get("/whatsapp-orders", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const orders = await db
      .select()
      .from(whatsappOrdersTable)
      .where(eq(whatsappOrdersTable.grossisteId, grossisteId))
      .orderBy(desc(whatsappOrdersTable.createdAt));
    res.json(orders.map((o) => ({ ...o, montantEstime: Number(o.montantEstime), produits: JSON.parse(o.produitsJson), createdAt: o.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/whatsapp-orders", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { numerotelephone, nomBoutique, message, produits, montantEstime, statut } = req.body;
    const [order] = await db
      .insert(whatsappOrdersTable)
      .values({ grossisteId, numerotelephone, nomBoutique, message, produitsJson: JSON.stringify(produits ?? []), montantEstime: String(montantEstime ?? 0), statut: statut ?? "recu" })
      .returning();
    res.status(201).json({ ...order, montantEstime: Number(order.montantEstime), produits: JSON.parse(order.produitsJson) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/whatsapp-orders/:orderId/statut", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const orderId = parseInt(req.params.orderId);
    const { statut } = req.body;
    const [order] = await db
      .update(whatsappOrdersTable)
      .set({ statut })
      .where(and(eq(whatsappOrdersTable.id, orderId), eq(whatsappOrdersTable.grossisteId, grossisteId)))
      .returning();
    res.json({ ...order, montantEstime: Number(order.montantEstime) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
