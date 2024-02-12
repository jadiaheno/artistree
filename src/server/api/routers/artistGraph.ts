import { desc, eq, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  artistImages,
  artists,
  artistsRelatedArtists,
} from "~/server/db/schema";

export const artistGraphRouter = createTRPCRouter({
  getGraph: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const artistCount = ctx.db.$with("artistCount").as(
        ctx.db
          .select({
            artistId: sql<string>`${artistsRelatedArtists.artistId}`.as(
              "artistId",
            ),
            count: sql<number>`count(${artistsRelatedArtists.artistId})`.as(
              "count",
            ),
          })
          .from(artistsRelatedArtists)
          .groupBy(artistsRelatedArtists.artistId)
          .orderBy(desc(sql`count`))
          .limit(input?.limit ?? 3),
      );

      const nodes = await ctx.db
        .with(artistCount)
        .select({
          name: sql`distinct ${artists.name}`,
          artistId: artists.artistId,
          image: {
            url: artistImages.url,
            width: artistImages.width,
            height: artistImages.height,
          },
          count: sql<number>`"artistCount".count`,
        })
        .from(artists)
        .rightJoin(artistCount, eq(artists.artistId, artistCount.artistId))
        .leftJoin(artistImages, eq(artists.artistId, artistImages.artistId))
        .orderBy(desc(artistCount.count));

      const artistsList: string[] = nodes
        .map((n) => n.artistId)
        .filter((n) => !!n);

      const otherNodes = await ctx.db
        .select({
          name: artists.name,
          artistId: artists.artistId,
          image: {
            url: artistImages.url,
            width: artistImages.width,
            height: artistImages.height,
          },
        })
        .from(artists)
        .where(inArray(artistsRelatedArtists.relatedArtistId, artistsList))
        .leftJoin(artistImages, eq(artists.artistId, artistImages.artistId))
        .leftJoin(
          artistsRelatedArtists,
          eq(artists.artistId, artistsRelatedArtists.artistId),
        );

      artistsList.push(...otherNodes.map((n) => n.artistId));

      const edges = await ctx.db
        .select()
        .from(artistsRelatedArtists)
        .where(
          or(
            inArray(artistsRelatedArtists.artistId, artistsList),
            inArray(artistsRelatedArtists.relatedArtistId, artistsList),
          ),
        );
      return {
        nodes: [...nodes, ...otherNodes],
        edges,
      };
    }),

  getEdges: protectedProcedure
    .input(z.array(z.string().min(1)))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(artistsRelatedArtists)
        .where(
          or(
            inArray(artistsRelatedArtists.artistId, input),
            inArray(artistsRelatedArtists.relatedArtistId, input),
          ),
        );
    }),
});
