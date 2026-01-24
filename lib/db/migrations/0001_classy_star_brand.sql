CREATE TABLE "filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"min_volume" bigint,
	"max_rsi" integer,
	"min_iv" integer,
	"max_iv" integer,
	"min_willr" integer,
	"max_willr" integer,
	"min_stoch_k" integer,
	"max_stoch_k" integer,
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