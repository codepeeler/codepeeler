import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

const SETTINGS_ID = "site";

/**
 * No auth check — this is read by every visitor's browser (maintenance
 * overlay + announcement bar), so it only ever returns the handful of
 * fields that are safe to be public. Never add anything sensitive here;
 * use /api/admin/settings (admin-only) for the full row.
 */
export async function GET() {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID));

  return NextResponse.json({
    maintenanceMode: row?.maintenanceMode ?? false,
    maintenanceMessage: row?.maintenanceMessage ?? null,
    announcementEnabled: row?.announcementEnabled ?? false,
    announcementMessage: row?.announcementMessage ?? null,
    announcementLink: row?.announcementLink ?? null,
  });
}
