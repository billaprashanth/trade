"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import clsx from "clsx";
import TradingViewChart from "./TradingViewChart";
import { ResultTag, SideTag } from "./Tags";
import { fmt } from "@/lib/stats";
import type { Settings, Trade } from "@/lib/types";

export default function TradeModal({ trade, settings, onClose }: { trade: Trade | null; settings: Settings; onClose: () => void }) {
  useEffect(() => {
    if (!trade) return;
    const l = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    l?.stop();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("keydown", k);
      l?.start();
    };
  }, [trade, onClose]);

  const riskAmount = (settings.capital * settings.riskPercent) / 100;

  return (
    <AnimatePresence>
      {trade && (
        <motion.div
          className="fixed inset-0 z-[160] flex items-end justify-center bg-void/80 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Trade chart"
          data-lenis-prevent
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ clipPath: "inset(50% 0 50% 0)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0 0% 0)", opacity: 1 }}
            exit={{ clipPath: "inset(50% 0 50% 0)", opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="hud hud-corners max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-void-900"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-400/15 bg-void-900/95 px-5 py-4 backdrop-blur sm:px-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl font-black text-white">{trade.instrument}</span>
                <SideTag side={trade.side} />
                <ResultTag rr={trade.rr} />
                <span className="font-mono text-xs text-slate-400">{fmt.date(trade.date)}</span>
              </div>
              <button onClick={onClose} data-cursor="CLOSE" className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-neon-400">
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-px bg-cyan-400/10 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Setup", trade.setup],
                ["Entry", fmt.price(trade.entry)],
                ["Stop loss", trade.stopLoss ? fmt.price(trade.stopLoss) : "—"],
                ["Exit", fmt.price(trade.exit)],
                ["R:R", fmt.r(trade.rr)],
                ["P&L (modelled)", fmt.signedMoney(trade.rr * riskAmount)],
              ].map(([k, v], i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="bg-void-900 px-5 py-4"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{k}</div>
                  <div
                    className={clsx(
                      "mt-1 font-mono text-sm font-bold",
                      k === "P&L (modelled)" ? (trade.rr > 0 ? "text-win" : trade.rr < 0 ? "text-loss" : "text-white") : "text-white",
                    )}
                  >
                    {v}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-5 sm:p-7">
              <div className="overflow-hidden border border-cyan-400/15 bg-void">
                {trade.chartUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={trade.chartUrl} alt={`${trade.instrument} trade chart`} className="w-full" />
                ) : (
                  <div className="h-[420px]">
                    <TradingViewChart symbol={trade.instrument} />
                  </div>
                )}
              </div>
              {!trade.chartUrl && <p className="mt-2 font-mono text-[11px] text-slate-500"># live chart shown — no screenshot attached</p>}
              {trade.notes && (
                <div className="mt-5 border-l-2 border-neon-400 bg-white/[0.02] p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-400">Trade notes</div>
                  <p className="mt-2 whitespace-pre-line font-mono text-sm leading-relaxed text-slate-300">{trade.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
