CREATE TYPE "public"."indices" AS ENUM('sp100', 'sp500', 'nasdaq100');--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "indices" "indices"[];