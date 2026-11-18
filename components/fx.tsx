"use client";

import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01234567890ABCDEFXYZ";

/** Text that "decodes" from random glyphs into its final value. */
export function Scramble({
  text,
  delay = 0,
  duration = 900,
  className,
  start = true,
}: {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  start?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!inView || !start) return;
    if (reduce) {
      setOut(text);
      setShown(true);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const timer = setTimeout(() => {
      setShown(true);
      const step = (t: number) => {
        if (!t0) t0 = t;
        const p = Math.min(1, (t - t0) / duration);
        const revealed = Math.floor(p * text.length);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " " || i < revealed) s += ch;
          else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        setOut(s);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView, start, text, delay, duration, reduce]);

  return (
    <span ref={ref} className={className} aria-label={text} style={{ opacity: shown ? 1 : 0 }}>
      {out}
    </span>
  );
}

/** Number that counts up while its digits flicker, terminal-style. */
export function Counter({
  value,
  format,
  className,
  delay = 0,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(() => format(0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setOut(format(value));
      return;
    }
    const c = animate(0, value, {
      duration: 1.8,
      delay: delay / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setOut(format(v)),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className={className}>
      {out}
    </span>
  );
}

const revealV: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={revealV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Section header used everywhere: "// 02 — PERFORMANCE" + big title. */
export function SectionHead({
  index,
  label,
  title,
  accent,
  className = "",
  compact = false,
}: {
  index: string;
  label: string;
  title: string;
  accent?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={className}>
      <div className="tag">
        <span className="h-px w-10 bg-neon-400" />
        <Scramble text={`// ${index} — ${label}`} />
      </div>
      <h2 className={`h-display mt-5 ${compact ? "text-[11vw] sm:text-5xl xl:text-6xl" : "text-[11vw] sm:text-6xl lg:text-7xl xl:text-8xl"}`}>
        <Scramble text={title} duration={700} />
        {accent && (
          <>
            <br />
            <span className="outline-text">
              <Scramble text={accent} delay={250} duration={800} />
            </span>
          </>
        )}
      </h2>
    </div>
  );
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

export function SampleBadge() {
  return (
    <span className="inline-flex items-center gap-2 border border-amber-400/50 bg-amber-400/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
      <span className="h-1.5 w-1.5 animate-blink bg-amber-300" /> Sample data · preview only
    </span>
  );
}

/** True once the preloader has finished (so intro animations start on cue). */
export function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as unknown as { __twbReady?: boolean };
    if (w.__twbReady) {
      setReady(true);
      return;
    }
    const on = () => setReady(true);
    window.addEventListener("twb:ready", on);
    const fallback = setTimeout(on, 4000);
    return () => {
      window.removeEventListener("twb:ready", on);
      clearTimeout(fallback);
    };
  }, []);
  return ready;
}
