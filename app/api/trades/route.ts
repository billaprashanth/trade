import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAuthorized } from "@/lib/auth";
import { getDashboard, getTrades, saveTrades } from "@/lib/store";
import { computeStats } from "@/lib/stats";
import { parseTrade } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboard();
  return NextResponse.json({ ...data, stats: computeStats(data.trades, data.settings) });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseTrade(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const trades = await getTrades();
    const trade = { ...parsed.value, id: randomUUID(), createdAt: new Date().toISOString() };
    trades.push(trade);
    await saveTrades(trades);
    return NextResponse.json({ trade }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
