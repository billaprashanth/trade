"use client";

import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useState } from "react";

const lines = [
  "> connecting to market feed",
  "> loading XAUUSD · FX streams",
  "> syncing trade journal",
  "> calibrating risk engine",
];

export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const w = window as unknown as { __twbReady?: boolean };
    const finish = () => {
      w.__twbReady = true;
      window.dispatchEvent(new Event("twb:ready"));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      finish();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const c = animate(0, 100, {
      duration: 2.1,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setPct(Math.round(v)),
      onComplete: () =>
        setTimeout(() => {
          setDone(true);
          document.documentElement.style.overflow = "";
          finish();
        }, 250),
    });
    return () => {
      c.stop();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[200] flex flex-col" exit={{ pointerEvents: "none" }}>
          <motion.div
            className="relative flex-1 bg-void-900"
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
              <div className="space-y-1 font-mono text-[11px] text-cyan-300/80 sm:text-xs">
                {lines.map((l, i) => (
                  <motion.div
                    key={l}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: pct > i * 22 ? 1 : 0, x: pct > i * 22 ? 0 : -10 }}
                  >
                    {l} {pct > i * 22 + 20 ? <span className="text-neon-400">[ OK ]</span> : <span className="animate-blink">_</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative flex-1 bg-void-900"
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="absolute left-0 right-0 top-0 p-6 sm:p-12">
              <div className="flex items-end justify-between">
                <div className="h-display text-4xl sm:text-7xl">
                  TRADE<span className="neon-text">/</span>BUNNY
                </div>
                <div className="font-display text-6xl font-black tabular-nums text-neon-400 sm:text-9xl">
                  {String(pct).padStart(3, "0")}
                </div>
              </div>
            </div>
          </motion.div>

          {/* price line drawing across the seam */}
          <motion.svg
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="absolute left-0 top-1/2 h-24 w-full -translate-y-1/2"
            exit={{ opacity: 0 }}
          >
            <path
              d="M0 70 L80 60 L130 72 L210 40 L260 55 L330 30 L380 48 L450 22 L520 50 L580 35 L650 60 L720 28 L790 38 L860 12 L930 26 L1000 8"
              fill="none"
              stroke="#B8FF2C"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - pct / 100}
              style={{ filter: "drop-shadow(0 0 8px #B8FF2C)" }}
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
