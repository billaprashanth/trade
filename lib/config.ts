// Edit this file to change the site's text, links and defaults.

export const site = {
  name: "Sai Srinivas",
  brand: "Trade with Bunny",
  initials: "SS",
  title: "Sai Srinivas | Trader Portfolio",
  description:
    "Independent trader Sai Srinivas — a transparent public record of trade decisions and performance in XAUUSD and FX, built on market structure, liquidity and risk management.",
  tagline: ["Trading with", "patience,", "precision", "and discipline."],
  intro:
    "A public record of my trade decisions and performance — focused on market structure, liquidity and risk management. Every trade, win or loss, is logged here.",
  focus: ["XAUUSD", "FX", "Price Action"],

  // Add your links here (leave empty to hide). Example: "https://x.com/yourhandle"
  socials: {
    telegram: "",
    instagram: "",
    youtube: "",
    x: "",
    email: "",
  },
};

export const principles = [
  {
    title: "Process over prediction",
    body: "I don't need to know what happens next. I need a repeatable process that puts the odds on my side, trade after trade.",
  },
  {
    title: "Risk before reward",
    body: "Every position starts with where I'm wrong. Fixed risk per trade keeps any single outcome small and survivable.",
  },
  {
    title: "Consistency over impulse",
    body: "No revenge trades, no FOMO entries. Only setups that match the plan get taken — the rest is noise.",
  },
];

export const approach = [
  {
    step: "01",
    title: "Higher-timeframe bias",
    body: "Start from the daily and 4H to define direction, key levels and where price is likely drawn to. No bias, no trade.",
  },
  {
    step: "02",
    title: "Liquidity & structure confirmation",
    body: "Wait for liquidity to be taken and for a shift in market structure on the lower timeframe that agrees with the bias.",
  },
  {
    step: "03",
    title: "Risk-first execution",
    body: "Define the invalidation, size the position to a fixed % risk, and let the trade play out to the planned target or stop.",
  },
];

// Defaults used until you change them in /admin.
export const defaultSettings = {
  capital: 10000,
  riskPercent: 1,
};

// Instruments shown in the live market ticker (TradingView symbols).
export const tickerSymbols = [
  { proName: "OANDA:XAUUSD", title: "Gold" },
  { proName: "FX:EURUSD", title: "EUR/USD" },
  { proName: "FX:GBPUSD", title: "GBP/USD" },
  { proName: "FX:USDJPY", title: "USD/JPY" },
  { proName: "OANDA:XAGUSD", title: "Silver" },
  { proName: "TVC:DXY", title: "DXY" },
  { proName: "FX:AUDUSD", title: "AUD/USD" },
  { proName: "OANDA:US30USD", title: "US30" },
];

export const methodology = [
  "Returns are modelled using a fixed risk per trade (set in the dashboard) on the starting capital.",
  "Figures exclude commissions, swaps, spreads and slippage.",
  "This is a personal journal, not a verified broker statement.",
];
