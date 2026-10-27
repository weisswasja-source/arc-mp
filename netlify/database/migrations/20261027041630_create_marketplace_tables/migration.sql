CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"seller_id" text NOT NULL,
	"offer" jsonb NOT NULL,
	"want" jsonb NOT NULL,
	"open_to_offers" boolean DEFAULT true NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"platform" text NOT NULL,
	"region" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"listing_id" uuid NOT NULL,
	"from_id" text NOT NULL,
	"to_id" text NOT NULL,
	"give" jsonb NOT NULL,
	"get" jsonb NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"from_confirmed" boolean DEFAULT false NOT NULL,
	"to_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "listings_status_created_idx" ON "listings" ("status","created_at");--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" ("seller_id");--> statement-breakpoint
CREATE UNIQUE INDEX "players_name_lower_idx" ON "players" (lower("name"));--> statement-breakpoint
CREATE INDEX "trade_offers_from_idx" ON "trade_offers" ("from_id");--> statement-breakpoint
CREATE INDEX "trade_offers_to_idx" ON "trade_offers" ("to_id");--> statement-breakpoint
CREATE INDEX "trade_offers_listing_idx" ON "trade_offers" ("listing_id");--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_players_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_listing_id_listings_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_from_id_players_id_fkey" FOREIGN KEY ("from_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_to_id_players_id_fkey" FOREIGN KEY ("to_id") REFERENCES "players"("id") ON DELETE CASCADE;