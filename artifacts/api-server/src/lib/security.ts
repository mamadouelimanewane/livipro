import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "livipro_jwt_secret_change_me_in_production_2026";
const DOC_SECRET = process.env["DOC_SECRET"] || "livipro_doc_secret_change_me_in_production_2026";

// ─── PIN HASHING (PBKDF2 — built-in Node.js) ────────────────────────────────

export function hashPin(pin: string, salt: string): string {
  return crypto.pbkdf2Sync(pin, salt, 100_000, 32, "sha256").toString("hex");
}

export function pinSalt(boutiqueId: number): string {
  return `livipro_pin_${boutiqueId}`;
}

export function verifyPin(pin: string, boutiqueId: number, storedHash: string): boolean {
  const computed = hashPin(pin, pinSalt(boutiqueId));
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(storedHash, "hex"));
}

// ─── JWT TOKENS ──────────────────────────────────────────────────────────────

export interface BoutiqueTokenPayload {
  boutiqueId: number;
  grossisteId: number;
  type: "boutiquer";
}

export interface GrossisteTokenPayload {
  grossisteId: number;
  type: "grossiste";
}

export function signBoutiqueToken(payload: Omit<BoutiqueTokenPayload, "type">): string {
  return jwt.sign({ ...payload, type: "boutiquer" }, JWT_SECRET, { expiresIn: "24h" });
}

export function signGrossisteToken(grossisteId: number): string {
  return jwt.sign({ grossisteId, type: "grossiste" }, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): BoutiqueTokenPayload | GrossisteTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as BoutiqueTokenPayload | GrossisteTokenPayload;
  } catch {
    return null;
  }
}

// ─── DOCUMENT SIGNATURE (HMAC-SHA256) ────────────────────────────────────────
// Signs documents (BC/BL) to ensure integrity. Any tampering invalidates the signature.

export function signDocument(payload: Record<string, unknown>): string {
  const data = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHmac("sha256", DOC_SECRET).update(data).digest("hex");
}

export function verifyDocument(payload: Record<string, unknown>, signature: string): boolean {
  const expected = signDocument(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export function bcSignaturePayload(commande: { id: number; boutiqueId: number; grossisteId: number; montantTotal: string; createdAt: Date | string }) {
  return {
    id: commande.id,
    boutiqueId: commande.boutiqueId,
    grossisteId: commande.grossisteId,
    montantTotal: commande.montantTotal,
    createdAt: String(commande.createdAt),
  };
}

export function blSignaturePayload(livraison: { id: number; boutiqueId: number; tourneeId: number; montantTotal: string; createdAt: Date | string }) {
  return {
    id: livraison.id,
    boutiqueId: livraison.boutiqueId,
    tourneeId: livraison.tourneeId,
    montantTotal: livraison.montantTotal,
    createdAt: String(livraison.createdAt),
  };
}

// ─── IDEMPOTENCY KEY GENERATOR ───────────────────────────────────────────────

export function generateIdempotencyKey(actorType: string, actorId: number, montant: string, description: string): string {
  return crypto.createHash("sha256")
    .update(`${actorType}_${actorId}_${montant}_${description}_${Date.now()}`)
    .digest("hex")
    .slice(0, 32);
}
