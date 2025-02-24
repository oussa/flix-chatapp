CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"booking_id" text,
	"status" text DEFAULT 'open' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"assigned_agent_id" integer,
	"last_message_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "help_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"icon" varchar(50) NOT NULL,
	"link" varchar(255) NOT NULL,
	"sort_order" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"content" text NOT NULL,
	"is_from_user" boolean NOT NULL,
	"agent_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;

-- Insert initial help topics
INSERT INTO "help_topics" (title, icon, link, sort_order) VALUES
  ('Request a refund', 'RotateCcw', '/help/refund', 1),
  ('Manage your bookings', 'Calendar', '/help/bookings', 2),
  ('Route and delay info', 'Map', '/help/route', 3),
  ('Payment Problems', 'CreditCard', '/help/payment', 4),
  ('Baggage', 'Luggage', '/help/baggage', 5),
  ('Book a ticket', 'Ticket', '/help/booking', 6),
  ('Vouchers', 'Tag', '/help/vouchers', 7),
  ('Feedback', 'MessageCircle', '/help/feedback', 8),
  ('Booking for Children', 'Baby', '/help/children', 9),
  ('Passengers with disabilities', 'Accessibility', '/help/disabilities', 10),
  ('Security', 'Lock', '/help/security', 11),
  ('Contact Us', 'Mail', '/help/contact', 12); 

-- Add initial agent user
-- Password 'agent' hashed with bcrypt
INSERT INTO "agents" (email, name, password)
VALUES ('agent', 'Bob', '$2a$12$WaaSxiG3yKMIPzx5loVVKuWYnlLL5g4xCgdcE/PBd9.JTNWyEdrwC');
