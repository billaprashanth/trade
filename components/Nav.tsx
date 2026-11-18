"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { site } from "@/lib/config";
import { sessionOpen, sessions } from "@/lib/sessions";

const links = [
  { id: "top", label: "Home", n: "00" },
  { id: "edge", label: "Edge", n: "01" },
  { id: "performance", label: "Performance", n: "02" },
  { id: "history", label: "Trade log", n: "03" },
  { id: "approach", label: "Approach", n: "04" },
  { id: "market", label: "Live market", n: "05" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 300 && !open);
  });

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const l = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    if (open) l?.stop();
    else l?.start();
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    const l = (window as unknown as { __lenis?: { scrollTo(t: string | number | HTMLElement, o?: object): void } }).__lenis;
    setTimeout(() => {
      if (id === "top") {
        if (l) l.scrollTo(0, { duration: 1.6 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      if (l) l.scrollTo(el, { offset: -40, duration: 1.6 });
      else el.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[90]"
      >
        <div className="wrap flex items-center justify-between py-4">
          <button onClick={() => go("top")} className="group flex items-center gap-3" data-cursor="HOME">
            <svg viewBox="0 0 40 40" className="h-9 w-9">
              <rect x="0.5" y="0.5" width="39" height="39" fill="none" stroke="#3DF2FF" strokeOpacity="0.4" />
              <motion.path
                d="M5 30 L13 22 L19 26 L27 12 L35 16"
                fill="none"
                stroke="#B8FF2C"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 2.4 }}
                className="drop-shadow-[0_0_6px_#B8FF2C]"
              />
            </svg>
            <span className="hidden text-left font-mono text-[10px] uppercase leading-tight tracking-[0.25em] sm:block">
              <span className="block text-white">{site.name}</span>
              <span className="block text-neon-400">{site.brand}</span>
            </span>
          </button>

          <div className="hud hidden items-center gap-4 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] md:flex">
            {now &&
              sessions.map((s) => {
                const o = sessionOpen(s, now);
                return (
                  <span key={s.code} className="flex items-center gap-1.5" title={`${s.name} session`}>
                    <span className="relative flex h-1.5 w-1.5">
                      {o && <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-win" />}
                      <span className={clsx("relative h-1.5 w-1.5 rounded-full", o ? "bg-win" : "bg-slate-600")} />
                    </span>
                    <span className={o ? "text-white" : "text-slate-500"}>{s.code}</span>
                  </span>
                );
              })}
            <span className="h-3 w-px bg-white/15" />
            <span className="tabular-nums text-cyan-300">{now ? now.toISOString().slice(11, 19) : "--:--:--"} UTC</span>
          </div>

          <button
            onClick={() => setOpen(true)}
            data-cursor="MENU"
            className="group flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white"
          >
            <span className="hidden sm:inline">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-7 bg-neon-400 transition-all group-hover:w-5" />
              <span className="block h-0.5 w-5 bg-white transition-all group-hover:w-7" />
            </span>
          </button>
        </div>
        <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-gradient-to-r from-neon-400 to-cyan-400" />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] overflow-hidden bg-void-900"
            initial={{ clipPath: "circle(0% at 95% 4%)" }}
            animate={{ clipPath: "circle(150% at 95% 4%)" }}
            exit={{ clipPath: "circle(0% at 95% 4%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(61,242,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(61,242,255,.08) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="wrap relative flex h-full flex-col py-5">
              <div className="flex items-center justify-between">
                <span className="tag">// navigation</span>
                <button
                  onClick={() => setOpen(false)}
                  data-cursor="CLOSE"
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white hover:text-neon-400"
                >
                  Close [esc]
                </button>
              </div>
              <nav className="mt-auto flex flex-col">
                {links.map((l, i) => (
                  <motion.button
                    key={l.id}
                    onClick={() => go(l.id)}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative flex items-baseline gap-4 overflow-hidden border-b border-white/[0.06] py-2 text-left sm:gap-8"
                  >
                    <span className="font-mono text-xs text-cyan-400">{l.n}</span>
                    <span className="relative font-display text-[11vw] font-black uppercase leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
                      <span className="block transition-transform duration-500 group-hover:-translate-y-full">{l.label}</span>
                      <span className="neon-text absolute left-0 top-full block transition-transform duration-500 group-hover:-translate-y-full">
                        {l.label}
                      </span>
                    </span>
                    <span className="ml-auto font-mono text-xs text-slate-500 opacity-0 transition group-hover:opacity-100">
                      ↗
                    </span>
                  </motion.button>
                ))}
              </nav>
              <div className="mt-8 flex flex-wrap justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <span>{site.brand} · {site.focus.join(" · ")}</span>
                <span>Trading involves risk</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <EscClose open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function EscClose({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return null;
}
