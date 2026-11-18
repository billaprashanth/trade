import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store";
import { parseSettings } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseSettings(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await saveSettings(parsed.value);
    return NextResponse.json(parsed.value);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
