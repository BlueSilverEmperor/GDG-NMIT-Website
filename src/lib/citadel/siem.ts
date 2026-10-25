import { CitadelEvent, ThreatLevel } from "./types";

/**
 * Citadel Blue Engine SIEM Telemetry Emitter
 * Formats structured JSON log entries matching the Citadel Defensive Daemon specification.
 */
export function emitSiemEvent(event: CitadelEvent): void {
  const logEntry = {
    citadel_version: "2.4.0-web",
    system: "citadel-blue-engine",
    ...event,
  };

  const payload = JSON.stringify(logEntry);

  switch (event.threatLevel) {
    case "QUARANTINE":
    case "ALERT":
      console.error(`[CITADEL-SIEM][${event.threatLevel}] ${payload}`);
      break;
    case "WARN":
      console.warn(`[CITADEL-SIEM][${event.threatLevel}] ${payload}`);
      break;
    case "INFO":
    default:
      console.log(`[CITADEL-SIEM][${event.threatLevel}] ${payload}`);
      break;
  }
}

export function logAudit(
  ip: string,
  method: string,
  path: string,
  threatLevel: ThreatLevel,
  action: string,
  details?: Record<string, unknown>,
  userAgent?: string
): void {
  emitSiemEvent({
    timestamp: new Date().toISOString(),
    clientIp: ip,
    method,
    path,
    threatLevel,
    action,
    details,
    userAgent,
  });
}
