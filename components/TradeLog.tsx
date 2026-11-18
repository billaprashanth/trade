"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Reveal, SampleBadge, SectionHead } from "./fx";
import TradeModal from "./TradeModal";
import { ResultTag, SideTag } from "./Tags";
import { fmt } from "@/lib/stats";
import type { Settings, Trade } from "@/lib/types";

const filters = ["All", "Wins", "Losses"] as const;
type Filter = (typeof filters)[number];

export default function TradeLog({ trades, settings, isSample }: { trades: Trade[]; settings: Settings; isSample: boolean }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Trade | null>(null);
  const [limit, setLimit] = useState(12);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return trades.filter((t) => {
      if (filter === "Wins" && t.rr <= 0) return false;
      if (filter === "Losses" && t.rr >= 0) return false;
      return !s || [t.instrument, t.setup, t.side, t.date].some((v) => v.toLowerCase().includes(s));
    });
  }, [trades, filter, q]);

  const counts = { All: trades.length, Wins: trades.filter((t) => t.rr > 0).length, Losses: trades.filter((t) => t.rr < 0).length };

  return (
    <section id="history" className="relative z-10 py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead index="03" label="Trade log" title="Every trade" accent="on record" />
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {isSample && <SampleBadge />}
            <div className="flex flex-wrap gap-3">
              <div className="hud flex items-center px-3">
                <span className="font-mono text-xs text-neon-400">$</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="grep pair / setup"
                  className="w-44 bg-transparent px-2 py-3 font-mono text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>
              <div className="hud flex p-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={clsx(
                      "relative px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition-colors",
                      filter === f ? "text-void" : "text-slate-300 hover:text-white",
                    )}
                  >
                    {filter === f && (
                      <motion.span layoutId="log-filter" className="absolute inset-0 bg-neon-400" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                    )}
                    <span className="relative">
                      {f} <span className="opacity-60">{counts[f]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {shown.length > 0 ? (
          <motion.div layout className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" style={{ perspective: 1200 }}>
            <AnimatePresence mode="popLayout">
              {shown.slice(0, limit).map((t, i) => (
                <TradeTicket key={t.id} t={t} i={i} risk={settings.riskPercent} onOpen={() => setSel(t)} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <Reveal className="mt-14">
            <Empty hasTrades={trades.length > 0} />
          </Reveal>
        )}

        {shown.length > limit && (
          <div className="mt-10 flex justify-center">
            <button onClick={() => setLimit((l) => l + 12)} className="btn-line" data-cursor="MORE">
              Load more trades ({shown.length - limit})
            </button>
          </div>
        )}
      </div>
      <TradeModal trade={sel} settings={settings} onClose={() => setSel(null)} />
    </section>
  );
}

function TradeTicket({ t, i, risk, onOpen }: { t: Trade; i: number; risk: number; onOpen: () => void }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 250, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 250, damping: 20 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const tone = t.rr > 0 ? "43,255,158" : t.rr < 0 ? "255,61,113" : "148,163,184";
  const glow = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, rgba(${tone},0.18), transparent 65%)`;

  return (
    <motion.button
      layout
      onClick={onOpen}
      data-cursor="OPEN"
      initial={{ opacity: 0, rotateX: -70, y: 60 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className="hud group relative overflow-hidden p-5 text-left transition-colors hover:border-white/25"
    >
      <motion.div aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full -translate-y-full bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent group-hover:animate-scan" />

      <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        <span>{fmt.date(t.date)}</span>
        <ResultTag rr={t.rr} />
      </div>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-3xl font-black text-white">{t.instrument}</div>
          <div className="mt-1 flex items-center gap-2">
            <SideTag side={t.side} />
            <span className="truncate font-mono text-[11px] text-slate-400">{t.setup}</span>
          </div>
        </div>
        <div className={clsx("font-display text-3xl font-black", t.rr > 0 ? "text-win" : t.rr < 0 ? "text-loss" : "text-slate-300")}>
          {fmt.pct(t.rr * risk, 1)}
        </div>
      </div>
      <TradePath t={t} />
      <div className="relative grid grid-cols-3 gap-px bg-white/5 font-mono text-[10px]">
        {[
          ["Entry", fmt.price(t.entry)],
          ["Exit", fmt.price(t.exit)],
          ["R:R", fmt.r(t.rr)],
        ].map(([k, v]) => (
          <div key={k} className="bg-void-900 px-2 py-2">
            <div className="uppercase tracking-[0.15em] text-slate-500">{k}</div>
            <div className="mt-0.5 font-bold text-white">{v}</div>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

/** Tiny schematic of the trade: SL zone, entry, path to exit. */
function TradePath({ t }: { t: Trade }) {
  const up = t.rr >= 0;
  const color = t.rr > 0 ? "#2BFF9E" : t.rr < 0 ? "#FF3D71" : "#94a3b8";
  const rr = Math.max(-1.5, Math.min(4, t.rr));
  // vertical scale: entry at 60% height, 1R = 14px
  const entryY = 58;
  const exitY = entryY - rr * 14;
  const slY = entryY + 14;
  const mid = (entryY + exitY) / 2;
  const d = `M8 ${entryY} C 60 ${entryY + 8}, 90 ${mid + (up ? 10 : -10)}, 140 ${mid} S 220 ${exitY + (up ? 6 : -6)}, 252 ${exitY}`;
  return (
    <svg viewBox="0 0 260 90" className="relative my-4 h-20 w-full">
      <rect x="8" y={entryY} width="244" height={slY - entryY} fill="#FF3D71" opacity="0.08" />
      <line x1="8" x2="252" y1={slY} y2={slY} stroke="#FF3D71" strokeOpacity="0.5" strokeDasharray="3 3" />
      <line x1="8" x2="252" y1={entryY} y2={entryY} stroke="#fff" strokeOpacity="0.35" strokeDasharray="3 3" />
      <text x="10" y={slY + 10} fill="#FF3D71" fontSize="8" fontFamily="monospace" opacity="0.7">SL</text>
      <motion.path
        d={d} fill="none" stroke={color} strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <motion.circle cx="252" cy={exitY} r="3.5" fill={color} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.6 }} />
    </svg>
  );
}

function Empty({ hasTrades }: { hasTrades: boolean }) {
  return (
    <div className="hud hud-corners flex flex-col items-center gap-6 px-6 py-20 text-center">
      <div className="relative h-40 w-40 overflow-hidden rounded-full border border-neon-400/40">
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute rounded-full border border-neon-400/15" style={{ inset: `${(i + 1) * 18}px` }} />
        ))}
        <div className="absolute inset-0 animate-radar" style={{ background: "conic-gradient(from 0deg, rgba(184,255,44,0.45), transparent 22%)" }} />
        <div className="absolute left-1/2 top-0 h-full w-px bg-neon-400/15" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-neon-400/15" />
        <span className="absolute left-[28%] top-[38%] h-2 w-2 animate-ping2 rounded-full bg-neon-400" />
        <span className="absolute left-[65%] top-[62%] h-1.5 w-1.5 animate-ping2 rounded-full bg-cyan-400 [animation-delay:600ms]" />
      </div>
      <div>
        <div className="font-display text-2xl font-black uppercase text-white">
          {hasTrades ? "No matches" : "No trade records yet"}
        </div>
        <div className="mt-2 font-mono text-xs text-slate-400">
          {hasTrades ? "Try a different filter." : "Scanning markets for the next A+ setup…"}
          <span className="animate-blink">_</span>
        </div>
      </div>
    </div>
  );
}
