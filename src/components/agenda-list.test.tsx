import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AgendaList } from "./agenda-list";

describe("AgendaList", () => {
  it("expone y actualiza la vista seleccionada", async () => {
    const user = userEvent.setup();
    render(<AgendaList/>);

    expect(screen.getByRole("button", { name: "Día" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Semana" }));

    expect(screen.getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Vista semana preparada" })).toBeInTheDocument();
  });

  it("no usa solo color para distinguir categorías", () => {
    render(<AgendaList/>);

    expect(screen.getAllByText("Odontología")).toHaveLength(2);
    expect(screen.getAllByText("Armonización")).toHaveLength(2);
  });
});
