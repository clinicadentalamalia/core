import { NextResponse } from "next/server";
import { writeOperationalLog } from "@/lib/monitoring";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("app_healthcheck");

    if (!error && data === "ok") {
      writeOperationalLog({
        durationMs: Date.now() - startedAt,
        event: "healthcheck",
        level: "info",
        outcome: "success",
        requestId,
        route: "/api/health",
      });

      return NextResponse.json(
        { dependencies: { database: "ok" }, status: "ok" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    writeOperationalLog({
      code: error?.code ?? "UNEXPECTED_RESPONSE",
      durationMs: Date.now() - startedAt,
      event: "healthcheck",
      level: "error",
      outcome: "error",
      requestId,
      route: "/api/health",
    });

    return NextResponse.json(
      { dependencies: { database: "unavailable" }, status: "degraded" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 503,
      },
    );
  } catch {
    writeOperationalLog({
      code: "UNEXPECTED",
      durationMs: Date.now() - startedAt,
      event: "healthcheck",
      level: "error",
      outcome: "error",
      requestId,
      route: "/api/health",
    });

    return NextResponse.json(
      { dependencies: { database: "unavailable" }, status: "degraded" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 503,
      },
    );
  }
}
