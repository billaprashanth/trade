import { promises as fs } from "fs";
import path from "path";
import { defaultSettings } from "./config";
import type { Dashboard, Settings, Trade } from "./types";
import sample from "@/data/sample-trades.json";

/**
 * Storage:
 *  - If Upstash Redis env vars exist (Vercel → Storage → Upstash Redis), data lives there. Fully dynamic in production.
 *  - Otherwise falls back to data/trades.json (writable locally; read-only on Vercel).
 */
const KEY_TRADES = "twb:trades";
const KEY_SETTINGS = "twb:settings";

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function storageMode(): "redis" | "file" {
  return redisConfig() ? "redis" : "file";
}

async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const cfg = redisConfig();
  if (!cfg) throw new Error("Redis is not configured");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(json.error || `Redis error ${res.status}`);
  return json.result as T;
}

const FILE_TRADES = path.join(process.cwd(), "data", "trades.json");
const FILE_SETTINGS = path.join(process.cwd(), "data", "settings.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  } catch {
    throw new Error(
      "Can't save: no database connected. On Vercel, add Upstash Redis under Storage and redeploy (see README).",
    );
  }
}

export async function getTrades(): Promise<Trade[]> {
  if (storageMode() === "redis") {
    const raw = await redis<string | null>(["GET", KEY_TRADES]);
    return raw ? (JSON.parse(raw) as Trade[]) : [];
  }
  return readJson<Trade[]>(FILE_TRADES, []);
}

export async function saveTrades(trades: Trade[]) {
  if (storageMode() === "redis") {
    await redis(["SET", KEY_TRADES, JSON.stringify(trades)]);
    return;
  }
  await writeJson(FILE_TRADES, trades);
}

export async function getSettings(): Promise<Settings> {
  let stored: Partial<Settings> | null = null;
  if (storageMode() === "redis") {
    const raw = await redis<string | null>(["GET", KEY_SETTINGS]);
    stored = raw ? JSON.parse(raw) : null;
  } else {
    stored = await readJson<Partial<Settings> | null>(FILE_SETTINGS, null);
  }
  return { ...defaultSettings, ...(stored ?? {}) };
}

export async function saveSettings(settings: Settings) {
  if (storageMode() === "redis") {
    await redis(["SET", KEY_SETTINGS, JSON.stringify(settings)]);
    return;
  }
  await writeJson(FILE_SETTINGS, settings);
}

export async function getDashboard(): Promise<Dashboard> {
  const [trades, settings] = await Promise.all([
    getTrades().catch(() => [] as Trade[]),
    getSettings().catch(() => ({ ...defaultSettings })),
  ]);
  const useSample = trades.length === 0 && process.env.SHOW_SAMPLE_DATA === "true";
  return {
    trades: useSample ? (sample as Trade[]) : trades,
    settings,
    isSample: useSample,
    storage: storageMode(),
  };
}
