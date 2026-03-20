import { pgTable, serial, text, timestamp, pgEnum, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const grossisteStatutEnum = pgEnum("grossiste_statut", ["actif", "inactif", "suspendu"]);
export const chauffeurStatutEnum = pgEnum("chauffeur_statut", ["disponible", "en_tournee", "inactif"]);
export const boutiqueStatutEnum = pgEnum("boutique_statut", ["actif", "suspendu"]);
export const tourneeStatutEnum = pgEnum("tournee_statut", ["planifiee", "en_cours", "terminee", "annulee"]);
export const livraisonStatutEnum = pgEnum("livraison_statut", ["en_attente", "livree", "echec", "litige"]);
export const paiementMethodeEnum = pgEnum("paiement_methode", ["especes", "mobile_money", "credit"]);

export const grossistesTable = pgTable("grossistes", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  ville: text("ville").notNull(),
  telephone: text("telephone").notNull(),
  email: text("email").notNull(),
  adresse: text("adresse").notNull(),
  statut: grossisteStatutEnum("statut").notNull().default("actif"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chauffeursTable = pgTable("chauffeurs", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  telephone: text("telephone").notNull(),
  permis: text("permis").notNull(),
  statut: chauffeurStatutEnum("statut").notNull().default("disponible"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const boutiquesTable = pgTable("boutiques", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  proprietaire: text("proprietaire").notNull(),
  adresse: text("adresse").notNull(),
  telephone: text("telephone").notNull(),
  limiteCredit: numeric("limite_credit", { precision: 12, scale: 2 }).notNull().default("0"),
  soldeCredit: numeric("solde_credit", { precision: 12, scale: 2 }).notNull().default("0"),
  statut: boutiqueStatutEnum("statut").notNull().default("actif"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const produitsTable = pgTable("produits", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  categorie: text("categorie").notNull(),
  prixUnitaire: numeric("prix_unitaire", { precision: 12, scale: 2 }).notNull(),
  unite: text("unite").notNull(),
  stockDisponible: integer("stock_disponible").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tourneesTable = pgTable("tournees", {
  id: serial("id").primaryKey(),
  grossisteId: integer("grossiste_id").notNull().references(() => grossistesTable.id, { onDelete: "cascade" }),
  chauffeurId: integer("chauffeur_id").notNull().references(() => chauffeursTable.id),
  date: text("date").notNull(),
  statut: tourneeStatutEnum("statut").notNull().default("planifiee"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const livraisonsTable = pgTable("livraisons", {
  id: serial("id").primaryKey(),
  tourneeId: integer("tournee_id").notNull().references(() => tourneesTable.id, { onDelete: "cascade" }),
  boutiqueId: integer("boutique_id").notNull().references(() => boutiquesTable.id),
  statut: livraisonStatutEnum("statut").notNull().default("en_attente"),
  montantTotal: numeric("montant_total", { precision: 12, scale: 2 }).notNull().default("0"),
  methodePaiement: paiementMethodeEnum("methode_paiement").notNull().default("especes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGrossisteSchema = createInsertSchema(grossistesTable).omit({ id: true, createdAt: true });
export type InsertGrossiste = z.infer<typeof insertGrossisteSchema>;
export type Grossiste = typeof grossistesTable.$inferSelect;

export const insertChauffeurSchema = createInsertSchema(chauffeursTable).omit({ id: true, createdAt: true });
export type InsertChauffeur = z.infer<typeof insertChauffeurSchema>;
export type Chauffeur = typeof chauffeursTable.$inferSelect;

export const insertBoutiqueSchema = createInsertSchema(boutiquesTable).omit({ id: true, createdAt: true });
export type InsertBoutique = z.infer<typeof insertBoutiqueSchema>;
export type Boutique = typeof boutiquesTable.$inferSelect;

export const insertProduitSchema = createInsertSchema(produitsTable).omit({ id: true, createdAt: true });
export type InsertProduit = z.infer<typeof insertProduitSchema>;
export type Produit = typeof produitsTable.$inferSelect;

export const insertTourneeSchema = createInsertSchema(tourneesTable).omit({ id: true, createdAt: true });
export type InsertTournee = z.infer<typeof insertTourneeSchema>;
export type Tournee = typeof tourneesTable.$inferSelect;

export const insertLivraisonSchema = createInsertSchema(livraisonsTable).omit({ id: true, createdAt: true });
export type InsertLivraison = z.infer<typeof insertLivraisonSchema>;
export type Livraison = typeof livraisonsTable.$inferSelect;
