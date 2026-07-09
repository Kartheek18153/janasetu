interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAfter: number } {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAfter: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxAttempts - entry.count);
  const resetAfter = entry.resetAt - now;

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAfter };
  }

  return { allowed: true, remaining, resetAfter };
}

export function getRateLimitKey(uid: string, action: string): string {
  return `${uid}:${action}`;
}
