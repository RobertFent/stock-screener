CREATE TABLE "filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"min_volume" bigint,
	"max_rsi" numeric(5, 2),
	"min_iv" numeric(5, 2),
	"max_iv" numeric(5, 2),
	"min_willr" numeric(5, 2),
	"max_willr" numeric(5, 2),
	"min_stoch_k" numeric(5, 2),
	"max_stoch_k" numeric(5, 2),
	"macd_increasing" boolean DEFAULT false,
	"macd_line_above_signal" boolean DEFAULT false,
	"close_above_ema20_above_ema50" boolean DEFAULT false,
	"stochastics_k_above_d" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;