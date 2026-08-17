import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StaffAccessForm } from "@/app/(private)/ajustes/staff-access-form";
import { staffAccessSchema } from "@/lib/validation/staff";

vi.mock("@/app/(private)/ajustes/actions", () => ({
  updateStaffAccess: vi.fn(async () => ({
    message: null,
    status: "idle",
  })),
}));

const roles = [
  { code: "admin" as const, name: "Administración", scope: "Acceso total" },
  { code: "reception" as const, name: "Recepción", scope: "Agenda" },
];

const entry = {
  displayName: "Personal de prueba",
  email: "staff@example.test",
  id: "60000000-0000-4000-8000-000000000002",
  roleCodes: ["reception" as const],
  status: "active" as const,
  updatedAt: "2026-08-16T12:00:00.000Z",
};

describe("StaffAccessForm", () => {
  it("protege la cuenta del administrador actual", () => {
    render(
      <StaffAccessForm
        currentUserId={entry.id}
        entry={entry}
        roles={roles}
      />,
    );

    expect(screen.getByText("Tu cuenta")).toBeVisible();
    expect(screen.getByLabelText("Nombre visible")).toBeDisabled();
    expect(screen.getByLabelText("Estado de acceso")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Guardar acceso" }),
    ).not.toBeInTheDocument();
  });

  it("permite preparar cambios para otra cuenta", () => {
    render(
      <StaffAccessForm
        currentUserId="60000000-0000-4000-8000-000000000001"
        entry={entry}
        roles={roles}
      />,
    );

    expect(screen.getByText("staff@example.test")).toBeVisible();
    expect(screen.getByLabelText("Nombre visible")).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /Recepción/ })).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Guardar acceso" }),
    ).toBeEnabled();
  });
});

describe("staffAccessSchema", () => {
  it("exige al menos un rol para una cuenta activa", () => {
    const result = staffAccessSchema.safeParse({
      displayName: "Personal de prueba",
      roleCodes: [],
      status: "active",
      userId: entry.id,
    });

    expect(result.success).toBe(false);
  });

  it("permite suspender una cuenta sin conservar roles", () => {
    const result = staffAccessSchema.safeParse({
      displayName: "Personal de prueba",
      roleCodes: [],
      status: "inactive",
      userId: entry.id,
    });

    expect(result.success).toBe(true);
  });
});
