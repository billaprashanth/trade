"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, Scramble, SectionHead, useMedia } from "./fx";
import { principles, site } from "@/lib/config";

/** Pinned section: vertical scroll drives the principles sideways. */
export default function Edge() {
  const desktop = useMedia("(min-width: 1024px)");
  return desktop ? <EdgeDesktop /> : <EdgeMobile />;
}

function EdgeDesktop() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const x = useTransform(p, [0, 1], ["0%", "-75%"]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  return (
    <section id="edge" ref={ref} className="relative z-10 h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div style={{ x }} className="flex w-[400vw]">
          <div className="flex w-screen shrink-0 items-center">
            <div className="wrap">
              <SectionHead index="01" label="Market edge" title="The mindset" accent="behind it" />
              <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-400">
                Three rules that decide every entry. Keep scrolling — they slide in one at a time.
              </p>
              <div className="mt-6 flex gap-2">
                {site.focus.map((f) => (
                  <span key={f} className="border border-cyan-400/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {principles.map((pr, i) => (
            <div key={pr.title} className="flex w-screen shrink-0 items-center px-[6vw]">
              <Panel i={i} title={pr.title} body={pr.body} big />
            </div>
          ))}
        </motion.div>

        <div className="wrap absolute bottom-10 left-0 right-0">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
            <span>01</span>
            <div className="relative h-px flex-1 bg-white/10">
              <motion.div style={{ width: bar }} className="absolute inset-y-0 left-0 bg-neon-400 shadow-[0_0_10px_#B8FF2C]" />
            </div>
            <span>03</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function EdgeMobile() {
  return (
    <section id="edge" className="relative z-10 py-24">
        <div className="wrap">
          <SectionHead index="01" label="Market edge" title="The mindset" accent="behind it" />
          <div className="mt-12 space-y-5">
            {principles.map((pr, i) => (
              <Reveal key={pr.title} delay={i * 0.05}>
                <Panel i={i} title={pr.title} body={pr.body} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
}

function Panel({ i, title, body, big }: { i: number; title: string; body: string; big?: boolean }) {
  return (
    <div className={`hud hud-corners grid w-full items-center gap-8 p-7 sm:p-10 ${big ? "lg:grid-cols-[1.1fr_1fr] lg:p-14" : ""}`}>
      <div>
        <div className="outline-text font-display text-7xl font-black leading-none sm:text-8xl lg:text-[10rem]">0{i + 1}</div>
        <h3 className="h-display mt-4 text-3xl sm:text-5xl lg:text-6xl">
          <Scramble text={title} />
        </h3>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">{body}</p>
      </div>
      <div className="aspect-[4/3] w-full border border-cyan-400/10 bg-void/60">
        {i === 0 && <ProcessViz />}
        {i === 1 && <RiskViz />}
        {i === 2 && <ConsistencyViz />}
      </div>
    </div>
  );
}

/* --- three looping mini animations --- */

function ProcessViz() {
  const steps = ["Bias defined", "Liquidity taken", "Structure shift", "Risk sized", "Execute"];
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6 font-mono text-xs sm:text-sm">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          className="flex items-center gap-3"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 1, 0.2] }}
          transition={{ duration: 6, times: [0, 0.1, 0.85, 1], delay: i * 0.6, repeat: Infinity, repeatDelay: 0 }}
        >
          <motion.span
            className="grid h-6 w-6 place-items-center border border-neon-400 text-neon-400"
            animate={{ backgroundColor: ["rgba(184,255,44,0)", "rgba(184,255,44,1)", "rgba(184,255,44,1)", "rgba(184,255,44,0)"], color: ["#B8FF2C", "#02040A", "#02040A", "#B8FF2C"] }}
            transition={{ duration: 6, times: [0, 0.1, 0.85, 1], delay: i * 0.6, repeat: Infinity }}
          >
            ✓
          </motion.span>
          <span className="text-slate-200">{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

function RiskViz() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <line x1="40" y1="170" x2="380" y2="170" stroke="#fff" strokeOpacity="0.5" strokeDasharray="4 4" />
      <text x="44" y="164" fill="#fff" fontSize="11" fontFamily="monospace">ENTRY</text>
      <motion.rect
        x="200" width="160" fill="#FF3D71" fillOpacity="0.2" stroke="#FF3D71"
        initial={{ y: 170, height: 0 }}
        animate={{ y: 170, height: [0, 50, 50, 0] }}
        transition={{ duration: 5, times: [0, 0.2, 0.9, 1], repeat: Infinity }}
      />
      <motion.rect
        x="200" width="160" fill="#2BFF9E" fillOpacity="0.2" stroke="#2BFF9E"
        animate={{ y: [170, 170, 20, 20, 170], height: [0, 0, 150, 150, 0] }}
        transition={{ duration: 5, times: [0, 0.25, 0.5, 0.9, 1], repeat: Infinity }}
      />
      <motion.text x="210" fill="#FF3D71" fontSize="12" fontFamily="monospace" animate={{ y: [200, 236, 236, 200], opacity: [0, 1, 1, 0] }} transition={{ duration: 5, times: [0, 0.2, 0.9, 1], repeat: Infinity }}>
        RISK 1R
      </motion.text>
      <motion.text x="210" y="44" fill="#2BFF9E" fontSize="12" fontFamily="monospace" animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 5, times: [0, 0.45, 0.55, 0.9, 1], repeat: Infinity }}>
        REWARD 3R
      </motion.text>
      <motion.path
        d="M40 230 L80 200 L110 215 L150 180 L190 170 L230 190 L260 140 L290 120 L320 80 L350 30"
        fill="none" stroke="#B8FF2C" strokeWidth="2.5"
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 5, times: [0, 0.6, 0.9, 1], repeat: Infinity }}
      />
    </svg>
  );
}

function ConsistencyViz() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      {[60, 120, 180, 240].map((y) => (
        <line key={y} x1="20" x2="380" y1={y} y2={y} stroke="#3DF2FF" strokeOpacity="0.08" />
      ))}
      <motion.path
        d="M20 160 L50 90 L80 210 L110 70 L140 240 L170 100 L200 260 L230 60 L260 250 L290 130 L320 280 L350 150 L380 270"
        fill="none" stroke="#FF3D71" strokeWidth="1.5" strokeOpacity="0.6"
        animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 5, times: [0, 0.6, 1], repeat: Infinity }}
      />
      <motion.path
        d="M20 250 L50 240 L80 232 L110 236 L140 215 L170 205 L200 208 L230 186 L260 170 L290 160 L320 140 L350 118 L380 96"
        fill="none" stroke="#2BFF9E" strokeWidth="3"
        style={{ filter: "drop-shadow(0 0 6px #2BFF9E)" }}
        animate={{ pathLength: [0, 1, 1] }}
        transition={{ duration: 5, times: [0, 0.8, 1], repeat: Infinity }}
      />
      <text x="24" y="40" fill="#FF3D71" fontSize="11" fontFamily="monospace" opacity="0.8">IMPULSE</text>
      <text x="24" y="290" fill="#2BFF9E" fontSize="11" fontFamily="monospace">CONSISTENCY</text>
    </svg>
  );
}
