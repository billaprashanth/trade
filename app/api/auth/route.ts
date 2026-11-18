import { NextResponse } from "next/server";
import { adminConfigured, checkPassword } from "@/lib/auth";
import { storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set. Add it in Vercel → Settings → Environment Variables, then redeploy." },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, storage: storageMode(), onVercel: Boolean(process.env.VERCEL) });
}
