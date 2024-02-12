CREATE TABLE IF NOT EXISTS "artistree_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"createdById" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "artistree_account" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "artistree_session" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "artistree_account" DROP CONSTRAINT "artistree_account_user_id_artistree_user_id_fk";
--> statement-breakpoint
ALTER TABLE "artistree_session" DROP CONSTRAINT "artistree_session_user_id_artistree_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "account_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "session_userId_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "createdById_idx" ON "artistree_post" ("createdById");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "artistree_post" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "artistree_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "artistree_session" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_account" ADD CONSTRAINT "artistree_account_userId_artistree_user_id_fk" FOREIGN KEY ("userId") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_session" ADD CONSTRAINT "artistree_session_userId_artistree_user_id_fk" FOREIGN KEY ("userId") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_post" ADD CONSTRAINT "artistree_post_createdById_artistree_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
