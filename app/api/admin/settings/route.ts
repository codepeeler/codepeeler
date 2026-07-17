import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

const SETTINGS_ID = "site";

async function getOrCreateSettings() {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, SETTINGS_ID));
  if (row) return row;
  const [created] = await db.insert(siteSettings).values({ id: SETTINGS_ID }).returning();
  return created;
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const settings = await getOrCreateSettings();
  return NextResponse.json({ settings });
}

type Body = Partial<{
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementEnabled: boolean;
  announcementMessage: string;
  announcementLink: string;
}>;

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession(req.headers);
  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await getOrCreateSettings(); // ensure the row exists before updating
  const body = (await req.json()) as Body;

  const [updated] = await db
    .update(siteSettings)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(siteSettings.id, SETTINGS_ID))
    .returning();

  await logAdminAction(session.user.id, null, "update_site_settings", body);
  return NextResponse.json({ settings: updated });
}
