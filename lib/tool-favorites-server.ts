import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolFavorite } from "@/lib/db/schema";

/** All tools a user has pinned, most-recently-pinned first. Powers the dashboard + Favorites page "Favorite Tools". */
export async function getFavoriteToolsForUser(userId: string) {
  return db.select().from(toolFavorite).where(eq(toolFavorite.userId, userId)).orderBy(toolFavorite.createdAt);
}
