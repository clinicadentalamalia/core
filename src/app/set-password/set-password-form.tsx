"use client";

import { Eye, LockKeyhole, ShieldCheck } from "lucide-react";
import { useActionState, useState } from "react";
import { updatePassword } from "@/app/set-password/actions";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { error: null };

export function SetPasswordForm() {
  const [show, setShow] = useState(false);
  const [state, action, pending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <div className="card login-form">
      <p className="eyebrow">Invitación verificada</p>
      <h2>Define tu contraseña</h2>
      <p className="muted" style={{ fontSize: ".85rem" }}>
        Esta contraseña habilitará tu acceso privado a Clínica Amalia.
      </p>
      <form action={action}>
        <div className="field">
          <label htmlFor="password">Nueva contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              aria-describedby="password-requirements"
              minLength={12}
              maxLength={128}
              required
            />
            <button
              type="button"
              onClick={() => setShow((current) => !current)}
              className="icon-button"
              aria-label={show ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              aria-pressed={show}
              style={{
                position: "absolute",
                right: 3,
                top: 1,
                border: 0,
                background: "transparent",
              }}
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="confirmation">Confirmar contraseña</label>
          <input
            className="input"
            id="confirmation"
            name="confirmation"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            aria-describedby="password-requirements"
            minLength={12}
            maxLength={128}
            required
          />
        </div>
        <p
          className="muted password-requirements"
          id="password-requirements"
        >
          Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo.
        </p>
        <button type="submit" className="button-primary" disabled={pending}>
          <LockKeyhole size={17} />
          {pending ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
      {state.error ? (
        <div className="error-box" role="alert">
          {state.error}
        </div>
      ) : null}
      <div className="login-note">
        <ShieldCheck size={15} style={{ display: "inline", marginRight: 6 }} />
        Tu sesión y permisos se validan en el servidor y en la base de datos.
      </div>
    </div>
  );
}
