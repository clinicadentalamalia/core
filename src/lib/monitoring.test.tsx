import { afterEach, describe, expect, it, vi } from "vitest";
import { reportClientBoundary, writeOperationalLog } from "@/lib/monitoring";

describe("monitoring", () => {
  afterEach(() => vi.restoreAllMocks());

  it("emite solo los campos operativos permitidos", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    writeOperationalLog({
      durationMs: 18,
      event: "healthcheck",
      level: "info",
      outcome: "success",
      requestId: "iad1::test",
      route: "/api/health",
    });

    const output = String(info.mock.calls[0]?.[0]);
    expect(output).toContain('"event":"healthcheck"');
    expect(output).not.toMatch(/email|patient|display_name|user_id/i);
  });

  it("registra el digest del límite sin el mensaje de la excepción", () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    reportClientBoundary("segment", "safe-digest");

    expect(String(error.mock.calls[0]?.[0])).toBe(
      '{"digest":"safe-digest","event":"ui_error_boundary","level":"error","scope":"segment"}',
    );
  });
});
