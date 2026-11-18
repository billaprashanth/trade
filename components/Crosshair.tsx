"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** TradingView-style crosshair cursor with live "price" and time labels. */
export default function Crosshair() {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 900, damping: 50, mass: 0.3 });
  const ry = useSpring(y, { stiffness: 900, damping: 50, mass: 0.3 });
  const price = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);
    document.body.classList.add("has-crosshair");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (price.current) {
        // map the vertical position to a gold-like price that also drifts with scroll
        const base = 4180 - (e.clientY / window.innerHeight) * 160 - window.scrollY * 0.02;
        price.current.textContent = base.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      const el = (e.target as HTMLElement).closest<HTMLElement>("a,button,[data-cursor],input,textarea,select");
      setHover(el ? el.dataset.cursor ?? (el.tagName === "A" || el.tagName === "BUTTON" ? "OPEN" : "INPUT") : null);
    };
    const clock = setInterval(() => {
      if (time.current) time.current.textContent = new Date().toISOString().slice(11, 19) + " UTC";
    }, 1000);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      clearInterval(clock);
      document.body.classList.remove("has-crosshair");
    };
  }, [x, y]);

  if (!on) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] mix-blend-screen">
      <motion.div style={{ y: ry }} className="absolute left-0 right-0 top-0 h-px border-t border-dashed border-cyan-400/30" />
      <motion.div style={{ x: rx }} className="absolute bottom-0 left-0 top-0 w-px border-l border-dashed border-cyan-400/30" />

      <motion.div style={{ x: rx, y: ry }} className="absolute left-0 top-0">
        <motion.div
          animate={{ width: hover ? 64 : 14, height: hover ? 64 : 14, rotate: hover ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="-translate-x-1/2 -translate-y-1/2 border border-neon-400 bg-neon-400/10"
        />
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-10 top-4 bg-neon-400 px-1.5 py-0.5 font-mono text-[10px] font-bold text-void"
          >
            {hover}
          </motion.span>
        )}
      </motion.div>

      <motion.div style={{ y: ry }} className="absolute right-0 top-0 -translate-y-1/2">
        <span ref={price} className="block bg-cyan-400 px-2 py-0.5 font-mono text-[10px] font-bold text-void">
          0.00
        </span>
      </motion.div>
      <motion.div style={{ x: rx }} className="absolute bottom-0 left-0 -translate-x-1/2">
        <span ref={time} className="block bg-cyan-400 px-2 py-0.5 font-mono text-[10px] font-bold text-void">
          --:--:--
        </span>
      </motion.div>
    </div>
  );
}
