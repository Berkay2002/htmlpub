import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { PublishResult } from "@htmlpub/core";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("collections_owner_slug_unique").on(table.ownerId, table.slug)]);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "set null" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  currentVersionId: uuid("current_version_id"),
  versionCounter: integer("version_counter").default(0).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("documents_owner_slug_unique").on(table.ownerId, table.slug),
  index("documents_owner_updated_idx").on(table.ownerId, table.updatedAt)
]);

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  blobPath: text("blob_path").notNull(),
  blobUrl: text("blob_url").notNull(),
  etag: text("etag").notNull(),
  sha256: text("sha256").notNull(),
  byteSize: integer("byte_size").notNull(),
  sourceFilename: text("source_filename").notNull(),
  restoredFromVersionId: uuid("restored_from_version_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("document_versions_number_unique").on(table.documentId, table.versionNumber),
  index("document_versions_document_idx").on(table.documentId, table.createdAt)
]);

export const shareLinks = pgTable("share_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true })
}, (table) => [
  uniqueIndex("share_links_hash_unique").on(table.tokenHash),
  uniqueIndex("share_links_active_document_unique").on(table.documentId).where(sql`${table.revokedAt} is null`),
  index("share_links_document_idx").on(table.documentId)
]);

export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayPrefix: text("display_prefix").notNull(),
  tokenHash: text("token_hash").notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex("api_tokens_hash_unique").on(table.tokenHash),
  index("api_tokens_owner_idx").on(table.ownerId)
]);

export const uploadSessions = pgTable("upload_sessions", {
  id: uuid("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  versionId: uuid("version_id").notNull(),
  title: text("title").notNull(),
  collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "set null" }),
  blobPath: text("blob_path").notNull(),
  sha256: text("sha256").notNull(),
  byteSize: integer("byte_size").notNull(),
  sourceFilename: text("source_filename").notNull(),
  status: text("status").$type<"pending" | "completed" | "expired">().default("pending").notNull(),
  completedResult: jsonb("completed_result").$type<PublishResult>(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("upload_sessions_owner_idx").on(table.ownerId),
  index("upload_sessions_status_created_idx").on(table.status, table.createdAt)
]);
