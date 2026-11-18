"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Counter, SampleBadge, Scramble, useReady } from "./fx";
import { site } from "@/lib/config";
import { fmt, type Stats } from "@/lib/stats";
import type { Trade } from "@/lib/types";

const WORDS = [
  { text: "TRADE", style: "text-white" },
  { text: "WITH", style: "outline-text" },
  { text: "BUNNY", style: "neon-text" },
];

export default function Hero({ stats, latest, isSample }: { stats: Stats; latest: Trade | null; isSample: boolean }) {
  const ready = useReady();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const blur = useTransform(scrollYProgress, [0, 0.7], ["blur(0px)", "blur(12px)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/75 via-void/30 to-transparent" />
      <motion.div style={{ y, filter: blur, opacity, scale }} className="wrap relative flex min-h-[100svh] flex-col pb-10 pt-28">
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="tag flex-wrap">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping2 rounded-full bg-win" />
              <span className="relative h-2 w-2 rounded-full bg-win" />
            </span>
            <Scramble text={`LIVE · INDEPENDENT TRADER · ${site.name.toUpperCase()}`} start={ready} />
          </span>
          {isSample && <SampleBadge />}
        </motion.div>

        <div className="mt-8 grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_380px] [&>*]:min-w-0">
          <h1 className="h-display select-none text-[17.5vw] sm:text-[16vw] lg:text-[11vw] xl:text-[10.5rem]">
            {WORDS.map((w, wi) => (
              <span key={w.text} className="block overflow-hidden">
                <span className={clsx("inline-flex", w.style)}>
                  {w.text.split("").map((ch, ci) => (
                    <motion.span
                      key={ci}
                      className="inline-block"
                      initial={{ y: "110%", rotateX: -80 }}
                      animate={ready ? { y: "0%", rotateX: 0 } : {}}
                      transition={{ duration: 1, delay: wi * 0.15 + ci * 0.045, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -18, color: "#3DF2FF", transition: { duration: 0.2 } }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <LiveFeed latest={latest} />
          </motion.div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end [&>*]:min-w-0">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ delay: 1.1 }}
              className="font-display text-xl font-semibold text-white sm:text-2xl"
            >
              <Typewriter text="Trading with patience, precision and discipline." start={ready} delay={1200} />
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400"
            >
              {site.intro}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.7, duration: 0.8 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <a href="#history" className="btn-neon" data-cursor="LOG">
                Explore trade log <span>→</span>
              </a>
              <a href="#performance" className="btn-line" data-cursor="STATS">
                View performance
              </a>
            </motion.div>
          </div>

          <motion.div
            initial="h"
            animate={ready ? "s" : "h"}
            variants={{ s: { transition: { staggerChildren: 0.12, delayChildren: 1.6 } } }}
            className="grid grid-cols-3 border-y border-white/10"
          >
            {[
              { k: "Trades", v: stats.closed, f: (n: number) => n.toFixed(0) },
              { k: "Win rate", v: stats.winRate, f: (n: number) => `${n.toFixed(1)}%` },
              { k: "Return", v: stats.totalReturn, f: (n: number) => fmt.pct(n, 1) },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                variants={{ h: { opacity: 0, y: 20 }, s: { opacity: 1, y: 0 } }}
                className={clsx("py-5", i > 0 && "border-l border-white/10 pl-5")}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">{s.k}</div>
                {ready && <Counter value={s.v} format={s.f} className="mt-1 block font-display text-2xl font-bold text-white sm:text-3xl" />}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 2.2 }}
          className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500"
        >
          <span className="relative block h-10 w-px overflow-hidden bg-white/10">
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-neon-400"
              animate={{ y: [-16, 40] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            />
          </span>
          Scroll to dive into the market
        </motion.div>
      </motion.div>
    </section>
  );
}

function Typewriter({ text, start, delay = 0 }: { text: string; start: boolean; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let i = 0;
    let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i++;
        setN(i);
        if (i >= text.length) clearInterval(iv);
      }, 38);
    }, delay);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [start, text, delay]);
  return (
    <>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] animate-blink bg-neon-400" />
    </>
  );
}

function LiveFeed({ latest }: { latest: Trade | null }) {
  return (
    <div className="hud hud-corners overflow-hidden">
      <div className="flex items-center justify-between border-b border-cyan-400/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em]">
        <span className="text-cyan-300">◉ Live feed</span>
        <span className="hidden text-slate-500 sm:inline">{site.focus.join(" / ")}</span>
      </div>
      {latest ? (
        <div className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Latest trade · {fmt.date(latest.date)}</div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="font-display text-3xl font-black text-white">{latest.instrument}</div>
              <div className={clsx("font-mono text-xs font-bold", latest.side === "Buy" ? "text-win" : "text-loss")}>
                {latest.side === "Buy" ? "▲ LONG" : "▼ SHORT"} · {latest.setup}
              </div>
            </div>
            <div className={clsx("font-display text-3xl font-black", latest.rr > 0 ? "text-win" : latest.rr < 0 ? "text-loss" : "text-white")}>
              {fmt.r(latest.rr)}
            </div>
          </div>
          <Spark up={latest.rr >= 0} />
        </div>
      ) : (
        <div className="flex items-center gap-5 p-5">
          <Radar />
          <div>
            <div className="font-display text-lg font-bold text-white">Awaiting next setup</div>
            <div className="mt-1 font-mono text-[11px] text-slate-400">Scanning liquidity & structure…</div>
          </div>
        </div>
      )}
      <div className="relative h-8 overflow-hidden border-t border-cyan-400/15">
        <div className="flex w-max animate-marquee gap-6 whitespace-nowrap py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          {Array.from({ length: 2 }).flatMap((_, r) =>
            ["Process > prediction", "Risk before reward", "Consistency > impulse", "Patience", "Precision", "Discipline"].map((t) => (
              <span key={`${r}-${t}`}>
                <span className="text-neon-400">✦</span> {t}
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

function Spark({ up }: { up: boolean }) {
  const d = up
    ? "M0 50 L20 46 L35 52 L55 38 L70 42 L90 28 L110 33 L130 18 L150 22 L175 8 L200 12"
    : "M0 12 L20 18 L35 10 L55 26 L70 22 L90 36 L110 30 L130 44 L150 40 L175 52 L200 48";
  const c = up ? "#2BFF9E" : "#FF3D71";
  return (
    <svg viewBox="0 0 200 60" className="mt-4 h-16 w-full">
      <motion.path
        d={d}
        fill="none"
        stroke={c}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 2.5 }}
        style={{ filter: `drop-shadow(0 0 6px ${c})` }}
      />
    </svg>
  );
}

function Radar() {
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-neon-400/40">
      <div className="absolute inset-3 rounded-full border border-neon-400/20" />
      <div className="absolute inset-7 rounded-full border border-neon-400/20" />
      <div className="absolute inset-0 animate-radar" style={{ background: "conic-gradient(from 0deg, rgba(184,255,44,0.5), transparent 25%)" }} />
      <span className="absolute left-[30%] top-[35%] h-1.5 w-1.5 animate-ping2 rounded-full bg-neon-400" />
      <span className="absolute left-[62%] top-[60%] h-1 w-1 rounded-full bg-cyan-400" />
    </div>
  );
}
