export type ThreatLevel = "INFO" | "WARN" | "ALERT" | "QUARANTINE";

export interface CitadelEvent {
  timestamp: string;
  clientIp: string;
  method: string;
  path: string;
  threatLevel: ThreatLevel;
  action: string;
  details?: Record<string, unknown>;
  userAgent?: string;
}

export interface QuarantineRecord {
  ip: string;
  reason: string;
  quarantinedAt: number;
  expiresAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}
