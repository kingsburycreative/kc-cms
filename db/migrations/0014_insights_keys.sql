CREATE TABLE "insights_keys" (
	"repo" text PRIMARY KEY NOT NULL,
	"ga" text,
	"cf" text,
	"pages" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text NOT NULL
);
