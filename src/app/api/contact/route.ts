import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import {
  sanitizePayload,
  verifyFormHoneypot,
  checkRateLimit,
  logAudit,
} from "../../../lib/citadel";

export async function POST(request: NextRequest) {
  // Extract client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";

  // 1. Citadel Rate Limit Enforcement (5 submissions per 5 minutes per IP)
  const rateLimit = checkRateLimit(clientIp, "api:contact", 5, 300000);
  if (!rateLimit.allowed) {
    logAudit(
      clientIp,
      "POST",
      "/api/contact",
      "WARN",
      "RATE_LIMIT_EXCEEDED",
      { retryAfterMs: rateLimit.resetMs },
      userAgent
    );
    return NextResponse.json(
      {
        success: false,
        error: "Too many contact submissions. Please try again later.",
      },
      { status: 429 }
    );
  }

  let rawData: Record<string, unknown>;
  try {
    rawData = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  // 2. Citadel Honeypot Deception Trap
  const canaryCheck = verifyFormHoneypot(rawData, clientIp, "_citadel_trap");
  if (!canaryCheck.isLegitimate) {
    // Return fake success to confuse the bot while dropping the payload
    return NextResponse.json({
      success: true,
      message: "Contact message saved successfully.",
    });
  }

  // 3. Citadel Deep Payload Sanitization (neutralize NoSQL injection and XSS)
  const sanitized = sanitizePayload(rawData) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  const name = typeof sanitized.name === "string" ? sanitized.name.trim() : "";
  const email = typeof sanitized.email === "string" ? sanitized.email.trim() : "";
  const phone = typeof sanitized.phone === "string" ? sanitized.phone.trim() : "";
  const message = typeof sanitized.message === "string" ? sanitized.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const contact = {
    name,
    email,
    phone,
    message,
    date: new Date(),
    citadel_verified: true,
  };

  try {
    const { client } = await connectToDatabase();
    const db = client.db();
    await db.collection("contacts").insertOne(contact);

    // 4. Emit SIEM Telemetry
    logAudit(
      clientIp,
      "POST",
      "/api/contact",
      "INFO",
      "CONTACT_SAVED_SECURELY",
      { email, nameLength: name.length },
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Contact message saved successfully.",
    });
  } catch (error) {
    console.error("Error saving contact:", error);
    logAudit(
      clientIp,
      "POST",
      "/api/contact",
      "WARN",
      "DATABASE_INSERT_FAILED",
      { error: String(error) },
      userAgent
    );
    return NextResponse.json({ success: false, error: "Failed to save." }, { status: 500 });
  }
}
