import { isIP } from "node:net";
import { AUTH_DISABLED_PATHS } from "./auth-disabled-paths.ts";

// A fixed-window limiter in front of the two email-OTP paths KC uses. It counts
// before it checks, so a burst of simultaneous requests cannot all slip past
// (better-auth's own limiter checks first and counts after the handler).
// Counters live in memory on the one app process.
export const OTP_PATHS = ["/email-otp/send-verification-otp", "/sign-in/email-otp"];
export const OTP_WINDOW_MS = 10 * 60 * 1000;
export const OTP_IP_LIMIT = 10;
export const OTP_EMAIL_LIMIT = 5;

export function createLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, { start: number; count: number }>();
  return {
    buckets,
    hit(key: string, now: number): boolean {
      for (const [k, b] of buckets) if (now - b.start >= windowMs) buckets.delete(k);
      const bucket = buckets.get(key) ?? { start: now, count: 0 };
      bucket.count += 1;
      buckets.set(key, bucket);
      return bucket.count <= limit;
    },
  };
}

// IPv4 as is; IPv6 cut to its /64, so one allocation cannot mint endless keys.
export function ipKey(ip: string | null | undefined): string {
  const raw = (ip ?? "").trim();
  if (isIP(raw) !== 6) return raw || "unknown";
  const mapped = raw.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  const [head, tail = ""] = raw.toLowerCase().split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const groups = raw.includes("::") ? [...h, ...Array(8 - h.length - t.length).fill("0"), ...t] : h;
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

export function emailKey(email: unknown): string | null {
  return typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
}

export function createOtpGuard(ipLimit = OTP_IP_LIMIT, emailLimit = OTP_EMAIL_LIMIT, windowMs = OTP_WINDOW_MS) {
  const byIp = createLimiter(ipLimit, windowMs);
  const byEmail = createLimiter(emailLimit, windowMs);
  return (req: { path: string; ip: string | null | undefined; email: unknown; now: number }): "allow" | 404 | 429 => {
    if (AUTH_DISABLED_PATHS.includes(req.path)) return 404;
    if (!OTP_PATHS.includes(req.path)) return "allow";
    // A refused IP never spends an email's budget, so one IP cannot lock out many clients.
    if (!byIp.hit(ipKey(req.ip), req.now)) return 429;
    const email = emailKey(req.email);
    return email === null || byEmail.hit(email, req.now) ? "allow" : 429;
  };
}

export const kcAuthBefore = createOtpGuard();
