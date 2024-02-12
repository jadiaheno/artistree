import Queue from "bull";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { artistsRelatedArtists } from "../db/schema";
import { type SpotifyArtistRelatedArtists } from "./types.spotify.relatedArtists";

// Check if we have already the artist related artists in the database
interface ArtistRelatedQueueProps {
  artistId: string;
  access_token: string;
}

export const artistRelatedQueue = new Queue<ArtistRelatedQueueProps>(
  "ARTIST_RELATED",
  "redis://127.0.0.1:6379",
);

void artistRelatedQueue.process((job, done) => {
  const { artistId, access_token } = job.data;

  db.select()
    .from(artistsRelatedArtists)
    .where(eq(artistsRelatedArtists.artistId, artistId))
    .then(async (data) => {
      if (data.length > 0) {
        await job.log("Data already exists in the database");
        done();
      } else {
        await saveRelatedArtists(artistId, access_token);
      }
    })
    .catch(async (err) => {
      await job.log(JSON.stringify(err));
    });
});

artistRelatedQueue.on("completed", (job, result) => {
  console.log("Job completed", job.id, result);
});

async function saveRelatedArtists(artistId: string, access_token: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Could not get related artists: " + response.statusText + response.status,
    );
  }

  const data = (await response.json()) as SpotifyArtistRelatedArtists;

  const relatedArtists = data.artists
    .map((artist) => ({
      artistId: artistId,
      relatedArtistId: artist.id,
    }))
    .filter((artist) => artist.relatedArtistId);

  if (relatedArtists.length === 0) return;

  await Promise.all(
    relatedArtists.map(async (artist) => {
      try {
        await db
          .insert(artistsRelatedArtists)
          .values(artist)
          .onConflictDoNothing();
      } catch (error) {
        // do notrhing
      }
    }),
  );
}
