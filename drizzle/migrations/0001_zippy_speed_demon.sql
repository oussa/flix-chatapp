ALTER TABLE "help_topics" ALTER COLUMN "created_at" SET DEFAULT '2025-02-23T22:39:05.444Z';--> statement-breakpoint
ALTER TABLE "help_topics" ALTER COLUMN "updated_at" SET DEFAULT '2025-02-23T22:39:05.444Z';--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "assigned_agent_id" integer;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "last_message_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "agent_id" integer;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;
