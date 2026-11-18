"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  A full-screen WebGL scene of live candlestick charts.              *
 *  Several chart "layers" stream left at different depths, the latest *
 *  candle on each layer ticks like a live feed, a neon grid floor     *
 *  rushes toward the camera, and the camera dives through the layers  *
 *  as the visitor scrolls down the page.                              *
 * ------------------------------------------------------------------ */

type Candle = { o: number; h: number; l: number; c: number };

const WIN = new THREE.Color("#2BFF9E");
const LOSS = new THREE.Color("#FF3D71");
const NEON = new THREE.Color("#B8FF2C");
const CYAN = new THREE.Color("#3DF2FF");

interface LayerCfg {
  z: number;
  y: number;
  count: number;
  spacing: number;
  speed: number;
  scale: number;
  opacity: number;
  lineColor: THREE.Color;
}

function nextCandle(prev: number, vol: number): Candle {
  const o = prev;
  // random walk with gentle mean reversion so charts stay on screen
  const c = o + (Math.random() - 0.5) * vol * 2 - o * 0.035 + Math.sin(performance.now() / 4000) * vol * 0.25;
  const h = Math.max(o, c) + Math.random() * vol * 0.9;
  const l = Math.min(o, c) - Math.random() * vol * 0.9;
  return { o, h, l, c };
}

function ChartLayer({ cfg, reduce }: { cfg: LayerCfg; reduce: boolean }) {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const wicks = useRef<THREE.InstancedMesh>(null);
  const vol = 0.9;

  const state = useMemo(() => {
    const candles: Candle[] = [];
    let p = (Math.random() - 0.5) * 4;
    for (let i = 0; i < cfg.count; i++) {
      const k = nextCandle(p, vol);
      candles.push(k);
      p = k.c;
    }
    return { candles, offset: 0, tick: 0 };
  }, [cfg.count]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cfg.count * 3), 3));
    return g;
  }, [cfg.count]);

  const line = useMemo(
    () =>
      new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: cfg.lineColor, transparent: true, opacity: cfg.opacity * 0.9, toneMapped: false }),
      ),
    [lineGeo, cfg.lineColor, cfg.opacity],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const { candles } = state;
    if (!reduce) {
      state.offset += cfg.speed * dt;
      // live-ticking last candle
      state.tick += dt;
      if (state.tick > 0.06) {
        state.tick = 0;
        const last = candles[candles.length - 1];
        last.c += (Math.random() - 0.5) * vol * 0.35;
        last.h = Math.max(last.h, last.c);
        last.l = Math.min(last.l, last.c);
      }
      while (state.offset >= cfg.spacing) {
        state.offset -= cfg.spacing;
        candles.shift();
        candles.push(nextCandle(candles[candles.length - 1].c, vol));
      }
    }

    const b = bodies.current;
    const w = wicks.current;
    if (!b || !w) return;
    const pos = lineGeo.getAttribute("position") as THREE.BufferAttribute;
    const half = (cfg.count * cfg.spacing) / 2;
    let ma = candles[0].c;

    for (let i = 0; i < candles.length; i++) {
      const k = candles[i];
      const x = i * cfg.spacing - half - state.offset;
      const top = Math.max(k.o, k.c);
      const bot = Math.min(k.o, k.c);
      const bh = Math.max((top - bot) * cfg.scale, 0.03);

      dummy.position.set(x, cfg.y + ((top + bot) / 2) * cfg.scale, cfg.z);
      dummy.scale.set(cfg.spacing * 0.62, bh, cfg.spacing * 0.62);
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);
      b.setColorAt(i, k.c >= k.o ? WIN : LOSS);

      dummy.position.set(x, cfg.y + ((k.h + k.l) / 2) * cfg.scale, cfg.z);
      dummy.scale.set(0.025, Math.max((k.h - k.l) * cfg.scale, 0.03), 0.025);
      dummy.updateMatrix();
      w.setMatrixAt(i, dummy.matrix);
      w.setColorAt(i, k.c >= k.o ? WIN : LOSS);

      ma = ma + (k.c - ma) * 0.18;
      pos.setXYZ(i, x, cfg.y + ma * cfg.scale, cfg.z + 0.05);
    }
    b.instanceMatrix.needsUpdate = true;
    w.instanceMatrix.needsUpdate = true;
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
    if (w.instanceColor) w.instanceColor.needsUpdate = true;
    pos.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, cfg.count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={cfg.opacity} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={wicks} args={[undefined, undefined, cfg.count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={cfg.opacity * 0.8} toneMapped={false} />
      </instancedMesh>
      <primitive object={line} />
    </group>
  );
}

function GridFloor({ reduce }: { reduce: boolean }) {
  const ref = useRef<THREE.GridHelper>(null);
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(220, 110, CYAN, CYAN);
    const m = g.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = 0.16;
    m.toneMapped = false;
    return g;
  }, []);
  useFrame((_, dt) => {
    if (reduce || !ref.current) return;
    ref.current.position.z = (ref.current.position.z + dt * 1.6) % 2;
  });
  return <primitive ref={ref} object={grid} position={[0, -5.5, 0]} />;
}

function DataDust({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 80;
      p[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p[i * 3 + 2] = -Math.random() * 60 + 8;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.01;
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + dt * 0.35;
      if (y > 15) y = -15;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.06} color={CYAN} transparent opacity={0.7} sizeAttenuation toneMapped={false} />
    </points>
  );
}

function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? window.scrollY / max : 0;
    };
    onScroll();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((state, dt) => {
    const p = scroll.current;
    const t = state.clock.elapsedTime;
    const targetX = mouse.current.x * 1.4 + Math.sin(p * Math.PI * 2) * 2.5;
    const targetY = 1.2 - mouse.current.y * 0.8 - p * 2.5 + Math.sin(t * 0.3) * 0.15;
    const targetZ = 10 - p * 30;
    const k = 1 - Math.pow(0.0015, dt);
    camera.position.x += (targetX - camera.position.x) * k;
    camera.position.y += (targetY - camera.position.y) * k;
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.4 - 0.6, camera.position.z - 12);
    camera.rotateZ(Math.sin(p * Math.PI * 3) * 0.04 + mouse.current.x * -0.02);
  });
  return null;
}

export default function MarketScene() {
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const mobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 768, []);

  const layers = useMemo<LayerCfg[]>(() => {
    const all: LayerCfg[] = [
      { z: 0, y: -0.8, count: 90, spacing: 0.42, speed: 1.1, scale: 0.55, opacity: 0.95, lineColor: NEON },
      { z: -7, y: 2.2, count: 120, spacing: 0.42, speed: 0.8, scale: 0.6, opacity: 0.75, lineColor: CYAN },
      { z: -14, y: -2.0, count: 150, spacing: 0.45, speed: 0.6, scale: 0.7, opacity: 0.6, lineColor: NEON },
      { z: -22, y: 3.5, count: 180, spacing: 0.5, speed: 0.5, scale: 0.8, opacity: 0.5, lineColor: CYAN },
      { z: -31, y: -1.0, count: 200, spacing: 0.55, speed: 0.4, scale: 0.9, opacity: 0.45, lineColor: NEON },
    ];
    return mobile ? all.filter((_, i) => i % 2 === 0) : all;
  }, [mobile]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, mobile ? 1.25 : 1.6]}
        camera={{ position: [0, 1.2, 10], fov: 55, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        fallback={<div className="h-full w-full bg-[radial-gradient(ellipse_at_top,#0C1628,#02040A)]" />}
      >
        <fog attach="fog" args={["#02040A", 4, 48]} />
        {layers.map((l, i) => (
          <ChartLayer key={i} cfg={l} reduce={reduce} />
        ))}
        <GridFloor reduce={reduce} />
        <DataDust count={mobile ? 300 : 700} />
        <CameraRig />
      </Canvas>
      <div className="vignette absolute inset-0" />
      <div className="absolute inset-0 bg-void/35" />
    </div>
  );
}
