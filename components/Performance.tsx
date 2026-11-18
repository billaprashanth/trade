"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Counter, Reveal, SampleBadge, SectionHead } from "./fx";
import { methodology } from "@/lib/config";
import { fmt, type EquityPoint, type Stats } from "@/lib/stats";
import type { Settings } from "@/lib/types";

export default function Performance({ stats, settings, isSample }: { stats: Stats; settings: Settings; isSample: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const cmd = `./analyze --capital ${settings.capital} --risk ${settings.riskPercent}% --trades ${stats.closed}`;
  const [typed, setTyped] = useState(0);
  const done = typed >= cmd.length;

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(i);
      if (i >= cmd.length) clearInterval(iv);
    }, 22);
    return () => clearInterval(iv);
  }, [inView, cmd.length]);

  const pf = stats.profitFactor;
  const big = [
    { k: "Closed trades", v: stats.closed, f: (n: number) => n.toFixed(0), bar: Math.min(1, stats.closed / 50), c: "bg-cyan-400" },
    { k: "Win rate", v: stats.winRate, f: (n: number) => `${n.toFixed(1)}%`, bar: stats.winRate / 100, c: "bg-neon-400" },
    {
      k: "Net P&L",
      v: stats.netPnl,
      f: fmt.signedMoney,
      bar: Math.min(1, Math.abs(stats.totalReturn) / 30),
      c: stats.netPnl >= 0 ? "bg-win" : "bg-loss",
      tone: stats.netPnl > 0 ? "text-win" : stats.netPnl < 0 ? "text-loss" : "",
    },
    { k: "Profit factor", v: pf ?? 0, f: (n: number) => (pf === null ? "∞" : n.toFixed(2)), bar: Math.min(1, (pf ?? 3) / 4), c: "bg-neon-400" },
  ];

  const small = [
    ["Capital", fmt.money(settings.capital)],
    ["Risk / trade", `${settings.riskPercent}%`],
    ["Risk amount", fmt.money(stats.riskAmount)],
    ["Avg R", stats.closed ? fmt.r(stats.avgR) : "—"],
    ["Best trade", stats.closed ? fmt.r(stats.bestR) : "—"],
    ["Max drawdown", stats.closed ? `${stats.maxDrawdown.toFixed(2)}%` : "—"],
    ["Win streak", String(stats.longestWinStreak)],
    ["Ending equity", fmt.money(stats.endingEquity)],
  ];

  return (
    <section id="performance" className="relative z-10 py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead index="02" label="Performance" title="The numbers" accent="update live" />
          {isSample && <SampleBadge />}
        </div>

        <Reveal className="mt-14">
          <div ref={ref} className="hud hud-corners overflow-hidden shadow-[0_0_80px_-20px_rgba(61,242,255,0.25)]">
            {/* window chrome */}
            <div className="flex items-center gap-3 border-b border-cyan-400/15 bg-void-850/80 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-loss" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-win" />
              <span className="ml-3 font-mono text-[11px] text-slate-500">bunny@desk: ~/journal/performance</span>
              <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-win">
                <span className="h-1.5 w-1.5 animate-ping2 rounded-full bg-win" /> live
              </span>
            </div>

            <div className="p-5 sm:p-8">
              <div className="font-mono text-xs text-slate-300 sm:text-sm">
                <span className="text-neon-400">➜</span> <span className="text-cyan-300">~</span> {cmd.slice(0, typed)}
                {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-neon-400" />}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={done ? { opacity: 1 } : {}}
                transition={{ duration: 0.4 }}
                className="mt-6"
              >
                <div className="grid grid-cols-2 gap-px bg-cyan-400/10 lg:grid-cols-4">
                  {big.map((b, i) => (
                    <div key={b.k} className="bg-void-900/90 p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">{b.k}</div>
                      {done && (
                        <Counter
                          value={b.v}
                          format={b.f}
                          delay={i * 120}
                          className={clsx("mt-2 block font-display text-2xl font-black sm:text-4xl", b.tone || "text-white")}
                        />
                      )}
                      <div className="mt-4 h-1 bg-white/5">
                        <motion.div
                          className={clsx("h-full", b.c)}
                          initial={{ width: 0 }}
                          animate={done ? { width: `${Math.max(2, b.bar * 100)}%` } : {}}
                          transition={{ duration: 1.4, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-px grid gap-px bg-cyan-400/10 lg:grid-cols-[1fr_340px]">
                  <div className="bg-void-900/90 p-5">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Equity curve</div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Total modelled return</div>
                        {done && (
                          <Counter
                            value={stats.totalReturn}
                            format={(n) => fmt.pct(n)}
                            className={clsx(
                              "font-display text-2xl font-black",
                              stats.totalReturn > 0 ? "text-win" : stats.totalReturn < 0 ? "text-loss" : "text-white",
                            )}
                          />
                        )}
                      </div>
                    </div>
                    <EquityChart data={stats.curve} capital={settings.capital} play={done} />
                  </div>
                  <div className="bg-void-900/90 p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Hit rate</div>
                    <Gauge wins={stats.wins} losses={stats.losses} be={stats.breakeven} play={done} />
                  </div>
                </div>

                <div className="mt-px grid grid-cols-2 gap-px bg-cyan-400/10 sm:grid-cols-4 lg:grid-cols-8">
                  {small.map(([k, v], i) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, y: 10 }}
                      animate={done ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="bg-void-900/90 px-4 py-3"
                    >
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{k}</div>
                      <div className="mt-1 font-mono text-sm font-bold text-white">{v}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 space-y-1 font-mono text-[11px] text-slate-500">
                  {methodology.map((m) => (
                    <div key={m}># {m}</div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function EquityChart({ data, capital, play }: { data: EquityPoint[]; capital: number; play: boolean }) {
  const W = 800;
  const H = 300;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const [hover, setHover] = useState<number | null>(null);
  const empty = data.length < 2;

  const { pts, path, area, yTicks, y0 } = useMemo(() => {
    const eq = data.map((d) => d.equity);
    let min = Math.min(capital, ...eq);
    let max = Math.max(capital, ...eq);
    const span = max - min || capital * 0.02;
    min -= span * 0.12;
    max += span * 0.12;
    const n = Math.max(1, data.length - 1);
    const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
    const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    const pts = data.map((d, i) => ({ x: x(i), y: y(d.equity), d }));
    const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const area = `${path} L${pts[pts.length - 1].x} ${H - pad.b} L${pts[0].x} ${H - pad.b} Z`;
    const yTicks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4).map((v) => ({ v, y: y(v) }));
    return { pts, path, area, yTicks, y0: y(capital) };
  }, [data, capital, pad.l, pad.r, pad.t, pad.b]);

  const last = pts[pts.length - 1];
  const up = last.d.equity >= capital;
  const color = up ? "#2BFF9E" : "#FF3D71";
  const h = hover !== null ? pts[hover] : null;

  return (
    <div className="relative mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        onPointerMove={(e) => {
          if (empty) return;
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          let best = 0;
          pts.forEach((p, i) => {
            if (Math.abs(p.x - px) < Math.abs(pts[best].x - px)) best = i;
          });
          setHover(best);
        }}
        onPointerLeave={() => setHover(null)}
        data-cursor="INSPECT"
      >
        <defs>
          <linearGradient id="eqfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t) => (
          <g key={t.y}>
            <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="#3DF2FF" strokeOpacity="0.07" />
            <text x={pad.l - 8} y={t.y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
              ${(t.v / 1000).toFixed(2)}k
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y0} y2={y0} stroke="#B8FF2C" strokeOpacity="0.35" strokeDasharray="5 5" />

        {empty ? (
          <>
            <motion.line
              x1={pad.l} x2={W - pad.r} y1={y0} y2={y0}
              stroke="#3DF2FF" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={play ? { pathLength: 1 } : {}} transition={{ duration: 1.5 }}
            />
            <text x={W / 2} y={y0 - 16} textAnchor="middle" fill="#3DF2FF" fontSize="13" fontFamily="monospace" className="animate-blink">
              AWAITING DATA — CURVE DRAWS AS TRADES ARE LOGGED
            </text>
          </>
        ) : (
          <>
            <motion.path d={area} fill="url(#eqfill)" initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={{ delay: 1.2, duration: 1 }} />
            <motion.path
              d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
              initial={{ pathLength: 0 }} animate={play ? { pathLength: 1 } : {}} transition={{ duration: 2, ease: "easeInOut" }}
            />
            {pts.map((p, i) =>
              i === 0 ? null : (
                <motion.circle
                  key={i} cx={p.x} cy={p.y} r="2.5" fill={p.d.equity >= pts[i - 1].d.equity ? "#2BFF9E" : "#FF3D71"}
                  initial={{ scale: 0 }} animate={play ? { scale: 1 } : {}} transition={{ delay: 0.2 + (i / pts.length) * 1.8 }}
                />
              ),
            )}
            <motion.g initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={{ delay: 2 }}>
              <circle cx={last.x} cy={last.y} r="10" fill={color} opacity="0.25">
                <animate attributeName="r" values="5;16;5" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx={last.x} cy={last.y} r="4.5" fill={color} />
            </motion.g>
            {h && (
              <g>
                <line x1={h.x} x2={h.x} y1={pad.t} y2={H - pad.b} stroke="#3DF2FF" strokeOpacity="0.5" strokeDasharray="3 3" />
                <circle cx={h.x} cy={h.y} r="5" fill="#02040A" stroke="#3DF2FF" strokeWidth="2" />
              </g>
            )}
          </>
        )}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-2 border border-cyan-400/40 bg-void-900/95 px-3 py-2 font-mono text-[11px]"
          style={{ left: `${Math.min(75, (h.x / W) * 100)}%` }}
        >
          <div className="text-slate-400">{h.d.index === 0 ? "Start" : `Trade #${h.d.index} · ${fmt.date(h.d.label)}`}</div>
          <div className="font-bold text-white">
            {fmt.money(h.d.equity)} <span className={h.d.returnPct >= 0 ? "text-win" : "text-loss"}>{fmt.pct(h.d.returnPct)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Gauge({ wins, losses, be, play }: { wins: number; losses: number; be: number; play: boolean }) {
  const total = wins + losses + be;
  const R = 70;
  const C = 2 * Math.PI * R;
  const wf = total ? wins / total : 0;
  const lf = total ? losses / total : 0;
  return (
    <div className="flex flex-col items-center">
      <div className="relative mt-2 w-full max-w-[240px]">
        <svg viewBox="0 0 200 200" className="w-full -rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          <circle cx="100" cy="100" r={R + 16} fill="none" stroke="#3DF2FF" strokeOpacity="0.15" strokeDasharray="2 6" />
          <motion.circle
            cx="100" cy="100" r={R} fill="none" stroke="#2BFF9E" strokeWidth="14" strokeDasharray={C}
            initial={{ strokeDashoffset: C }} animate={play ? { strokeDashoffset: C * (1 - wf) } : {}}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: "drop-shadow(0 0 6px #2BFF9E)" }}
          />
          <motion.circle
            cx="100" cy="100" r={R} fill="none" stroke="#FF3D71" strokeWidth="14" strokeDasharray={C}
            transform={`rotate(${wf * 360} 100 100)`}
            initial={{ strokeDashoffset: C }}
            animate={play ? { strokeDashoffset: C * (1 - lf) } : {}}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            {play && <Counter value={total ? wf * 100 : 0} format={(n) => `${n.toFixed(0)}%`} className="block font-display text-4xl font-black text-white" />}
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">win rate</div>
          </div>
        </div>
      </div>
      <div className="mt-4" />
      <div className="grid w-full grid-cols-3 gap-px bg-cyan-400/10 font-mono text-[10px] uppercase tracking-[0.15em]">
        {[
          ["Wins", wins, "text-win"],
          ["Losses", losses, "text-loss"],
          ["B/E", be, "text-slate-300"],
        ].map(([k, v, c]) => (
          <div key={k as string} className="bg-void-900 py-2 text-center">
            <div className="text-slate-500">{k}</div>
            <div className={clsx("mt-0.5 text-base font-bold", c as string)}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
