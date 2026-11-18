"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Scramble, SectionHead, useMedia } from "./fx";
import { approach } from "@/lib/config";

/* A hand-built XAUUSD-style setup: uptrend → equal lows → sweep → BOS → entry → target. */
type K = [number, number, number, number]; // o h l c
const C: K[] = [
  [100, 102, 99, 101.5], [101.5, 105, 101, 104.5], [104.5, 106, 103, 103.5], [103.5, 108, 103, 107.5],
  [107.5, 111, 107, 110], [110, 111, 107.5, 108.5], [108.5, 113, 108, 112.5], [112.5, 116, 112, 115.5],
  [115.5, 117, 113.5, 114], [114, 119, 113.5, 118.5], [118.5, 123, 118, 122], [122, 125, 121, 124.5],
  [124.5, 126, 121.5, 122.5], [122.5, 124, 119.5, 120.5], // 0-13 bias
  [120.5, 121.5, 117.5, 118], [118, 119, 116, 116.8], [116.8, 120, 116.3, 119.5], [119.5, 121, 118, 118.5],
  [118.5, 119, 116.1, 116.6], [116.6, 119.5, 116.2, 119], [119, 120.5, 117.5, 118], [118, 118.6, 116, 116.4],
  [116.4, 117, 111.5, 117.6], // 22 sweep
  [117.6, 121, 117, 120.5], [120.5, 124, 120, 123.5], [123.5, 127, 123, 126.5], // 25 BOS
  [126.5, 127.5, 123.5, 124], // 26
  [124, 124.8, 121.2, 121.8], // 27 entry
  [121.8, 125, 121.4, 124.6], [124.6, 129, 124, 128.5], [128.5, 132, 127.5, 131], [131, 133, 129, 129.8],
  [129.8, 135, 129.5, 134.5], [134.5, 138, 133.5, 137.5], [137.5, 139, 135, 136], [136, 141, 135.5, 140.5],
  [140.5, 144, 139.5, 143.5], [143.5, 145, 141, 142], [142, 147, 141.5, 146.5], [146.5, 150, 145.5, 149],
  [149, 156, 148.5, 155.5], // 40 TP
];
const ENTRY = 122, SL = 111, TP = 155;
const W = 820, H = 500;
const x = (i: number) => 40 + i * 18.5;
const y = (p: number) => 470 - ((p - 96) / (160 - 96)) * 440;

function countFor(p: number) {
  if (p < 0.33) return Math.round(4 + (p / 0.33) * 10);
  if (p < 0.66) return Math.round(14 + ((p - 0.33) / 0.33) * 13);
  return Math.min(C.length, Math.round(27 + ((p - 0.66) / 0.3) * 14));
}

export default function Approach() {
  const desktop = useMedia("(min-width: 1024px)");
  return desktop ? <Pinned /> : <Stacked />;
}

function Pinned() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setP);
  const step = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;

  return (
    <section id="approach" ref={ref} className="relative z-10 h-[340vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="wrap grid w-full items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHead index="04" label="Approach" title="Three steps" accent="every time" compact />
            <div className="mt-8 space-y-2">
              {approach.map((a, i) => (
                <StepRow key={a.step} i={i} active={step === i} done={step > i} title={a.title} body={a.body} />
              ))}
            </div>
          </div>
          <div className="hud hud-corners p-3">
            <ChartHeader step={step} />
            <SetupChart count={countFor(p)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stacked() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, 1, { duration: 9, ease: "linear", repeat: Infinity, repeatDelay: 2, onUpdate: setP });
    return () => c.stop();
  }, [inView]);
  const step = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
  return (
    <section id="approach" className="relative z-10 py-24">
      <div className="wrap">
        <SectionHead index="04" label="Approach" title="Three steps" accent="every time" />
        <div ref={ref} className="hud hud-corners mt-10 p-2">
          <ChartHeader step={step} />
          <SetupChart count={countFor(p)} />
        </div>
        <div className="mt-6 space-y-2">
          {approach.map((a, i) => (
            <StepRow key={a.step} i={i} active={step === i} done={step > i} title={a.title} body={a.body} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepRow({ i, active, done, title, body }: { i: number; active: boolean; done: boolean; title: string; body: string }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.35, x: active ? 12 : 0 }}
      transition={{ duration: 0.5 }}
      className={clsx("relative border-l-2 py-3 pl-5", active ? "border-neon-400" : done ? "border-win/50" : "border-white/10")}
    >
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
        <span className={active ? "text-neon-400" : done ? "text-win" : "text-slate-500"}>
          {done ? "✓ done" : `step 0${i + 1}`}
        </span>
      </div>
      <div className="mt-1 font-display text-xl font-bold uppercase text-white sm:text-2xl">{title}</div>
      <AnimatePresence initial={false}>
        {active && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden text-sm leading-relaxed text-slate-400"
          >
            <span className="block pt-2">{body}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChartHeader({ step }: { step: number }) {
  const labels = ["HTF BIAS · 4H", "LIQUIDITY · 15M", "EXECUTION · 5M"];
  return (
    <div className="flex items-center justify-between border-b border-cyan-400/15 px-3 pb-3 pt-1 font-mono text-[10px] uppercase tracking-[0.2em]">
      <span className="text-white">
        XAUUSD <span className="text-slate-500">· setup replay</span>
      </span>
      <span className="text-neon-400">
        <Scramble key={step} text={labels[step]} duration={500} />
      </span>
    </div>
  );
}

function SetupChart({ count }: { count: number }) {
  const vis = C.slice(0, count);
  const last = vis[vis.length - 1];
  const lastI = vis.length - 1;
  const show = {
    bias: count >= 7,
    liq: count >= 22,
    sweep: count >= 23,
    bos: count >= 26,
    entry: count >= 28,
    tp: count >= 41,
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {[100, 110, 120, 130, 140, 150].map((v) => (
        <g key={v}>
          <line x1="30" x2={W - 50} y1={y(v)} y2={y(v)} stroke="#3DF2FF" strokeOpacity="0.06" />
          <text x={W - 44} y={y(v) + 3} fill="#475569" fontSize="10" fontFamily="monospace">{v}</text>
        </g>
      ))}

      {/* step 1: bias */}
      <AnimatePresence>
        {show.bias && (
          <motion.g key="bias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.line
              x1={x(0)} y1={y(98.5)} x2={x(13)} y2={y(119)}
              stroke="#3DF2FF" strokeWidth="1.5" strokeDasharray="6 5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
            />
            <rect x={x(0)} y={y(131)} width="150" height="20" fill="#3DF2FF" />
            <text x={x(0) + 8} y={y(131) + 14} fill="#02040A" fontSize="11" fontWeight="700" fontFamily="monospace">
              ▲ HTF BIAS: BULLISH
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* step 2: liquidity, sweep, BOS */}
      <AnimatePresence>
        {show.liq && (
          <motion.g key="liq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.line
              x1={x(15)} x2={x(22) + 8} y1={y(116)} y2={y(116)} stroke="#FFC53D" strokeWidth="1.5" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            />
            <text x={x(15)} y={y(116) + 16} fill="#FFC53D" fontSize="10" fontFamily="monospace">$$$ EQUAL LOWS = LIQUIDITY</text>
          </motion.g>
        )}
        {show.sweep && (
          <motion.g key="sweep" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ transformOrigin: `${x(22)}px ${y(111.5)}px` }}>
            <circle cx={x(22) + 5} cy={y(111.5)} r="12" fill="none" stroke="#FF3D71" strokeWidth="2" />
            <text x={x(22) - 12} y={y(111.5) + 28} fill="#FF3D71" fontSize="11" fontWeight="700" fontFamily="monospace">SWEEP</text>
          </motion.g>
        )}
        {show.bos && (
          <motion.g key="bos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.line
              x1={x(12)} x2={x(25) + 10} y1={y(126)} y2={y(126)} stroke="#B8FF2C" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            />
            <text x={x(18)} y={y(126) - 6} fill="#B8FF2C" fontSize="11" fontWeight="700" fontFamily="monospace">BOS ✓</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* step 3: execution boxes */}
      <AnimatePresence>
        {show.entry && (
          <motion.g key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.rect
              x={x(27)} y={y(ENTRY)} height={y(SL) - y(ENTRY)} fill="#FF3D71" fillOpacity="0.15" stroke="#FF3D71" strokeOpacity="0.6"
              initial={{ width: 0 }} animate={{ width: x(40) + 14 - x(27) }} transition={{ duration: 0.7 }}
            />
            <motion.rect
              x={x(27)} y={y(TP)} height={y(ENTRY) - y(TP)} fill="#2BFF9E" fillOpacity="0.1" stroke="#2BFF9E" strokeOpacity="0.6"
              initial={{ width: 0 }} animate={{ width: x(40) + 14 - x(27) }} transition={{ duration: 0.7, delay: 0.1 }}
            />
            <line x1={x(27)} x2={x(40) + 14} y1={y(ENTRY)} y2={y(ENTRY)} stroke="#fff" strokeWidth="1.5" />
            <text x={x(40) - 4} y={y(ENTRY) + 14} textAnchor="end" fill="#fff" fontSize="10" fontFamily="monospace">ENTRY {ENTRY.toFixed(1)}</text>
            <text x={x(40) - 4} y={y(SL) - 6} textAnchor="end" fill="#FF3D71" fontSize="10" fontFamily="monospace">SL {SL.toFixed(1)} · −1R</text>
            <text x={x(27) + 6} y={y(TP) + 14} fill="#2BFF9E" fontSize="10" fontFamily="monospace">TP {TP.toFixed(1)} · +3R</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* candles */}
      {vis.map(([o, h, l, c], i) => {
        const up = c >= o;
        const col = up ? "#2BFF9E" : "#FF3D71";
        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${x(i)}px ${y((o + c) / 2)}px` }}
          >
            <line x1={x(i) + 5} x2={x(i) + 5} y1={y(h)} y2={y(l)} stroke={col} strokeWidth="1.2" />
            <rect x={x(i)} y={y(Math.max(o, c))} width="10" height={Math.max(1.5, Math.abs(y(o) - y(c)))} fill={col} />
          </motion.g>
        );
      })}

      {/* live price line */}
      {last && (
        <g>
          <line x1={x(lastI) + 12} x2={W - 50} y1={y(last[3])} y2={y(last[3])} stroke="#B8FF2C" strokeOpacity="0.7" strokeDasharray="2 3" />
          <rect x={W - 50} y={y(last[3]) - 9} width="48" height="18" fill="#B8FF2C" />
          <text x={W - 46} y={y(last[3]) + 4} fill="#02040A" fontSize="10" fontWeight="700" fontFamily="monospace">
            {last[3].toFixed(1)}
          </text>
          <circle cx={x(lastI) + 5} cy={y(last[3])} r="4" fill="#B8FF2C">
            <animate attributeName="r" values="3;9;3" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      <AnimatePresence>
        {show.tp && (
          <motion.g
            key="tp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
          >
            <rect x={x(13)} y={y(153)} width="190" height="40" fill="#2BFF9E" />
            <text x={x(13) + 12} y={y(153) + 26} fill="#02040A" fontSize="18" fontWeight="900" fontFamily="monospace">
              +3.00R ✓ TARGET
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
