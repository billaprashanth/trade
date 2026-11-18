import { createHash, timingSafeEqual } from "crypto";

const hash = (s: string) => createHash("sha256").update(s).digest();

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(candidate: string | null | undefined) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || !candidate) return false;
  return timingSafeEqual(hash(candidate), hash(real));
}

export function isAuthorized(req: Request) {
  return checkPassword(req.headers.get("x-admin-key"));
}
