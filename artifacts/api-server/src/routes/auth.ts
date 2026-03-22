import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { boutiquesTable, grossistesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  hashPin, pinSalt, verifyPin, signBoutiqueToken, signGrossisteToken,
} from "../lib/security";

const router: IRouter = Router();

// ─── BOUTIQUIER LOGIN ─────────────────────────────────────────────────────────
// POST /api/auth/boutiquier
// Body: { grossisteId, boutiqueId, pin }
// Returns: { token, expiresIn, boutique }

router.post("/boutiquier", async (req, res) => {
  try {
    const { grossisteId, boutiqueId, pin } = req.body;

    if (!grossisteId || !boutiqueId || !pin) {
      return res.status(400).json({ error: "grossisteId, boutiqueId et pin requis" });
    }
    if (typeof pin !== "string" || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: "Le PIN doit être composé de 4 chiffres" });
    }

    const [boutique] = await db.select().from(boutiquesTable)
      .where(and(
        eq(boutiquesTable.id, parseInt(boutiqueId)),
        eq(boutiquesTable.grossisteId, parseInt(grossisteId)),
      )).limit(1);

    if (!boutique) {
      return res.status(404).json({ error: "Boutique introuvable" });
    }
    if (boutique.statut === "suspendu") {
      return res.status(403).json({ error: "Cette boutique est suspendue. Contactez votre distributeur." });
    }

    if (!boutique.pinHash) {
      // Première connexion — enregistrement du PIN
      const pinHash = hashPin(pin, pinSalt(boutique.id));
      await db.update(boutiquesTable)
        .set({ pinHash })
        .where(eq(boutiquesTable.id, boutique.id));

      const token = signBoutiqueToken({ boutiqueId: boutique.id, grossisteId: parseInt(grossisteId) });
      return res.json({
        token,
        expiresIn: "24h",
        firstLogin: true,
        boutique: { id: boutique.id, nom: boutique.nom, proprietaire: boutique.proprietaire },
        message: "PIN enregistré avec succès",
      });
    }

    if (!verifyPin(pin, boutique.id, boutique.pinHash)) {
      return res.status(401).json({ error: "PIN incorrect", code: "WRONG_PIN" });
    }

    const token = signBoutiqueToken({ boutiqueId: boutique.id, grossisteId: parseInt(grossisteId) });
    return res.json({
      token,
      expiresIn: "24h",
      firstLogin: false,
      boutique: { id: boutique.id, nom: boutique.nom, proprietaire: boutique.proprietaire },
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── BOUTIQUIER PIN RESET ─────────────────────────────────────────────────────
// POST /api/auth/boutiquier/reset
// Body: { grossisteId, boutiqueId, oldPin, newPin }

router.post("/boutiquier/reset", async (req, res) => {
  try {
    const { grossisteId, boutiqueId, oldPin, newPin } = req.body;

    const [boutique] = await db.select().from(boutiquesTable)
      .where(and(
        eq(boutiquesTable.id, parseInt(boutiqueId)),
        eq(boutiquesTable.grossisteId, parseInt(grossisteId)),
      )).limit(1);

    if (!boutique) return res.status(404).json({ error: "Boutique introuvable" });

    if (boutique.pinHash && !verifyPin(oldPin, boutique.id, boutique.pinHash)) {
      return res.status(401).json({ error: "Ancien PIN incorrect" });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: "Le nouveau PIN doit être composé de 4 chiffres" });
    }

    const pinHash = hashPin(newPin, pinSalt(boutique.id));
    await db.update(boutiquesTable).set({ pinHash }).where(eq(boutiquesTable.id, boutique.id));

    res.json({ success: true, message: "PIN réinitialisé avec succès" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── GROSSISTE LOGIN ──────────────────────────────────────────────────────────
// POST /api/auth/grossiste
// Body: { grossisteId, code }
// The access code is the last 4 digits of the grossiste telephone

router.post("/grossiste", async (req, res) => {
  try {
    const { grossisteId, code } = req.body;

    if (!grossisteId || !code) {
      return res.status(400).json({ error: "grossisteId et code requis" });
    }

    const [grossiste] = await db.select().from(grossistesTable)
      .where(eq(grossistesTable.id, parseInt(grossisteId))).limit(1);

    if (!grossiste) return res.status(404).json({ error: "Grossiste introuvable" });
    if (grossiste.statut === "inactif" || grossiste.statut === "suspendu") {
      return res.status(403).json({ error: "Compte grossiste inactif ou suspendu" });
    }

    const lastFour = grossiste.telephone.replace(/\D/g, "").slice(-4);
    if (code !== lastFour) {
      return res.status(401).json({ error: "Code d'accès incorrect", code: "WRONG_CODE" });
    }

    const token = signGrossisteToken(grossiste.id);
    return res.json({
      token,
      expiresIn: "8h",
      grossiste: { id: grossiste.id, nom: grossiste.nom, ville: grossiste.ville },
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── TOKEN VERIFY ─────────────────────────────────────────────────────────────
// GET /api/auth/verify

router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ valid: false, error: "No token" });
  }
  const { verifyToken } = require("../lib/security");
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) return res.status(401).json({ valid: false, error: "Invalid or expired token" });
  return res.json({ valid: true, payload });
});

// ─── DOCUMENT VERIFICATION ───────────────────────────────────────────────────
// GET /api/auth/verify-doc?type=bc&id=1

router.get("/verify-doc", async (req, res) => {
  try {
    const { type, id } = req.query;
    const { commandesTable: ct, livraisonsTable: lt } = await import("@workspace/db/schema");

    if (type === "bc") {
      const [c] = await db.select().from(ct).where(eq(ct.id, parseInt(String(id)))).limit(1);
      if (!c) return res.status(404).json({ valid: false, error: "BC introuvable" });
      if (!c.signature) return res.json({ valid: false, numeroBc: `BC-${String(c.id).padStart(5,"0")}`, error: "Document non signé" });

      const { verifyDocument, bcSignaturePayload } = await import("../lib/security");
      const valid = verifyDocument(bcSignaturePayload(c as any), c.signature);
      return res.json({
        valid,
        numeroBc: `BC-${String(c.id).padStart(5,"0")}`,
        boutiqueId: c.boutiqueId,
        grossisteId: c.grossisteId,
        montantTotal: c.montantTotal,
        createdAt: c.createdAt,
        signature: c.signature,
      });
    }

    if (type === "bl") {
      const [l] = await db.select().from(lt).where(eq(lt.id, parseInt(String(id)))).limit(1);
      if (!l) return res.status(404).json({ valid: false, error: "BL introuvable" });
      return res.json({
        valid: true,
        numeroBl: `BL-${String(l.id).padStart(5,"0")}`,
        boutiqueId: l.boutiqueId,
        tourneeId: l.tourneeId,
        montantTotal: l.montantTotal,
        statut: l.statut,
        createdAt: l.createdAt,
      });
    }

    return res.status(400).json({ error: "type doit être 'bc' ou 'bl'" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
