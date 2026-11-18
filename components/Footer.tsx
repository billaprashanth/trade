"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { site } from "@/lib/config";
import { sessionOpen, sessions } from "@/lib/sessions";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const socials = Object.entries(site.socials).filter(([, v]) => v);

  return (
    <footer ref={ref} className="relative z-10 overflow-hidden border-t border-neon-400/20 bg-void/85 backdrop-blur-sm">
      <div className="wrap py-16">
        <div className="grid gap-px bg-cyan-400/10 sm:grid-cols-2 lg:grid-cols-4">
          {sessions.map((s) => {
            const open = now ? sessionOpen(s, now) : false;
            const local = now
              ? now.toLocaleTimeString("en-GB", { timeZone: s.tz, hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "--:--:--";
            return (
              <div key={s.code} className="bg-void-900 p-5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em]">
                  <span className="text-slate-400">{s.name}</span>
                  <span className={clsx("flex items-center gap-1.5", open ? "text-win" : "text-slate-500")}>
                    <span className={clsx("h-1.5 w-1.5 rounded-full", open ? "animate-ping2 bg-win" : "bg-slate-600")} />
                    {open ? "Open" : "Closed"}
                  </span>
                </div>
                <div className="mt-2 font-display text-3xl font-black tabular-nums text-white">{local}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="tag">// end of feed</div>
            <p className="mt-4 max-w-md font-display text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
              Patience. Precision. <span className="neon-text">Discipline.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socials.map(([k, v]) => (
              <a
                key={k}
                href={k === "email" && !v.startsWith("mailto:") ? `mailto:${v}` : v}
                target="_blank"
                rel="noreferrer"
                className="btn-line !px-4 !py-3"
              >
                {k}
              </a>
            ))}
            <button
              onClick={() => {
                const l = (window as unknown as { __lenis?: { scrollTo(t: number, o?: object): void } }).__lenis;
                if (l) l.scrollTo(0, { duration: 2.2 });
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="btn-neon"
              data-cursor="TOP"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>

      <motion.div style={{ y }} className="select-none whitespace-nowrap px-2 text-center">
        <div className="h-display text-[19vw] leading-[0.8]">
          {"BUNNY".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="outline-text inline-block"
              whileHover={{ y: -30, color: "#B8FF2C" }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <div className="wrap flex flex-col gap-3 border-t border-white/10 py-6 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 md:flex-row md:justify-between">
        <span>
          © {now?.getFullYear() ?? ""} {site.name} · {site.brand}
        </span>
        <span className="max-w-2xl normal-case tracking-normal md:text-right">
          Trading involves substantial risk. Past performance does not guarantee future results. Nothing here is financial advice.
        </span>
      </div>
    </footer>
  );
}
