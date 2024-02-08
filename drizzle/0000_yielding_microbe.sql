CREATE TABLE IF NOT EXISTS "artistree_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "artistree_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_artistImage" (
	"artist_id" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"height" integer NOT NULL,
	"width" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_artist" (
	"artist_id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_artistRelatedArtist" (
	"artist_id" varchar(255) NOT NULL,
	"related_artist_id" varchar(255) NOT NULL,
	CONSTRAINT "artistree_artistRelatedArtist_artist_id_related_artist_id_pk" PRIMARY KEY("artist_id","related_artist_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_likedSong" (
	"song_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	CONSTRAINT "artistree_likedSong_song_id_user_id_pk" PRIMARY KEY("song_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"createdById" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_songArtist" (
	"song_id" varchar(255) NOT NULL,
	"artist_id" varchar(255) NOT NULL,
	CONSTRAINT "artistree_songArtist_song_id_artist_id_pk" PRIMARY KEY("song_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_song" (
	"song_id" varchar(255) PRIMARY KEY NOT NULL,
	"preview_url" varchar(255),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artistree_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "artistree_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "artistree_account" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artistImage_artistId_idx" ON "artistree_artistImage" ("artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artist_id_idx" ON "artistree_artist" ("artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artistRelatedArtist_artistId_idx" ON "artistree_artistRelatedArtist" ("artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artistRelatedArtist_relatedArtistId_idx" ON "artistree_artistRelatedArtist" ("related_artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likedSong_songId_idx" ON "artistree_likedSong" ("song_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likedSong_userId_idx" ON "artistree_likedSong" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "createdById_idx" ON "artistree_post" ("createdById");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "artistree_post" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "artistree_session" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "songArtist_songId_idx" ON "artistree_songArtist" ("song_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "songArtist_artistId_idx" ON "artistree_songArtist" ("artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "likedSong_artistId_idx" ON "artistree_song" ("song_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_account" ADD CONSTRAINT "artistree_account_user_id_artistree_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_artistImage" ADD CONSTRAINT "artistree_artistImage_artist_id_artistree_artist_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "artistree_artist"("artist_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_artistRelatedArtist" ADD CONSTRAINT "artistree_artistRelatedArtist_artist_id_artistree_artist_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "artistree_artist"("artist_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_artistRelatedArtist" ADD CONSTRAINT "artistree_artistRelatedArtist_related_artist_id_artistree_artist_artist_id_fk" FOREIGN KEY ("related_artist_id") REFERENCES "artistree_artist"("artist_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_likedSong" ADD CONSTRAINT "artistree_likedSong_song_id_artistree_song_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "artistree_song"("song_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_likedSong" ADD CONSTRAINT "artistree_likedSong_user_id_artistree_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_post" ADD CONSTRAINT "artistree_post_createdById_artistree_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_session" ADD CONSTRAINT "artistree_session_user_id_artistree_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "artistree_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_songArtist" ADD CONSTRAINT "artistree_songArtist_song_id_artistree_song_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "artistree_song"("song_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artistree_songArtist" ADD CONSTRAINT "artistree_songArtist_artist_id_artistree_artist_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "artistree_artist"("artist_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
