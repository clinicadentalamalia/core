import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LoginPage", () => {
  beforeEach(() => push.mockClear());

  it("envía el formulario demo con teclado", async () => {
    const user = userEvent.setup();
    render(<LoginPage/>);

    await user.click(screen.getByLabelText("Contraseña", { selector: "input" }));
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("expone el estado del control para mostrar la contraseña", async () => {
    const user = userEvent.setup();
    render(<LoginPage/>);
    const toggle = screen.getByRole("button", { name: "Mostrar contraseña" });

    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Ocultar contraseña" })).toHaveAttribute("aria-pressed", "true");
  });
});
