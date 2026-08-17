import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/app/login/login-form";

const { signIn } = vi.hoisted(() => ({
  signIn: vi.fn(async () => ({ error: "Credenciales no válidas." })),
}));

vi.mock("@/app/auth/actions", () => ({
  signIn,
}));

describe("LoginForm", () => {
  beforeEach(() => signIn.mockClear());

  it("envía las credenciales al flujo de autenticación", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("Correo institucional"),
      "staff@example.test",
    );
    await user.type(screen.getByLabelText("Contraseña", { selector: "input" }), "password-test");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales no válidas.",
    );
  });

  it("expone el estado del control para mostrar la contraseña", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const toggle = screen.getByRole("button", {
      name: "Mostrar contraseña",
    });

    await user.click(toggle);

    expect(
      screen.getByRole("button", { name: "Ocultar contraseña" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
