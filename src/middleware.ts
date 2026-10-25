import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isQuarantined,
  isDeceptionProbe,
  handleDeceptionProbe,
  checkRateLimit,
} from "./lib/citadel";

/**
 * Citadel Blue Engine Edge Gateway Middleware
 * Enforces Zero-Trust gatekeeping, honeypot deception traps, IP quarantine, and security headers.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract client IP (handling reverse proxies & Cloudflare/Vercel headers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";

  // 1. Deception & Honeypot Sandbox Router Check
  const probeCheck = isDeceptionProbe(pathname, userAgent);
  if (probeCheck.isProbe) {
    const decoy = handleDeceptionProbe(clientIp, pathname, userAgent, probeCheck.reason);
    return NextResponse.json(decoy.body, {
      status: decoy.status,
      headers: {
        "X-Citadel-Shield": "CONTAINMENT_TRIGGERED",
      },
    });
  }

  // 2. Quarantine Registry Check
  const quarantineState = isQuarantined(clientIp);
  if (quarantineState.quarantined) {
    return NextResponse.json(
      {
        error: "Access Denied: Node Quarantined by Citadel Security Shield",
        reference_id: `CIT-${Buffer.from(clientIp).toString("base64").slice(0, 8)}`,
        status: 403,
      },
      {
        status: 403,
        headers: {
          "X-Citadel-Shield": "QUARANTINED",
          "Retry-After": "86400",
        },
      }
    );
  }

  // 3. API Rate Limiting (Sliding Window)
  if (pathname.startsWith("/api/")) {
    const rateCheck = checkRateLimit(clientIp, "api:global", 100, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Citadel DDoS threshold activated.",
          retryAfterMs: rateCheck.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
            "X-Citadel-Shield": "RATE_LIMITED",
          },
        }
      );
    }
  }

  // 4. Pass through to next handler and inject Zero-Trust Security Headers
  const response = NextResponse.next();

  response.headers.set("X-Citadel-Shield", "ACTIVE-CAL4");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
