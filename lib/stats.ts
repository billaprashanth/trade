import type { Settings, Trade } from "./types";

export interface EquityPoint {
  index: number;
  label: string;
  equity: number;
  returnPct: number;
}

export interface Stats {
  closed: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  netPnl: number;
  totalReturn: number;
  profitFactor: number | null; // null = no losses yet (infinite)
  riskAmount: number;
  avgR: number;
  bestR: number;
  worstR: number;
  maxDrawdown: number; // percent
  longestWinStreak: number;
  endingEquity: number;
  curve: EquityPoint[];
  byInstrument: { instrument: string; trades: number; netR: number }[];
}

export function sortTrades(trades: Trade[], dir: "asc" | "desc" = "desc") {
  return [...trades].sort((a, b) => {
    const d = a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
    return dir === "asc" ? d : -d;
  });
}

export function computeStats(trades: Trade[], settings: Settings): Stats {
  const { capital, riskPercent } = settings;
  const riskAmount = (capital * riskPercent) / 100;
  const ordered = sortTrades(trades, "asc");

  let equity = capital;
  let peak = capital;
  let maxDd = 0;
  let streak = 0;
  let longest = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let wins = 0;
  let losses = 0;
  let be = 0;
  let sumR = 0;
  let bestR = 0;
  let worstR = 0;
  const instruments = new Map<string, { trades: number; netR: number }>();

  const curve: EquityPoint[] = [{ index: 0, label: "Start", equity: capital, returnPct: 0 }];

  ordered.forEach((t, i) => {
    const pnl = t.rr * riskAmount;
    equity += pnl;
    sumR += t.rr;
    if (i === 0) {
      bestR = t.rr;
      worstR = t.rr;
    } else {
      bestR = Math.max(bestR, t.rr);
      worstR = Math.min(worstR, t.rr);
    }

    if (t.rr > 0) {
      wins++;
      grossProfit += pnl;
      streak++;
      longest = Math.max(longest, streak);
    } else if (t.rr < 0) {
      losses++;
      grossLoss += -pnl;
      streak = 0;
    } else {
      be++;
    }

    peak = Math.max(peak, equity);
    const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    maxDd = Math.max(maxDd, dd);

    const inst = instruments.get(t.instrument) ?? { trades: 0, netR: 0 };
    inst.trades++;
    inst.netR += t.rr;
    instruments.set(t.instrument, inst);

    curve.push({
      index: i + 1,
      label: t.date,
      equity: round(equity),
      returnPct: round(((equity - capital) / capital) * 100),
    });
  });

  const closed = ordered.length;
  const netPnl = equity - capital;

  return {
    closed,
    wins,
    losses,
    breakeven: be,
    winRate: closed ? (wins / closed) * 100 : 0,
    netPnl: round(netPnl),
    totalReturn: capital ? round((netPnl / capital) * 100) : 0,
    profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss) : grossProfit > 0 ? null : 0,
    riskAmount: round(riskAmount),
    avgR: closed ? round(sumR / closed) : 0,
    bestR: round(bestR),
    worstR: round(worstR),
    maxDrawdown: round(maxDd),
    longestWinStreak: longest,
    endingEquity: round(equity),
    curve,
    byInstrument: [...instruments.entries()]
      .map(([instrument, v]) => ({ instrument, trades: v.trades, netR: round(v.netR) }))
      .sort((a, b) => b.trades - a.trades),
  };
}

function round(n: number, dp = 2) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export const fmt = {
  money: (n: number) =>
    (n < 0 ? "-$" : "$") +
    Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  signedMoney: (n: number) => (n > 0 ? "+" : "") + fmt.money(n),
  pct: (n: number, dp = 2) => `${n > 0 ? "+" : ""}${n.toFixed(dp)}%`,
  r: (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}R`,
  price: (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: n < 10 ? 4 : 2, maximumFractionDigits: n < 10 ? 5 : 2 }),
  date: (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  },
};
