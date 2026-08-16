import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PatientForm } from "./patient-form";

describe("PatientForm", () => {
  it("rechaza un nombre compuesto solo por espacios", async () => {
    const user = userEvent.setup();
    render(<PatientForm/>);

    await user.type(screen.getByLabelText("Nombre ficticio"), "   ");
    await user.type(screen.getByLabelText("Identificador ficticio"), "ID-DEMO-005");
    await user.type(screen.getByLabelText("Teléfono demo"), "+56 9 5555 5555");
    await user.type(screen.getByLabelText("Correo de prueba"), "paciente@example.test");
    await user.click(screen.getByRole("button", { name: "Guardar demostración" }));

    expect(await screen.findByText("Ingresa un nombre ficticio")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("valida datos ficticios sin afirmar que fueron persistidos", async () => {
    const user = userEvent.setup();
    render(<PatientForm/>);

    await user.type(screen.getByLabelText("Nombre ficticio"), "Paciente Demo");
    await user.type(screen.getByLabelText("Identificador ficticio"), "ID-DEMO-005");
    await user.type(screen.getByLabelText("Teléfono demo"), "+56 9 5555 5555");
    await user.type(screen.getByLabelText("Correo de prueba"), "paciente@example.test");
    await user.click(screen.getByRole("button", { name: "Guardar demostración" }));

    expect(await screen.findByRole("status")).toHaveTextContent("No se guardó en la base de datos");
  });
});
