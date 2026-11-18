"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { fmt, type Stats } from "@/lib/stats";
import type { Settings, Trade } from "@/lib/types";
import { ResultTag, SideTag } from "./Tags";

const KEY = "twb-admin-key";

type FormState = {
  date: string;
  instrument: string;
  side: "Buy" | "Sell";
  setup: string;
  entry: string;
  stopLoss: string;
  exit: string;
  rr: string;
  chartUrl: string;
  notes: string;
};

const blank = (): FormState => ({
  date: new Date().toISOString().slice(0, 10),
  instrument: "XAUUSD",
  side: "Buy",
  setup: "",
  entry: "",
  stopLoss: "",
  exit: "",
  rr: "",
  chartUrl: "",
  notes: "",
});

export default function AdminPanel() {
  const [key, setKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [storage, setStorage] = useState<"redis" | "file">("file");
  const [onVercel, setOnVercel] = useState(false);
  const [busy, setBusy] = useState(false);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Settings>({ capital: 10000, riskPercent: 1 });
  const [isSample, setIsSample] = useState(false);

  const [form, setForm] = useState<FormState>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const notify = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    const res = await fetch("/api/trades", { cache: "no-store" });
    const data = await res.json();
    setTrades([...data.trades].sort((a: Trade, b: Trade) => b.date.localeCompare(a.date)));
    setStats(data.stats);
    setSettings(data.settings);
    setIsSample(data.isSample);
  }, []);

  const login = useCallback(
    async (pw: string, silent = false) => {
      setBusy(true);
      setLoginError("");
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        sessionStorage.setItem(KEY, pw);
        setKey(pw);
        setStorage(data.storage);
        setOnVercel(data.onVercel);
        await load();
      } catch (e) {
        try {
          sessionStorage.removeItem(KEY);
        } catch {}
        if (!silent) setLoginError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(KEY);
    } catch {}
    if (saved) login(saved, true);
  }, [login]);

  const api = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-key": key ?? "" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await api(`/api/trades/${editingId}`, "PUT", form);
        notify("ok", "Trade updated");
      } else {
        await api("/api/trades", "POST", form);
        notify("ok", "Trade added — live on the site");
      }
      setForm(blank());
      setEditingId(null);
      await load();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t: Trade) => {
    if (!window.confirm(`Delete ${t.instrument} trade from ${fmt.date(t.date)}?`)) return;
    try {
      await api(`/api/trades/${t.id}`, "DELETE");
      notify("ok", "Trade deleted");
      await load();
    } catch (err) {
      notify("err", (err as Error).message);
    }
  };

  const edit = (t: Trade) => {
    setEditingId(t.id);
    setForm({
      date: t.date,
      instrument: t.instrument,
      side: t.side,
      setup: t.setup === "—" ? "" : t.setup,
      entry: String(t.entry),
      stopLoss: t.stopLoss ? String(t.stopLoss) : "",
      exit: String(t.exit),
      rr: String(t.rr),
      chartUrl: t.chartUrl ?? "",
      notes: t.notes ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/settings", "PUT", settings);
      notify("ok", "Settings saved");
      await load();
    } catch (err) {
      notify("err", (err as Error).message);
    }
  };

  // Auto-calculate R:R from entry / stop / exit
  const autoRR = () => {
    const entry = Number(form.entry);
    const sl = Number(form.stopLoss);
    const exit = Number(form.exit);
    if (!entry || !sl || !exit || entry === sl) return;
    const risk = Math.abs(entry - sl);
    const dir = form.side === "Buy" ? 1 : -1;
    setForm((f) => ({ ...f, rr: (((exit - entry) * dir) / risk).toFixed(2) }));
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!key) {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            login(password);
          }}
          className="hud hud-corners w-full max-w-sm p-8"
        >
          <div className="tag">// restricted</div>
          <h1 className="h-display mt-4 text-3xl">Journal admin</h1>
          <p className="mt-2 font-mono text-xs text-slate-400">Log in to add, edit or delete trades.</p>
          <label className="label mt-6">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {loginError && <p className="mt-3 font-mono text-xs text-loss">{loginError}</p>}
          <button disabled={busy} className="btn-neon mt-6 w-full">
            {busy ? "Checking…" : "Log in →"}
          </button>
          <Link href="/" className="mt-4 block text-center font-mono text-xs text-slate-400 hover:text-white">
            ← Back to site
          </Link>
        </motion.form>
      </div>
    );
  }

  const readOnlyWarning = storage === "file" && onVercel;

  return (
    <div className="wrap py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="font-mono text-xs text-slate-400 hover:text-white">
            ← View site
          </Link>
          <h1 className="h-display mt-2 text-4xl">Trade journal</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
              storage === "redis" ? "bg-win/10 text-win" : "bg-amber-400/10 text-amber-300",
            )}
          >
            {storage === "redis" ? "● Database connected" : "● Local file storage"}
          </span>
          <button
            onClick={() => {
              sessionStorage.removeItem(KEY);
              setKey(null);
            }}
            className="btn-ghost"
          >
            Log out
          </button>
        </div>
      </div>

      {readOnlyWarning && (
        <div className="mt-6 border border-amber-400/30 bg-amber-400/10 p-4 font-mono text-xs text-amber-200">
          No database connected, so changes can&apos;t be saved on Vercel. In your Vercel project go to{" "}
          <b>Storage → Create Database → Upstash (Redis)</b>, connect it to this project, then redeploy.
        </div>
      )}
      {isSample && (
        <div className="mt-4 border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-slate-300">
          The public site is showing <b>sample data</b> because no real trades exist yet. It disappears as soon as you add
          your first trade.
        </div>
      )}

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-px bg-cyan-400/10 md:grid-cols-5">
          {[
            ["Trades", String(stats.closed)],
            ["Win rate", `${stats.winRate.toFixed(1)}%`],
            ["Net P&L", fmt.signedMoney(stats.netPnl)],
            ["Return", fmt.pct(stats.totalReturn)],
            ["Profit factor", stats.profitFactor === null ? "∞" : stats.profitFactor.toFixed(2)],
          ].map(([k, v]) => (
            <div key={k} className="bg-void-900 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{k}</div>
              <div className="mt-1 font-display text-lg font-bold text-white">{v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="hud p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold uppercase text-white">{editingId ? "Edit trade" : "Add a trade"}</h2>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(blank());
                }}
                className="font-mono text-xs text-slate-400 hover:text-white"
              >
                ✕ Cancel edit
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Date">
              <input type="date" className="input" value={form.date} onChange={set("date")} required />
            </Field>
            <Field label="Instrument">
              <input className="input uppercase" value={form.instrument} onChange={set("instrument")} placeholder="XAUUSD" required />
            </Field>
            <Field label="Side">
              <select className="input" value={form.side} onChange={set("side")}>
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </Field>
            <Field label="Setup" className="sm:col-span-3">
              <input className="input" value={form.setup} onChange={set("setup")} placeholder="e.g. Liquidity sweep + BOS" />
            </Field>
            <Field label="Entry price">
              <input type="number" step="any" className="input" value={form.entry} onChange={set("entry")} onBlur={autoRR} required />
            </Field>
            <Field label="Stop loss">
              <input type="number" step="any" className="input" value={form.stopLoss} onChange={set("stopLoss")} onBlur={autoRR} />
            </Field>
            <Field label="Exit price">
              <input type="number" step="any" className="input" value={form.exit} onChange={set("exit")} onBlur={autoRR} required />
            </Field>
            <Field label="Realised R:R" hint="Win = +2.5, full loss = -1, breakeven = 0. Auto-fills from entry/SL/exit.">
              <input type="number" step="any" className="input" value={form.rr} onChange={set("rr")} required />
            </Field>
            <Field label="Chart screenshot URL (optional)" className="sm:col-span-2" hint="Paste a TradingView snapshot image link. Leave empty to show a live chart.">
              <input className="input" value={form.chartUrl} onChange={set("chartUrl")} placeholder="https://s3.tradingview.com/snapshots/…png" />
            </Field>
            <Field label="Notes (optional)" className="sm:col-span-3">
              <textarea className="input min-h-[96px]" value={form.notes} onChange={set("notes")} placeholder="Why I took it, what I learned…" />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="font-mono text-xs text-slate-400">
              {form.rr && !Number.isNaN(Number(form.rr)) && (
                <>
                  Return: <ResultTag rr={Number(form.rr)} />{" "}
                  <span className="ml-1 font-bold text-white">{fmt.pct(Number(form.rr) * settings.riskPercent)}</span>
                </>
              )}
            </div>
            <button disabled={busy} className="btn-neon">
              {busy ? "Saving…" : editingId ? "Save changes" : "+ Add trade"}
            </button>
          </div>
        </form>

        <form onSubmit={saveSettings} className="hud h-fit p-6">
          <h2 className="font-display text-xl font-bold uppercase text-white">Account</h2>
          <p className="mt-1 font-mono text-xs text-slate-400">Used to model P&amp;L and returns.</p>
          <div className="mt-5 space-y-4">
            <Field label="Starting capital ($)">
              <input type="number" step="any" className="input" value={settings.capital} onChange={(e) => setSettings((s) => ({ ...s, capital: Number(e.target.value) }))} />
            </Field>
            <Field label="Risk per trade (%)">
              <input type="number" step="any" className="input" value={settings.riskPercent} onChange={(e) => setSettings((s) => ({ ...s, riskPercent: Number(e.target.value) }))} />
            </Field>
            <div className="font-mono text-xs text-slate-400">
              Risk amount: <span className="text-white">{fmt.money((settings.capital * settings.riskPercent) / 100)}</span>
            </div>
            <button className="btn-ghost w-full">Save settings</button>
          </div>
        </form>
      </div>

      <div className="hud mt-6 overflow-hidden">
        <div className="border-b border-cyan-400/15 px-6 py-4 font-display text-lg font-bold uppercase text-white">
          Logged trades {isSample ? "(sample — not editable)" : `(${trades.length})`}
        </div>
        <div className="divide-y divide-white/[0.05]">
          <AnimatePresence initial={false}>
            {trades.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-24 font-mono text-xs text-slate-400">{fmt.date(t.date)}</span>
                  <span className="font-display font-bold text-white">{t.instrument}</span>
                  <SideTag side={t.side} />
                  <span className="font-mono text-xs text-slate-400">{t.setup}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tabular-nums text-slate-200">{fmt.r(t.rr)}</span>
                  <ResultTag rr={t.rr} />
                  {!isSample && (
                    <>
                      <button onClick={() => edit(t)} className="px-2 py-1 font-mono text-xs text-slate-400 hover:text-white">
                        Edit
                      </button>
                      <button onClick={() => remove(t)} className="px-2 py-1 font-mono text-xs text-slate-400 hover:text-loss">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {trades.length === 0 && <div className="px-6 py-10 text-center font-mono text-xs text-slate-400">No trades yet. Add your first one above.</div>}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={clsx(
              "fixed bottom-6 right-6 z-50 px-4 py-3 font-mono text-xs font-bold shadow-xl",
              toast.type === "ok" ? "bg-win text-void" : "bg-loss text-white",
            )}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 font-mono text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}
