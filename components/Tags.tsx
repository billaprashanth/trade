import clsx from "clsx";
import { resultOf, type Trade } from "@/lib/types";

export function SideTag({ side }: { side: Trade["side"] }) {
  const buy = side === "Buy";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        buy ? "bg-win/10 text-win" : "bg-loss/10 text-loss",
      )}
    >
      {buy ? "▲" : "▼"} {side}
    </span>
  );
}

export function ResultTag({ rr }: { rr: number }) {
  const r = resultOf({ rr });
  return (
    <span
      className={clsx(
        "inline-flex px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        r === "Win" && "bg-win text-void",
        r === "Loss" && "bg-loss text-white",
        r === "Breakeven" && "bg-white/10 text-slate-200",
      )}
    >
      {r}
    </span>
  );
}
