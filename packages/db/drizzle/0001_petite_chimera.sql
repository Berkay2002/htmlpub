ALTER TABLE "upload_sessions" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD COLUMN "collection_id" uuid;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "share_links_active_document_unique" ON "share_links" USING btree ("document_id") WHERE "share_links"."revoked_at" is null;