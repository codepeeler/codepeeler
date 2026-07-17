import "server-only";
import { db } from "@/lib/db";
import { toolOverride } from "@/lib/db/schema";
import { TOOLS } from "@/lib/data/tools";

export type AdminToolRow = {
  id: string;
  name: string;
  desc: string;
  cat: string;
  page: string | null;
  enabled: boolean;
  featured: boolean;
  beta: boolean;
};

/**
 * TOOLS in lib/data/tools.ts is the static catalog (name/desc/category/
 * page) — it isn't meant to move into the DB. tool_override is a thin,
 * sparse table on top of it: a row only exists once an admin changes a
 * tool away from its defaults (enabled, not featured, not beta). This
 * merges the two so the admin Tools page always has one full list.
 */
export async function getToolsWithOverrides(): Promise<AdminToolRow[]> {
  const overrides = await db.select().from(toolOverride);
  const overrideMap = new Map(overrides.map((o) => [o.id, o]));

  return TOOLS.map((t) => {
    const o = overrideMap.get(t.id);
    return {
      id: t.id,
      name: t.name,
      desc: t.desc,
      cat: t.cat,
      page: t.page,
      enabled: o?.enabled ?? true,
      featured: o?.featured ?? false,
      beta: o?.beta ?? false,
    };
  });
}
