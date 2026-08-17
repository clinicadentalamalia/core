"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateStaffAccess } from "@/app/(private)/ajustes/actions";
import type {
  StaffAccessActionState,
  StaffDirectoryEntry,
  StaffRoleOption,
} from "@/types/staff";

const initialState: StaffAccessActionState = {
  message: null,
  status: "idle",
};

const statusNames = {
  active: "Activa",
  inactive: "Suspendida",
  pending: "Pendiente",
} as const;

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santiago",
});

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="button-primary"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "Guardando…" : "Guardar acceso"}
    </button>
  );
}

export function StaffAccessForm({
  currentUserId,
  entry,
  roles,
}: {
  currentUserId: string;
  entry: StaffDirectoryEntry;
  roles: StaffRoleOption[];
}) {
  const [state, formAction] = useActionState(updateStaffAccess, initialState);
  const isCurrentUser = entry.id === currentUserId;

  return (
    <form action={formAction} className="staff-card card">
      <input name="userId" type="hidden" value={entry.id} />
      <div className="staff-card-heading">
        <div>
          <p className="eyebrow">{statusNames[entry.status]}</p>
          <h2 className="section-title">
            {entry.displayName ?? "Personal pendiente"}
          </h2>
          <p className="muted staff-email">
            {entry.email ?? "Correo no sincronizado"}
          </p>
        </div>
        {isCurrentUser ? <span className="badge info">Tu cuenta</span> : null}
      </div>

      <div className="staff-form-grid">
        <div className="field">
          <label htmlFor={`display-name-${entry.id}`}>Nombre visible</label>
          <input
            className="input"
            defaultValue={entry.displayName ?? ""}
            disabled={isCurrentUser}
            id={`display-name-${entry.id}`}
            maxLength={100}
            minLength={2}
            name="displayName"
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`status-${entry.id}`}>Estado de acceso</label>
          <select
            className="input"
            defaultValue={entry.status}
            disabled={isCurrentUser}
            id={`status-${entry.id}`}
            name="status"
          >
            <option value="pending">Pendiente</option>
            <option value="active">Activa</option>
            <option value="inactive">Suspendida</option>
          </select>
        </div>
      </div>

      <fieldset className="role-options" disabled={isCurrentUser}>
        <legend>Roles autorizados</legend>
        {roles.map((role) => (
          <label className="role-option" key={role.code}>
            <input
              defaultChecked={entry.roleCodes.includes(role.code)}
              name="roleCodes"
              type="checkbox"
              value={role.code}
            />
            <span>
              <strong>{role.name}</strong>
              <small>{role.scope}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="staff-card-footer">
        <p className="muted staff-updated">
          Actualizada {dateFormatter.format(new Date(entry.updatedAt))}
        </p>
        {isCurrentUser ? (
          <p className="staff-protection-note">
            Tu propia cuenta no puede suspenderse ni cambiar sus roles aquí.
          </p>
        ) : (
          <SaveButton disabled={false} />
        )}
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={state.status === "success" ? "success-box" : "error-box"}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
