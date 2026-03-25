import { pgTable, serial, text, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { grossistesTable, boutiquesTable, chauffeursTable, tourneesTable, livraisonsTable, produitsTable } from "./grossistes";

export const commandeStatutEnum = text("statut");

export const commandesTable = pgTable("commandes", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  boutiqueId: integer("boutique_id").notNull().references(() => boutiquesTable.id, { onDelete: "cascade" }),
  statut: text("statut").notNull().default("en_attente"),
  montantTotal: numeric("montant_total", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  signature: text("signature"),
  // Colisage — authentification livreur au retrait entrepôt
  signatureColisage: text("signature_colisage"),
  dateColisage: timestamp("date_colisage"),
  chauffeurId: integer("chauffeur_id").references(() => chauffeursTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commandeItemsTable = pgTable("commande_items", {
  id: serial("id").primaryKey(),
  commandeId: integer("commande_id").notNull().references(() => commandesTable.id, { onDelete: "cascade" }),
  produitId: integer("produit_id").notNull().references(() => produitsTable.id),
  quantite: integer("quantite").notNull(),
  prixUnitaire: numeric("prix_unitaire", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  actorType: text("actor_type").notNull(),
  actorId: integer("actor_id").notNull(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  methodePaiement: text("methode_paiement").default("especes"),
  idempotencyKey: text("idempotency_key").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  tourneeId: integer("tournee_id").references(() => tourneesTable.id),
  livraisonId: integer("livraison_id").references(() => livraisonsTable.id),
  expediteurType: text("expediteur_type").notNull(),
  expediteurId: integer("expediteur_id").notNull(),
  destinataireType: text("destinataire_type").notNull(),
  destinataireId: integer("destinataire_id").notNull(),
  contenu: text("contenu").notNull(),
  lu: boolean("lu").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preuvesLivraisonTable = pgTable("preuves_livraison", {
  id: serial("id").primaryKey(),
  livraisonId: integer("livraison_id").notNull().references(() => livraisonsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  dataUrl: text("data_url").notNull(),
  commentaire: text("commentaire"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const geolocationsTable = pgTable("geolocations", {
  id: serial("id").primaryKey(),
  chauffeurId: integer("chauffeur_id").notNull().references(() => chauffeursTable.id, { onDelete: "cascade" }),
  tourneeId: integer("tournee_id").references(() => tourneesTable.id),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  lat: numeric("lat", { precision: 10, scale: 7 }).notNull(),
  lng: numeric("lng", { precision: 10, scale: 7 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommandeSchema = createInsertSchema(commandesTable).omit({ id: true, createdAt: true });
export type InsertCommande = z.infer<typeof insertCommandeSchema>;
export type Commande = typeof commandesTable.$inferSelect;

export const insertCommandeItemSchema = createInsertSchema(commandeItemsTable).omit({ id: true, createdAt: true });
export type InsertCommandeItem = z.infer<typeof insertCommandeItemSchema>;
export type CommandeItem = typeof commandeItemsTable.$inferSelect;

export const insertWalletTransactionSchema = createInsertSchema(walletTransactionsTable).omit({ id: true, createdAt: true });
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;

export const insertPreuveLivraisonSchema = createInsertSchema(preuvesLivraisonTable).omit({ id: true, createdAt: true });
export type InsertPreuveLivraison = z.infer<typeof insertPreuveLivraisonSchema>;
export type PreuveLivraison = typeof preuvesLivraisonTable.$inferSelect;

export const insertGeolocationSchema = createInsertSchema(geolocationsTable).omit({ id: true, createdAt: true });
export type InsertGeolocation = z.infer<typeof insertGeolocationSchema>;
export type Geolocation = typeof geolocationsTable.$inferSelect;

// ─── DOCUMENTS (factures, devis, contrats, BL, BC) ───────────────────────────

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  boutiqueId: integer("boutique_id").references(() => boutiquesTable.id, { onDelete: "set null" }),
  type: text("type").notNull().default("autre"),
  nom: text("nom").notNull(),
  description: text("description"),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  taille: integer("taille"),
  contenu: text("contenu").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;

// ─── PARAMÈTRES SYSTÈME (Admin) ───────────────────────────────────────────────

export const parametresSystemeTable = pgTable("parametres_systeme", {
  id: serial("id").primaryKey(),
  cle: text("cle").notNull().unique(),
  valeur: text("valeur").notNull(),
  type: text("type").notNull().default("text"),
  categorie: text("categorie").notNull().default("general"),
  label: text("label").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertParametreSystemeSchema = createInsertSchema(parametresSystemeTable).omit({ id: true, updatedAt: true });
export type InsertParametreSysteme = z.infer<typeof insertParametreSystemeSchema>;
export type ParametreSysteme = typeof parametresSystemeTable.$inferSelect;

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").references(() => grossistesTable.id, { onDelete: "cascade" }),
  destinataireType: text("destinataire_type").notNull(), // admin, grossiste, boutiquier, chauffeur
  destinataireId: integer("destinataire_id"),
  titre: text("titre").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error, commande, livraison, paiement
  lu: boolean("lu").notNull().default(false),
  lienType: text("lien_type"), // commande, livraison, tournee
  lienId: integer("lien_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;

// ─── RETOURS MARCHANDISES ──────────────────────────────────────────────────────

export const retoursTable = pgTable("retours", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  boutiqueId: integer("boutique_id").notNull().references(() => boutiquesTable.id, { onDelete: "cascade" }),
  livraisonId: integer("livraison_id").references(() => livraisonsTable.id),
  chauffeurId: integer("chauffeur_id").references(() => chauffeursTable.id),
  produitId: integer("produit_id").references(() => produitsTable.id),
  quantite: integer("quantite").notNull().default(1),
  raison: text("raison").notNull(), // avarie, erreur_commande, refus_client, peremption
  description: text("description"),
  statut: text("statut").notNull().default("en_attente"), // en_attente, accepte, refuse, stock_reintegre
  montantRembourse: numeric("montant_rembourse", { precision: 12, scale: 2 }).default("0"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  traiteLe: timestamp("traite_le"),
});

export const insertRetourSchema = createInsertSchema(retoursTable).omit({ id: true, createdAt: true });
export type InsertRetour = z.infer<typeof insertRetourSchema>;
export type Retour = typeof retoursTable.$inferSelect;

// ─── PROMOTIONS / CODES PROMO ─────────────────────────────────────────────────

export const promotionsTable = pgTable("promotions", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  titre: text("titre").notNull(),
  description: text("description"),
  type: text("type").notNull().default("remise_pct"), // remise_pct, remise_fixe, livraison_offerte, points_bonus
  valeur: numeric("valeur", { precision: 8, scale: 2 }).notNull().default("0"),
  minCommande: numeric("min_commande", { precision: 12, scale: 2 }).default("0"),
  usagesMax: integer("usages_max"),
  usagesActuels: integer("usages_actuels").notNull().default(0),
  boutiqueId: integer("boutique_id").references(() => boutiquesTable.id), // null = toutes boutiques
  actif: boolean("actif").notNull().default(true),
  dateDebut: timestamp("date_debut").defaultNow(),
  dateFin: timestamp("date_fin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromotionSchema = createInsertSchema(promotionsTable).omit({ id: true, createdAt: true, usagesActuels: true });
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotionsTable.$inferSelect;

// ─── FACTURES ─────────────────────────────────────────────────────────────────

export const facturesTable = pgTable("factures", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  boutiqueId: integer("boutique_id").references(() => boutiquesTable.id, { onDelete: "set null" }),
  numero: text("numero").notNull().unique(),
  periode: text("periode").notNull(), // "2026-03" format
  montantHT: numeric("montant_ht", { precision: 12, scale: 2 }).notNull().default("0"),
  tva: numeric("tva", { precision: 12, scale: 2 }).notNull().default("0"),
  montantTTC: numeric("montant_ttc", { precision: 12, scale: 2 }).notNull().default("0"),
  statut: text("statut").notNull().default("en_attente"), // en_attente, payee, en_retard, annulee
  echeance: timestamp("echeance"),
  commandeIds: text("commande_ids"), // JSON array
  contenuPdf: text("contenu_pdf"), // base64
  createdAt: timestamp("created_at").defaultNow().notNull(),
  payeeLe: timestamp("payee_le"),
});

export const insertFactureSchema = createInsertSchema(facturesTable).omit({ id: true, createdAt: true });
export type InsertFacture = z.infer<typeof insertFactureSchema>;
export type Facture = typeof facturesTable.$inferSelect;

// ─── DÉPÔTS / ENTREPÔTS ───────────────────────────────────────────────────────

export const depotsTable = pgTable("depots", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  adresse: text("adresse").notNull(),
  ville: text("ville").notNull(),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  responsable: text("responsable"),
  telephone: text("telephone"),
  actif: boolean("actif").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDepotSchema = createInsertSchema(depotsTable).omit({ id: true, createdAt: true });
export type InsertDepot = z.infer<typeof insertDepotSchema>;
export type Depot = typeof depotsTable.$inferSelect;

// ─── AUDIT TRAIL ──────────────────────────────────────────────────────────────

export const auditTrailTable = pgTable("audit_trail", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").references(() => grossistesTable.id, { onDelete: "cascade" }),
  acteurType: text("acteur_type").notNull(), // admin, grossiste, boutiquier, chauffeur, systeme
  acteurId: integer("acteur_id"),
  acteurNom: text("acteur_nom"),
  action: text("action").notNull(), // login, logout, create, update, delete, view, export
  ressource: text("ressource").notNull(), // commande, livraison, boutique, credit, pin, parametres...
  ressourceId: integer("ressource_id"),
  details: text("details"), // JSON stringify des changements
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditTrailSchema = createInsertSchema(auditTrailTable).omit({ id: true, createdAt: true });
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type AuditTrail = typeof auditTrailTable.$inferSelect;

// ─── CONGÉS CHAUFFEURS ────────────────────────────────────────────────────────

export const congesChauffeursTable = pgTable("conges_chauffeurs", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  chauffeurId: integer("chauffeur_id").notNull().references(() => chauffeursTable.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("conge"), // conge, maladie, formation, absence
  dateDebut: timestamp("date_debut").notNull(),
  dateFin: timestamp("date_fin").notNull(),
  motif: text("motif"),
  statut: text("statut").notNull().default("approuve"), // en_attente, approuve, refuse
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCongesChauffeurSchema = createInsertSchema(congesChauffeursTable).omit({ id: true, createdAt: true });
export type InsertCongesChauffeur = z.infer<typeof insertCongesChauffeurSchema>;
export type CongesChauffeur = typeof congesChauffeursTable.$inferSelect;
