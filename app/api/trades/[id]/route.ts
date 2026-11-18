import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { getTrades, saveTrades } from "@/lib/store";
import { parseTrade } from "@/lib/validate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = parseTrade(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const trades = await getTrades();
    const i = trades.findIndex((t) => t.id === id);
    if (i === -1) return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    trades[i] = { ...trades[i], ...parsed.value };
    await saveTrades(trades);
    return NextResponse.json({ trade: trades[i] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const trades = await getTrades();
    const next = trades.filter((t) => t.id !== id);
    if (next.length === trades.length) return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    await saveTrades(next);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
