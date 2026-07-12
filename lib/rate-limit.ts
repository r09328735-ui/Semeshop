import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimiters = new Map<string, Ratelimit>();

// In-memory fallback used in development when Upstash Redis isn't configured.
// Not safe across multiple server instances — configure Upstash in production.
const memoryStore = new Map<string, { count: number; reset: number }>();

function memoryLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.reset < now) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  entry.count += 1;
  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

interface RateLimitOptions {
  limit?: number;
  windowSeconds?: number;
}

export async function rateLimit(
  identifier: string,
  { limit = 5, windowSeconds = 60 }: RateLimitOptions = {}
): Promise<{ success: boolean; remaining: number }> {
  if (redis) {
    const key = `${limit}:${windowSeconds}`;
    let limiter = ratelimiters.get(key);
    if (!limiter) {
      limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`) });
      ratelimiters.set(key, limiter);
    }
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  }
  return memoryLimit(identifier, limit, windowSeconds * 1000);
}
