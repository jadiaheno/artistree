import Queue from "bull";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  artistImages,
  artists,
  artistsRelatedArtists,
  likedSongs,
  songArtists,
  songs,
} from "../db/schema";
import { artistRelatedQueue } from "./artistRelatedArtists";
import {
  type Artist,
  type SpotifyLikedResponse,
  type Track,
} from "./types.spotify.liked";

interface LikedSongsQueueProps {
  userId: string;
  access_token: string;
}

export const likedSongsQueue = new Queue<LikedSongsQueueProps>(
  "LIKED_SONGS",
  "redis://127.0.0.1:6379",
);

void likedSongsQueue.process((job, done) => {
  const { userId, access_token } = job.data;
  getItemsFromLiked(userId, access_token)
    .then(() => done())
    .catch((err: Error) => {
      console.error(err);
      done(err);
    });
});

likedSongsQueue.on("completed", (job, result) => {
  console.log("Job completed", job.id, result);
});

likedSongsQueue.on("failed", (job, err) => {
  console.error("Job failed", job.id, err);
});

likedSongsQueue.on("error", (err) => {
  console.error("Queue error", err);
});

async function launchRelatedArtistsQueue(
  artistId: string,
  access_token: string,
) {
  const data = await db
    .select()
    .from(artistsRelatedArtists)
    .where(eq(artistsRelatedArtists.artistId, artistId));
  data.length === 0 &&
    (await artistRelatedQueue.add({
      artistId,
      access_token,
    }));
}

export async function getItemsFromLiked(
  userId: string,
  access_token: string,
  url = "https://api.spotify.com/v1/me/tracks?limit=50&",
) {
  // Getting the user's liked tracks from spotify api
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Could not get liked tracks: " + response.statusText + response.status,
    );
  }

  const data = (await response.json()) as SpotifyLikedResponse;
  console.log(...data.items.flatMap((item) => item.track.artists));

  await Promise.all([
    saveSong(data.items.map((item) => item.track)),
    saveArtists(data.items.flatMap((item) => item.track.artists)),
    saveLikedSongs(
      userId,
      data.items.map((item) => item.track),
    ),
    saveSongArtists(data.items.map((item) => item.track)),
    saveArtistImages(data.items.flatMap((item) => item.track.artists)),
  ]);

  await Promise.all(
    data.items
      .flatMap((item) => item.track.artists)
      .map((artist) => launchRelatedArtistsQueue(artist.id, access_token)),
  );

  if (data.next) {
    await getItemsFromLiked(userId, access_token, data.next);
  }
}

async function saveSong(tracks: Track[]) {
  return await db
    .insert(songs)
    .values(
      tracks.map((track) => ({
        songId: track.id,
        name: track.name,
        previewURL: track.preview_url,
      })),
    )
    .onConflictDoNothing();
}

async function saveArtists(artist: Artist[]) {
  return await db
    .insert(artists)
    .values(
      artist.map((artist) => ({
        artistId: artist.id,
        name: artist.name,
      })),
    )
    .onConflictDoNothing();
}

async function saveLikedSongs(userId: string, tracks: Track[]) {
  return await db
    .insert(likedSongs)
    .values(
      tracks.map((track) => ({
        songId: track.id,
        userId,
      })),
    )
    .onConflictDoNothing();
}

async function saveSongArtists(tracks: Track[]) {
  return await db
    .insert(songArtists)
    .values(
      tracks.flatMap((track) =>
        track.artists.map((artist) => ({
          songId: track.id,
          artistId: artist.id,
        })),
      ),
    )
    .onConflictDoNothing();
}

async function saveArtistImages(artist: Artist[]) {
  const largestImages = artist
    .flatMap((artist) => {
      if (!artist.images || artist.images.length === 0) return [];
      return {
        ...artist.images?.reduce((prev, current) => {
          return prev.height * prev.width > current.height * current.width
            ? prev
            : current;
        }),
        artistId: artist.id,
      };
    })
    .filter((image) => image.url);

  if (!largestImages || largestImages.length === 0) return;

  return await db
    .insert(artistImages)
    .values(largestImages)
    .onConflictDoNothing();
}
