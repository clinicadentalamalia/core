import { LoginForm } from "@/app/login/login-form";

const notices: Record<string, string> = {
  inactive: "Tu cuenta no está activa. Solicita acceso a administración.",
  unauthorized: "Necesitas iniciar sesión para acceder.",
  "invite-invalid":
    "La invitación no es válida o expiró. Solicita una nueva invitación.",
  "invite-required": "Abre el enlace de invitación recibido por correo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

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
          <p
            style={{
              fontWeight: 750,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              fontSize: ".72rem",
              opacity: 0.72,
            }}
          >
            Cuidado que se siente
          </p>
          <h1>Gestión clínica clara y humana.</h1>
          <p style={{ maxWidth: 480, lineHeight: 1.7, opacity: 0.78 }}>
            Un espacio privado para acompañar la operación odontológica y de
            armonización facial.
          </p>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: ".75rem",
            opacity: 0.66,
          }}
        >
          Entorno de desarrollo · No ingresar datos reales
        </div>
      </section>
      <section className="login-form-wrap">
        <LoginForm notice={reason ? notices[reason] : undefined} />
      </section>
    </main>
  );
}
