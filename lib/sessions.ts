// Forex session hours in UTC (approximate, ignores DST shifts).
export const sessions = [
  { code: "SYD", name: "Sydney", open: 22, close: 7, tz: "Australia/Sydney" },
  { code: "TKY", name: "Tokyo", open: 0, close: 9, tz: "Asia/Tokyo" },
  { code: "LDN", name: "London", open: 8, close: 17, tz: "Europe/London" },
  { code: "NYC", name: "New York", open: 13, close: 22, tz: "America/New_York" },
] as const;

export function fxMarketOpen(d: Date) {
  const day = d.getUTCDay();
  const h = d.getUTCHours();
  if (day === 6) return false; // Saturday
  if (day === 0 && h < 22) return false; // Sunday before Sydney open
  if (day === 5 && h >= 22) return false; // Friday after NY close
  return true;
}

export function sessionOpen(s: (typeof sessions)[number], d: Date) {
  if (!fxMarketOpen(d)) return false;
  const h = d.getUTCHours() + d.getUTCMinutes() / 60;
  return s.open < s.close ? h >= s.open && h < s.close : h >= s.open || h < s.close;
}
