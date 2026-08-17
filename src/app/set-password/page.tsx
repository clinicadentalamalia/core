import { InvitationSessionGate } from "@/app/set-password/invitation-session-gate";
import { SetPasswordForm } from "@/app/set-password/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="login-page">
      <section className="login-art">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">Clínica Amalia</div>
            <div className="brand-subtitle">Acceso privado</div>
          </div>
        </div>
        <div className="login-copy">
          <p className="eyebrow" style={{ color: "white", opacity: 0.78 }}>
            Activación de cuenta
          </p>
          <h1>Protege tu acceso.</h1>
          <p style={{ maxWidth: 480, lineHeight: 1.7, opacity: 0.78 }}>
            Define una contraseña única para ingresar al entorno privado de
            gestión.
          </p>
        </div>
        <div className="environment-caption">
          Entorno de desarrollo · No ingresar datos reales
        </div>
      </section>
      <section className="login-form-wrap">
        <InvitationSessionGate>
          <SetPasswordForm />
        </InvitationSessionGate>
      </section>
    </main>
  );
}
