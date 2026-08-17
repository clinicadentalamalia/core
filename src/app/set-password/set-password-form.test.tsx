import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SetPasswordForm } from "@/app/set-password/set-password-form";

const { updatePassword } = vi.hoisted(() => ({
  updatePassword: vi.fn(async () => ({ error: "No se pudo actualizar." })),
}));

vi.mock("@/app/set-password/actions", () => ({
  updatePassword,
}));

describe("SetPasswordForm", () => {
  beforeEach(() => updatePassword.mockClear());

  it("envía una contraseña nueva y su confirmación", async () => {
    const user = userEvent.setup();
    render(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "Amalia2026!Segura");
    await user.type(
      screen.getByLabelText("Confirmar contraseña"),
      "Amalia2026!Segura",
    );
    await user.click(screen.getByRole("button", { name: "Guardar contraseña" }));

    await waitFor(() => expect(updatePassword).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo actualizar.",
    );
  });

  it("muestra ambas contraseñas con un control accesible", async () => {
    const user = userEvent.setup();
    render(<SetPasswordForm />);

    await user.click(
      screen.getByRole("button", { name: "Mostrar contraseñas" }),
    );

    expect(screen.getByLabelText("Nueva contraseña")).toHaveAttribute(
      "type",
      "text",
    );
    expect(screen.getByLabelText("Confirmar contraseña")).toHaveAttribute(
      "type",
      "text",
    );
  });
});
