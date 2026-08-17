import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatientForm } from "./patient-form";

const { createPatient } = vi.hoisted(() => ({
  createPatient: vi.fn(async () => ({
    message: "Paciente registrado correctamente.",
    status: "success" as const,
  })),
}));

vi.mock("@/app/(private)/pacientes/actions", () => ({
  createPatient,
}));

describe("PatientForm", () => {
  beforeEach(() => createPatient.mockClear());

  it("rechaza un nombre compuesto solo por espacios", async () => {
    const user = userEvent.setup();
    render(<PatientForm/>);

    await user.type(screen.getByLabelText("Nombre completo"), "   ");
    await user.type(screen.getByLabelText("Identificador administrativo"), "ID-DEMO-005");
    await user.type(screen.getByLabelText("Teléfono"), "+56 9 5555 5555");
    await user.type(screen.getByLabelText("Correo"), "paciente@example.test");
    await user.click(screen.getByRole("button", { name: "Guardar paciente" }));

    expect(await screen.findByText("Ingresa el nombre completo")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(createPatient).not.toHaveBeenCalled();
  });

  it("confirma el alta devuelta por la acción del servidor", async () => {
    const user = userEvent.setup();
    render(<PatientForm/>);

    await user.type(screen.getByLabelText("Nombre completo"), "Paciente Demo");
    await user.type(screen.getByLabelText("Identificador administrativo"), "ID-DEMO-005");
    await user.type(screen.getByLabelText("Teléfono"), "+56 9 5555 5555");
    await user.type(screen.getByLabelText("Correo"), "paciente@example.test");
    await user.click(screen.getByRole("button", { name: "Guardar paciente" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Paciente registrado correctamente.",
    );
    expect(createPatient).toHaveBeenCalledTimes(1);
  });
});
