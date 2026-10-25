import { QuarantineRecord, RateLimitResult } from "./types";
import { logAudit } from "./siem";

// In-memory threat state (isolated per server instance / edge worker)
const quarantineRegistry = new Map<string, QuarantineRecord>();
const rateLimitBuckets = new Map<string, number[]>();

// Maximum stored buckets to prevent unbounded memory usage
const MAX_BUCKETS = 10000;

function cleanupStaleBuckets(now: number): void {
  if (rateLimitBuckets.size > MAX_BUCKETS) {
    for (const [key, timestamps] of rateLimitBuckets.entries()) {
      const valid = timestamps.filter((t) => now - t < 60000);
      if (valid.length === 0) {
        rateLimitBuckets.delete(key);
      } else {
        rateLimitBuckets.set(key, valid);
      }
    }
  }
}

/**
 * Checks whether an IP is actively quarantined under Citadel containment.
 */
export function isQuarantined(ip: string): { quarantined: boolean; record?: QuarantineRecord } {
  // In development mode, loopback addresses trigger SIEM logging without locking developer session
  if (process.env.NODE_ENV !== "production" && (ip === "127.0.0.1" || ip === "::1")) {
    return { quarantined: false };
  }

  const record = quarantineRegistry.get(ip);
  if (!record) return { quarantined: false };

  if (Date.now() > record.expiresAt) {
    quarantineRegistry.delete(ip);
    return { quarantined: false };
  }

  return { quarantined: true, record };
}

/**
 * Places an IP into quarantine containment and emits an ALERT SIEM event.
 */
export function quarantineIp(
  ip: string,
  reason: string,
  durationMs: number = 24 * 60 * 60 * 1000, // Default: 24h
  details?: Record<string, unknown>
): void {
  const now = Date.now();
  const record: QuarantineRecord = {
    ip,
    reason,
    quarantinedAt: now,
    expiresAt: now + durationMs,
  };

  quarantineRegistry.set(ip, record);

  logAudit(
    ip,
    "DEFENSE_ISOLATION",
    "QUARANTINE_GATEWAY",
    "QUARANTINE",
    "NODE_ISOLATED",
    {
      reason,
      durationMs,
      expiresAt: new Date(record.expiresAt).toISOString(),
      ...details,
    }
  );
}

/**
 * Sliding-window rate limiter.
 * @param ip Client IP
 * @param bucket Identifier for endpoint/action (e.g., 'api:general' or 'api:contact')
 * @param limit Max allowed requests within window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  ip: string,
  bucket: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const key = `${bucket}:${ip}`;

  cleanupStaleBuckets(now);

  const timestamps = (rateLimitBuckets.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldestTimestamp = timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldestTimestamp));

    // If excessive abuse (>2x limit), trigger automatic 15-minute quarantine
    if (timestamps.length >= limit * 2) {
      quarantineIp(ip, `Rate limit brute-force threshold exceeded on ${bucket}`, 15 * 60 * 1000);
    }

    return { allowed: false, remaining: 0, resetMs };
  }

  timestamps.push(now);
  rateLimitBuckets.set(key, timestamps);

  return {
    allowed: true,
    remaining: limit - timestamps.length,
    resetMs: windowMs,
  };
}
