import { quarantineIp } from "./quarantine";
import { logAudit } from "./siem";

// Suspicious paths commonly targeted by automated vulnerability bots & script kiddies
const HONEYPOT_PATHS = [
  "/.env",
  "/.git",
  "/wp-admin",
  "/wp-login.php",
  "/wp-content",
  "/phpmyadmin",
  "/pma",
  "/.aws",
  "/actuator",
  "/solr",
  "/shell",
  "/xmlrpc.php",
  "/admin.php",
  "/cgi-bin",
  "/config.json",
  "/database.yml",
  "/id_rsa",
  "/web.config",
];

// Well-known attack and reconnaissance scanner User-Agents
const HOSTILE_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "masscan",
  "zgrab",
  "gobuster",
  "dirbuster",
  "acunetix",
  "havij",
  "nmap",
  "wprecon",
  "arachni",
];

/**
 * Evaluates whether an incoming request matches a known adversarial reconnaissance signature.
 */
export function isDeceptionProbe(
  pathname: string,
  userAgent?: string
): { isProbe: boolean; reason?: string } {
  const normalizedPath = pathname.toLowerCase();

  for (const honeyPath of HONEYPOT_PATHS) {
    if (normalizedPath === honeyPath || normalizedPath.startsWith(`${honeyPath}/`)) {
      return {
        isProbe: true,
        reason: `Canary honeypot route breached: ${honeyPath}`,
      };
    }
  }

  if (userAgent) {
    const normalizedAgent = userAgent.toLowerCase();
    for (const hostileAgent of HOSTILE_USER_AGENTS) {
      if (normalizedAgent.includes(hostileAgent)) {
        return {
          isProbe: true,
          reason: `Hostile scanner user-agent detected: ${hostileAgent}`,
        };
      }
    }
  }

  return { isProbe: false };
}

/**
 * Handles a deception probe by quarantining the adversary and generating a synthetic decoy response.
 */
export function handleDeceptionProbe(
  ip: string,
  pathname: string,
  userAgent?: string,
  reason: string = "Automated reconnaissance probe"
): { status: number; body: Record<string, unknown> } {
  // Immediately quarantine the offending IP for 48 hours
  quarantineIp(ip, reason, 48 * 60 * 60 * 1000, {
    path: pathname,
    userAgent,
    vector: "DECEPTION_HONEYPOT_SANDBOX",
  });

  logAudit(
    ip,
    "HONEYPOT_TRIGGER",
    pathname,
    "ALERT",
    "DECEPTION_ENGAGED",
    {
      reason,
      quarantined: true,
    },
    userAgent
  );

  // Return a generic decoy response to confuse automated tools without disclosing the engine
  return {
    status: 404,
    body: {
      error: "Resource not found",
      trace_id: Math.random().toString(36).substring(2, 15),
    },
  };
}
