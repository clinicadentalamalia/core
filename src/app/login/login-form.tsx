"use client";

import { Eye, LockKeyhole, ShieldCheck } from "lucide-react";
import { useActionState, useState } from "react";
import { signIn } from "@/app/auth/actions";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { error: null };

export function LoginForm({ notice }: { notice?: string }) {
  const [show, setShow] = useState(false);
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <div className="card login-form">
      <p className="eyebrow">Bienvenida</p>
      <h2>Iniciar sesión</h2>
      <p className="muted" style={{ fontSize: ".85rem" }}>
        Acceso exclusivo para personal autorizado.
      </p>
      <form action={action}>
        <div className="field">
          <label htmlFor="email">Correo institucional</label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            placeholder="usuario@clinica.example"
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              style={{ paddingRight: 45 }}
              id="password"
              name="password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={8}
              maxLength={128}
              required
            />
            <button
              type="button"
              onClick={() => setShow((current) => !current)}
              className="icon-button"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
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
        <button type="submit" className="button-primary" disabled={pending}>
          <LockKeyhole size={17} />
          {pending ? "Validando…" : "Entrar"}
        </button>
      </form>
      {(state.error || notice) && (
        <div className="error-box" role="alert">
          {state.error ?? notice}
        </div>
      )}
      <div className="login-note">
        <ShieldCheck size={15} style={{ display: "inline", marginRight: 6 }} />
        La sesión se valida en el servidor y los permisos se aplican también en
        la base de datos.
      </div>
    </div>
  );
}
