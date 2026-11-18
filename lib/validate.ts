import type { Settings, Trade } from "./types";

type TradeInput = Omit<Trade, "id" | "createdAt">;

const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parseTrade(body: unknown): { ok: true; value: TradeInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;

  const date = str(b.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Date must be YYYY-MM-DD" };

  const instrument = str(b.instrument, 20).toUpperCase();
  if (!instrument) return { ok: false, error: "Instrument is required" };

  const side = b.side === "Sell" ? "Sell" : b.side === "Buy" ? "Buy" : null;
  if (!side) return { ok: false, error: "Side must be Buy or Sell" };

  const entry = num(b.entry);
  const exit = num(b.exit);
  const rr = num(b.rr);
  if (!Number.isFinite(entry) || entry <= 0) return { ok: false, error: "Entry price is required" };
  if (!Number.isFinite(exit) || exit <= 0) return { ok: false, error: "Exit price is required" };
  if (!Number.isFinite(rr) || Math.abs(rr) > 100) return { ok: false, error: "R:R must be a number (e.g. 2.5 or -1)" };

  const sl = num(b.stopLoss);
  const chartUrl = str(b.chartUrl, 500);
  if (chartUrl && !/^https?:\/\//i.test(chartUrl)) return { ok: false, error: "Chart URL must start with http(s)://" };

  return {
    ok: true,
    value: {
      date,
      instrument,
      side,
      setup: str(b.setup, 80) || "—",
      entry,
      exit,
      stopLoss: Number.isFinite(sl) && sl > 0 ? sl : null,
      rr: Math.round(rr * 100) / 100,
      notes: str(b.notes, 2000),
      chartUrl,
    },
  };
}

export function parseSettings(body: unknown): { ok: true; value: Settings } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const capital = num(b.capital);
  const riskPercent = num(b.riskPercent);
  if (!Number.isFinite(capital) || capital <= 0) return { ok: false, error: "Capital must be > 0" };
  if (!Number.isFinite(riskPercent) || riskPercent <= 0 || riskPercent > 100)
    return { ok: false, error: "Risk % must be between 0 and 100" };
  return { ok: true, value: { capital, riskPercent } };
}
