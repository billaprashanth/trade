export type Side = "Buy" | "Sell";
export type Result = "Win" | "Loss" | "Breakeven";

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  instrument: string;
  side: Side;
  setup: string;
  entry: number;
  exit: number;
  stopLoss?: number | null;
  /** Realised reward-to-risk multiple. Negative for a loss, e.g. -1 = full stop. */
  rr: number;
  notes?: string;
  /** Optional link to a chart screenshot (e.g. TradingView snapshot image URL). */
  chartUrl?: string;
  createdAt: string;
}

export interface Settings {
  capital: number;
  riskPercent: number;
}

export interface Dashboard {
  trades: Trade[];
  settings: Settings;
  isSample: boolean;
  storage: "redis" | "file";
}

export function resultOf(t: Pick<Trade, "rr">): Result {
  if (t.rr > 0) return "Win";
  if (t.rr < 0) return "Loss";
  return "Breakeven";
}
