"use client";

import { memo, useEffect, useRef } from "react";

/** Maps a plain instrument like "XAUUSD" or "EURUSD" to a TradingView symbol. */
export function toTvSymbol(instrument: string) {
  const s = instrument.toUpperCase().replace(/[^A-Z0-9:]/g, "");
  if (s.includes(":")) return s;
  if (["XAUUSD", "XAGUSD", "US30USD", "NAS100USD", "SPX500USD"].includes(s)) return `OANDA:${s}`;
  if (s === "DXY") return "TVC:DXY";
  if (s === "US30") return "OANDA:US30USD";
  if (s === "NAS100") return "OANDA:NAS100USD";
  if (/^[A-Z]{6}$/.test(s)) return `FX:${s}`;
  return s;
}

function TradingViewChart({ symbol, interval = "60" }: { symbol: string; interval?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: toTvSymbol(symbol),
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(2, 4, 10, 1)",
      gridColor: "rgba(61, 242, 255, 0.05)",
      hide_side_toolbar: true,
      allow_symbol_change: true,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, [symbol, interval]);

  return <div ref={ref} className="tradingview-widget-container h-full w-full" />;
}

export default memo(TradingViewChart);
