ALTER TABLE "filters" RENAME COLUMN "max_rsi" TO "max_rsi4";--> statement-breakpoint
ALTER TABLE "filters" RENAME COLUMN "min_willr" TO "min_willr_4";--> statement-breakpoint
ALTER TABLE "filters" RENAME COLUMN "max_willr" TO "max_willr_4";--> statement-breakpoint
ALTER TABLE "filters" ALTER COLUMN "min_iv" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "filters" ALTER COLUMN "max_iv" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "filters" ALTER COLUMN "min_stoch_k" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "filters" ALTER COLUMN "max_stoch_k" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "max_rsi14" integer;--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "min_willr_14" integer;--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "max_willr_14" integer;