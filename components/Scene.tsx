"use client";

import dynamic from "next/dynamic";

// WebGL scene is client-only.
const MarketScene = dynamic(() => import("./MarketScene"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,#0C1628,#02040A)]" />,
});

export default function Scene() {
  return <MarketScene />;
}
