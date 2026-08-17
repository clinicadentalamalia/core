import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvitationSessionGate } from "@/app/set-password/invitation-session-gate";

const { getClaims, setSession } = vi.hoisted(() => ({
  getClaims: vi.fn(),
  setSession: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getClaims, setSession } }),
}));

describe("InvitationSessionGate", () => {
  beforeEach(() => {
    getClaims.mockReset();
    setSession.mockReset();
    window.history.replaceState({}, "", "/set-password");
  });

  it("convierte el fragmento de invitación en una sesión y limpia la URL", async () => {
    setSession.mockResolvedValue({ error: null });
    getClaims.mockResolvedValue({
      data: { claims: { sub: "user-id" } },
      error: null,
    });
    window.history.replaceState(
      {},
      "",
      "/set-password#access_token=access-test&refresh_token=refresh-test&type=invite",
    );

    render(
      <InvitationSessionGate>
        <p>Formulario disponible</p>
      </InvitationSessionGate>,
    );

    expect(await screen.findByText("Formulario disponible")).toBeVisible();
    expect(setSession).toHaveBeenCalledWith({
      access_token: "access-test",
      refresh_token: "refresh-test",
    });
    expect(window.location.hash).toBe("");
  });

  it("rechaza una visita que no contiene una sesión válida", async () => {
    getClaims.mockResolvedValue({ data: null, error: new Error("invalid") });

    render(
      <InvitationSessionGate>
        <p>Formulario disponible</p>
      </InvitationSessionGate>,
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "La invitación no es válida o expiró.",
      ),
    );
    expect(screen.queryByText("Formulario disponible")).not.toBeInTheDocument();
  });
});
