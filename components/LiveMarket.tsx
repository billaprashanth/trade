"use client";

import { motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Reveal, SectionHead } from "./fx";
import TradingViewChart from "./TradingViewChart";
import { tickerSymbols } from "@/lib/config";

const tabs = [
  { label: "XAUUSD", symbol: "OANDA:XAUUSD" },
  { label: "EURUSD", symbol: "FX:EURUSD" },
  { label: "GBPUSD", symbol: "FX:GBPUSD" },
  { label: "DXY", symbol: "TVC:DXY" },
];

export default function LiveMarket() {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <section id="market" className="relative z-10 py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead index="05" label="Live market" title="On my" accent="watchlist" />
          <div className="hud flex p-1">
            {tabs.map((t) => (
              <button
                key={t.label}
                onClick={() => setTab(t)}
                className={clsx(
                  "relative px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em]",
                  tab.label === t.label ? "text-void" : "text-slate-300 hover:text-white",
                )}
              >
                {tab.label === t.label && <motion.span layoutId="mkt-tab" className="absolute inset-0 bg-cyan-400" />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <Reveal className="mt-14">
          <div className="hud hud-corners overflow-hidden">
            <TickerTape />
            <div className="h-[520px] border-t border-cyan-400/15">
              <TradingViewChart symbol={tab.symbol} interval="240" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TickerTape = memo(function TickerTape() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      symbols: tickerSymbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    el.appendChild(s);
    return () => {
      el.innerHTML = "";
    };
  }, []);
  return <div ref={ref} className="tradingview-widget-container min-h-[46px]" />;
});
