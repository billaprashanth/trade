"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useRef } from "react";

function Row({ items, base, className }: { items: string[]; base: number; className: string }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smooth, [-2000, 2000], [12, -12]);
  const dir = useRef(1);
  const pos = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    x.set(x.get() + move);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={{ x: pos, skewX: skew }} className="flex shrink-0">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((t, i) => (
              <span key={i} className={className}>
                {t}
                <span className="mx-6 text-neon-400 sm:mx-10">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function VelocityMarquee() {
  return (
    <div className="relative z-10 -rotate-2 space-y-2 border-y border-neon-400/30 bg-void/80 py-5 backdrop-blur-sm">
      <Row
        base={-3}
        items={["Process over prediction", "Risk before reward", "Consistency over impulse"]}
        className="flex items-center font-display text-4xl font-black uppercase text-white sm:text-6xl"
      />
      <Row
        base={2.5}
        items={["XAUUSD ▲", "EURUSD ▼", "GBPUSD ▲", "DXY ▼", "USDJPY ▲", "XAGUSD ▲", "PRICE ACTION", "LIQUIDITY", "STRUCTURE"]}
        className="outline-text flex items-center font-display text-3xl font-black uppercase sm:text-5xl"
      />
    </div>
  );
}
