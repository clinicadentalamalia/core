"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SessionState = "checking" | "ready" | "invalid";

export function InvitationSessionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>("checking");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function validateInvitation() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}${window.location.search}`,
        );

        if (error) {
          if (mounted) setState("invalid");
          return;
        }
      }

      const { data, error } = await supabase.auth.getClaims();

      if (mounted) {
        setState(
          !error && typeof data?.claims.sub === "string" ? "ready" : "invalid",
        );
      }
    }

    void validateInvitation();
    return () => {
      mounted = false;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="card login-form" role="status">
        <p className="eyebrow">Validando invitación</p>
        <h2>Un momento…</h2>
        <p className="muted">Estamos protegiendo y preparando tu acceso.</p>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="card login-form">
        <p className="eyebrow">Invitación no disponible</p>
        <h2>Solicita un enlace nuevo</h2>
        <div className="error-box" role="alert">
          La invitación no es válida o expiró.
        </div>
        <Link className="button-primary password-return-link" href="/login">
          Volver al acceso
        </Link>
      </div>
    );
  }

  return children;
}
