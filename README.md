# Trade with Bunny: animated 3D trader portfolio

A fully dynamic, highly animated portfolio and public trade journal for **Sai Srinivas · Trade with Bunny**.
It's built with Next.js 15, Three.js (React Three Fiber), Framer Motion, Lenis smooth scroll and Tailwind CSS, and it's ready to deploy on Vercel.

## What's inside

- **Live 3D market background (WebGL):** layers of candlestick charts stream across the whole page at different depths. The newest candle ticks live, a neon grid floor rushes forward, data particles drift, and **the camera dives through the charts as you scroll**. The mouse tilts the view.
- **Boot preloader:** terminal-style loading lines, a percentage counter and a price line drawing across the screen, then the screen splits open.
- **Crosshair cursor:** a TradingView-style crosshair with a live "price" label and a UTC time label. It morphs over buttons.
- **Hero:** letters drop in one by one, the tagline types itself out, a "live feed" card shows the latest trade (or a radar "scanning" animation), and stats count up.
- **Nav:** shows which forex sessions (Sydney, Tokyo, London, New York) are open right now, plus a UTC clock. It opens a fullscreen menu.
- **Velocity marquee:** text speeds up and skews with how fast you scroll.
- **Edge:** a pinned section where scrolling down slides the three principles sideways, each with its own looping animation.
- **Performance terminal:** a command types itself, then the stats appear. It includes a self-drawing equity curve with hover inspect and an animated win-rate gauge. Everything is **computed live from your trades**.
- **Trade log:** 3D tilt "trade tickets", each with an animated mini trade path. It has filters and search. Click a ticket to open a popup with a live TradingView chart or your screenshot.
- **Approach:** a pinned **setup replay**. As you scroll, a chart builds candle by candle through the three steps: HTF bias, liquidity sweep plus BOS, then entry/SL/TP with the target hit.
- **Live market:** a TradingView ticker plus a chart with tabs for XAUUSD, EURUSD, GBPUSD and DXY.
- **Footer:** live clocks for each session showing open/closed, and giant interactive letters.
- **/admin:** a password-protected dashboard to add, edit and delete trades. The site updates instantly.
- Respects the reduced-motion setting, and falls back gracefully if WebGL isn't available. On phones the 3D scene uses fewer layers.

## 1. Run locally

```bash
npm install
cp .env.example .env.local      # then set ADMIN_PASSWORD
npm run dev                     # http://localhost:3000
```

Open `http://localhost:3000/admin`, log in, and add trades. Locally they're saved to `data/trades.json`.

To preview the design with **clearly labelled sample trades**, set `SHOW_SAMPLE_DATA=true`. The sample data disappears once you add a real trade.

## 2. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, go to **Add New → Project**, import the repo and keep the default settings (it's detected as Next.js).
3. Under **Settings → Environment Variables**, add `ADMIN_PASSWORD` with a strong password.
4. **Connect a database so trades can be saved in production.** Go to **Storage → Create Database → Upstash → Redis**. The free plan is enough. Connect it to this project, and Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
5. **Redeploy** (Deployments → ⋯ → Redeploy).
6. Go to `https://your-site.vercel.app/admin`, log in, and add your first trade.

> Without step 4 the site still works, but it's read-only on Vercel, because Vercel's file system can't be written to.
> The admin page tells you if no database is connected.

## 3. Customise

| What | Where |
|---|---|
| Name, tagline, intro, focus tags, social links | `lib/config.ts` → `site` |
| Principles and the 3-step approach text | `lib/config.ts` → `principles`, `approach` |
| Default capital and risk % | `lib/config.ts` → `defaultSettings` (or change them in /admin) |
| Ticker symbols | `lib/config.ts` → `tickerSymbols` |
| Colours (neon / cyan / win / loss) | `tailwind.config.ts` |
| 3D background (speed, layers, colours) | `components/MarketScene.tsx` |

## How returns are calculated

- Each trade stores its **realised R** (for example +2.5 for a win, -1 for a full stop, 0 for breakeven). The admin form fills it in from entry, stop loss and exit.
- Return % = R × risk %. P&L = R × (capital × risk %).
- The growth curve adds up the P&L from the starting capital.
- Figures exclude fees, swaps and slippage. They're a journal, not a verified broker statement. For third-party verification, link a Myfxbook or FX Blue account in `site.socials`.

## API

| Method | Route | Auth |
|---|---|---|
| GET | `/api/trades` | public: trades, settings, computed stats |
| POST | `/api/trades` | `x-admin-key` header |
| PUT / DELETE | `/api/trades/:id` | `x-admin-key` header |
| PUT | `/api/settings` | `x-admin-key` header |
