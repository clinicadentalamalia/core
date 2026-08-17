type OperationalLog = {
  code?: string;
  durationMs: number;
  event: "healthcheck" | "staff_access_update";
  level: "error" | "info";
  outcome: "denied" | "error" | "success";
  requestId?: string | null;
  route: string;
};

export function writeOperationalLog(entry: OperationalLog) {
  const payload = JSON.stringify({
    code: entry.code,
    duration_ms: entry.durationMs,
    event: entry.event,
    level: entry.level,
    outcome: entry.outcome,
    request_id: entry.requestId ?? undefined,
    route: entry.route,
  });

  if (entry.level === "error") {
    console.error(payload);
    return;
  }

  console.info(payload);
}

export function reportClientBoundary(
  scope: "global" | "segment",
  digest?: string,
) {
  console.error(
    JSON.stringify({
      digest: digest ?? undefined,
      event: "ui_error_boundary",
      level: "error",
      scope,
    }),
  );
}
