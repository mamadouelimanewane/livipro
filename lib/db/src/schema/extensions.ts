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
