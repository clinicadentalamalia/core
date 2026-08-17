import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    rpc.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("confirma la dependencia de base de datos", async () => {
    rpc.mockResolvedValue({ data: "ok", error: null });

    const response = await GET(
      new Request("https://core.example.test/api/health"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      dependencies: { database: "ok" },
      status: "ok",
    });
  });

  it("responde degradado sin filtrar detalles internos", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "08006", message: "connection detail" },
    });

    const response = await GET(
      new Request("https://core.example.test/api/health"),
    );

    expect(response.status).toBe(503);
    const body = await response.text();
    expect(body).toContain('"status":"degraded"');
    expect(body).not.toContain("connection detail");
  });
});
