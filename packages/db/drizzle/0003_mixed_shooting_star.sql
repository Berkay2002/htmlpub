ALTER TABLE "review_rounds" ADD COLUMN "watcher_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "review_rounds" ADD COLUMN "agent_acknowledged_at" timestamp with time zone;