import { quarantineIp } from "./quarantine";
import { logAudit } from "./siem";

/**
 * Sanitizes an arbitrary payload against NoSQL operator injection ($gt, $ne, $where, etc.)
 * and dangerous script tags (XSS).
 */
export function sanitizePayload<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    // Strip malicious script injection patterns
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/on\w+\s*=/gi, "") as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const cleanObj: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      // Disallow MongoDB operators ($gt, $where, etc.) and dot-notation paths
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      cleanObj[key] = sanitizePayload(val);
    }

    return cleanObj as T;
  }

  return input;
}

/**
 * Validates whether an automated bot fell into a form honeypot trap field.
 * Legitimate human users leave this field blank (it is visually hidden & unselectable).
 */
export function verifyFormHoneypot(
  body: Record<string, unknown>,
  ip: string,
  trapField: string = "_citadel_trap"
): { isLegitimate: boolean; reason?: string } {
  const trapValue = body[trapField];

  // If the honeypot field contains any text or submission, it's an automated bot
  if (typeof trapValue === "string" && trapValue.trim().length > 0) {
    quarantineIp(ip, `Automated form bot trapped in canary field '${trapField}'`, 24 * 60 * 60 * 1000);

    logAudit(
      ip,
      "POST",
      "CANARY_FORM_TRAP",
      "ALERT",
      "BOT_TRAPPED_IN_FORM_CANARY",
      { trapField, filledValue: trapValue }
    );

    return {
      isLegitimate: false,
      reason: "Bot activity detected via form canary trap",
    };
  }

  return { isLegitimate: true };
}
