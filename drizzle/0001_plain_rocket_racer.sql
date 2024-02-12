ALTER TABLE "artistree_account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "artistree_account" DROP CONSTRAINT "artistree_account_userId_artistree_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "account_userId_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "artistree_account" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_account" ADD CONSTRAINT "artistree_account_user_id_artistree_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
