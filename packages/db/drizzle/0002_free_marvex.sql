CREATE TABLE "review_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_round_id" uuid NOT NULL,
	"body" text NOT NULL,
	"exact_text" text NOT NULL,
	"prefix_text" text DEFAULT '' NOT NULL,
	"suffix_text" text DEFAULT '' NOT NULL,
	"start_position" integer,
	"end_position" integer,
	"heading" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid NOT NULL,
	"review_round_id" uuid NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_review_round_id_review_rounds_id_fk" FOREIGN KEY ("review_round_id") REFERENCES "public"."review_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_events" ADD CONSTRAINT "review_events_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_events" ADD CONSTRAINT "review_events_review_round_id_review_rounds_id_fk" FOREIGN KEY ("review_round_id") REFERENCES "public"."review_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_rounds" ADD CONSTRAINT "review_rounds_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_rounds" ADD CONSTRAINT "review_rounds_version_id_document_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."document_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_comments_round_idx" ON "review_comments" USING btree ("review_round_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "review_events_round_unique" ON "review_events" USING btree ("review_round_id");--> statement-breakpoint
CREATE INDEX "review_events_document_cursor_idx" ON "review_events" USING btree ("document_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_rounds_open_document_unique" ON "review_rounds" USING btree ("document_id") WHERE "review_rounds"."status" = 'open';--> statement-breakpoint
CREATE INDEX "review_rounds_document_idx" ON "review_rounds" USING btree ("document_id","created_at");--> statement-breakpoint
CREATE INDEX "review_rounds_version_idx" ON "review_rounds" USING btree ("version_id");