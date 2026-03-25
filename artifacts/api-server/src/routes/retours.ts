import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { retoursTable, notificationsTable } from "@workspace/db/schema";
import { boutiquesTable, chauffeursTable, livraisonsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router({ mergeParams: true });

router.get("/retours", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const retours = await db.select({
      id: retoursTable.id,
      raison: retoursTable.raison,
      description: retoursTable.description,
      statut: retoursTable.statut,
      quantite: retoursTable.quantite,
      montantRembourse: retoursTable.montantRembourse,
      photoUrl: retoursTable.photoUrl,
      createdAt: retoursTable.createdAt,
      traiteLe: retoursTable.traiteLe,
      boutique: { nom: boutiquesTable.nom, id: boutiquesTable.id },
      chauffeur: { nom: chauffeursTable.nom, prenom: chauffeursTable.prenom },
    })
      .from(retoursTable)
      .leftJoin(boutiquesTable, eq(retoursTable.boutiqueId, boutiquesTable.id))
      .leftJoin(chauffeursTable, eq(retoursTable.chauffeurId, chauffeursTable.id))
      .where(eq(retoursTable.grossisteId, grossisteId))
      .orderBy(desc(retoursTable.createdAt));
    res.json(retours);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/retours", async (req, res) => {
  try {
    const grossisteId = parseInt(req.params.grossisteId);
    const { boutiqueId, livraisonId, chauffeurId, produitId, quantite, raison, description, photoUrl } = req.body;
    const [retour] = await db.insert(retoursTable).values({
      grossisteId,
      boutiqueId: parseInt(boutiqueId),
      livraisonId: livraisonId ? parseInt(livraisonId) : null,
      chauffeurId: chauffeurId ? parseInt(chauffeurId) : null,
      produitId: produitId ? parseInt(produitId) : null,
      quantite: parseInt(quantite) || 1,
      raison,
      description,
      photoUrl,
    }).returning();
    await db.insert(notificationsTable).values({
      grossisteId,
      destinataireType: "grossiste",
      titre: "Nouveau retour marchandise",
      message: `Retour déclaré : ${raison}. Quantité: ${quantite}`,
      type: "warning",
      lienType: "retour",
      lienId: retour.id,
    });
    res.status(201).json(retour);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/retours/:id/statut", async (req, res) => {
  try {
    const { statut, montantRembourse } = req.body;
    const [retour] = await db.update(retoursTable)
      .set({
        statut,
        montantRembourse: montantRembourse || "0",
        traiteLe: new Date(),
      })
      .where(eq(retoursTable.id, parseInt(req.params.id)))
      .returning();
    res.json(retour);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
