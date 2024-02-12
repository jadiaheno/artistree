import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `artistree_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const likedSongs = createTable(
  "likedSong",
  {
    songId: varchar("song_id", { length: 255 })
      .notNull()
      .references(() => songs.songId),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (likedSong) => ({
    songIdIdx: index("likedSong_songId_idx").on(likedSong.songId),
    userIdIdx: index("likedSong_userId_idx").on(likedSong.userId),
    compoundKey: primaryKey({
      columns: [likedSong.songId, likedSong.userId],
    }),
  })
);

export const likedSongsRelations = relations(likedSongs, ({ one }) => ({
  song: one(songs, { fields: [likedSongs.songId], references: [songs.songId] }),
  user: one(users, { fields: [likedSongs.userId], references: [users.id] }),
}));

export const songs = createTable(
  "song",
  {
    songId: varchar("song_id", { length: 255 }).notNull().primaryKey(),
    previewURL: varchar("preview_url", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
  },
  (likedSong) => ({
    songIdIdx: index("likedSong_artistId_idx").on(likedSong.songId),
  })
);

export const songsRelations = relations(songs, ({ many }) => ({
  artists: many(songArtists),
  likedSongs: many(likedSongs),
}));

export const songArtists = createTable(
  "songArtist",
  {
    songId: varchar("song_id", { length: 255 })
      .notNull()
      .references(() => songs.songId),
    artistId: varchar("artist_id", { length: 255 })
      .notNull()
      .references(() => artists.artistId),
  },
  (songArtist) => ({
    songIdIdx: index("songArtist_songId_idx").on(songArtist.songId),
    artistIdIdx: index("songArtist_artistId_idx").on(songArtist.artistId),
    compoundKey: primaryKey({
      columns: [songArtist.songId, songArtist.artistId],
    }),
  })
);

export const songArtistsRelations = relations(songArtists, ({ one }) => ({
  song: one(songs, { fields: [songArtists.songId], references: [songs.songId] }),
  artist: one(artists, {
    fields: [songArtists.artistId],
    references: [artists.artistId],
  }),
}));

export const artists = createTable(
  "artist",
  {
    artistId: varchar("artist_id", { length: 255 }).notNull().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
  },
  (artist) => ({
    idIdx: index("artist_id_idx").on(artist.artistId),
  })
);

export const artistsRelations = relations(artists, ({ many, one }) => ({
  images: one(artistImages, { fields: [artists.artistId], references: [artistImages.artistId] }),
  songArtists: many(songArtists),
  relatedArtists: many(artistsRelatedArtists),
}));

export const artistImages = createTable(
  "artistImage",
  {
    artistId: varchar("artist_id", { length: 255 })
      .notNull()
      .references(() => artists.artistId),
    url: varchar("url", { length: 255 }).notNull(),
    height: integer("height").notNull(),
    width: integer("width").notNull(),
  },
  (artistImage) => ({
    artistIdIdx: index("artistImage_artistId_idx").on(artistImage.artistId),
  })
);

export const artistImagesRelations = relations(artistImages, ({ one }) => ({
  artist: one(artists, { fields: [artistImages.artistId], references: [artists.artistId] }),
}));

export const artistsRelatedArtists = createTable(
  "artistRelatedArtist",
  {
    artistId: varchar("artist_id", { length: 255 })
      .notNull()
      .references(() => artists.artistId),
    relatedArtistId: varchar("related_artist_id", { length: 255 })
      .notNull()
      .references(() => artists.artistId),
  },
  (artistRelatedArtist) => ({
    artistIdIdx: index("artistRelatedArtist_artistId_idx").on(artistRelatedArtist.artistId),
    relatedArtistIdIdx: index("artistRelatedArtist_relatedArtistId_idx").on(artistRelatedArtist.relatedArtistId),
    compoundKey: primaryKey({
      columns: [artistRelatedArtist.artistId, artistRelatedArtist.relatedArtistId],
    }),
    artistRelatedArtist: index("artistRelatedArtist_artistRelatedArtist_idx").on(artistRelatedArtist.artistId, artistRelatedArtist.relatedArtistId),
  })
);

export const artistsRelatedArtistsRelations = relations(artistsRelatedArtists, ({ one }) => ({
  artist: one(artists, { fields: [artistsRelatedArtists.artistId], references: [artists.artistId] }),
  relatedArtist: one(artists, { fields: [artistsRelatedArtists.relatedArtistId], references: [artists.artistId] }),
}));



