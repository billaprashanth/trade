import { getDashboard } from "@/lib/store";
import { computeStats, sortTrades } from "@/lib/stats";
import Scene from "@/components/Scene";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Crosshair from "@/components/Crosshair";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import VelocityMarquee from "@/components/VelocityMarquee";
import Edge from "@/components/Edge";
import Performance from "@/components/Performance";
import TradeLog from "@/components/TradeLog";
import Approach from "@/components/Approach";
import LiveMarket from "@/components/LiveMarket";
import Footer from "@/components/Footer";

// Always render fresh data, so new trades appear immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { trades, settings, isSample } = await getDashboard();
  const stats = computeStats(trades, settings);
  const sorted = sortTrades(trades, "desc");

  return (
    <div className="scanlines overflow-x-clip">
      <Preloader />
      <SmoothScroll />
      <Scene />
      <Crosshair />
      <Nav />
      <main className="relative z-10">
        <Hero stats={stats} latest={sorted[0] ?? null} isSample={isSample} />
        <VelocityMarquee />
        <Edge />
        <Performance stats={stats} settings={settings} isSample={isSample} />
        <TradeLog trades={sorted} settings={settings} isSample={isSample} />
        <Approach />
        <LiveMarket />
      </main>
      <Footer />
    </div>
  );
}
