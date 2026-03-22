import type { Request, Response, NextFunction } from "express";
import { verifyToken, type BoutiqueTokenPayload } from "../lib/security";

declare global {
  namespace Express {
    interface Request {
      boutiqueAuth?: BoutiqueTokenPayload;
    }
  }
}

export function requireBoutiqueAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token d'authentification requis", code: "MISSING_TOKEN" });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload || payload.type !== "boutiquer") {
    return res.status(401).json({ error: "Token invalide ou expiré", code: "INVALID_TOKEN" });
  }

  const boutiquePayload = payload as BoutiqueTokenPayload;

  const grossisteId = parseInt(req.params.grossisteId);
  if (grossisteId && boutiquePayload.grossisteId !== grossisteId) {
    return res.status(403).json({ error: "Accès non autorisé à ce grossiste", code: "FORBIDDEN" });
  }

  req.boutiqueAuth = boutiquePayload;
  next();
}

export function optionalBoutiqueAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload && payload.type === "boutiquer") {
      req.boutiqueAuth = payload as BoutiqueTokenPayload;
    }
  }
  next();
}
