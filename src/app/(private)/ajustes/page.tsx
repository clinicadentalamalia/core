import { MailWarning, ShieldCheck, UserRoundCog } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { StaffAccessForm } from "@/app/(private)/ajustes/staff-access-form";
import { createClient } from "@/lib/supabase/server";
import {
  staffRoleCodes,
  staffStatuses,
  type StaffDirectoryEntry,
  type StaffRoleCode,
  type StaffRoleOption,
} from "@/types/staff";

function isStaffRoleCode(value: string): value is StaffRoleCode {
  return staffRoleCodes.some((role) => role === value);
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const currentUserId =
    typeof claimsData?.claims.sub === "string" ? claimsData.claims.sub : null;

  if (!currentUserId) {
    redirect("/login?reason=unauthorized");
  }

  const [currentProfileResult, staffResult, rolesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_roles!user_roles_user_id_fkey(role_code)")
      .eq("id", currentUserId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select(
        "id, display_name, status, updated_at, staff_accounts!staff_accounts_user_id_fkey(email), user_roles!user_roles_user_id_fkey(role_code)",
      )
      .order("display_name", { ascending: true }),
    supabase
      .from("roles")
      .select("code, name, scope")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const isAdmin = currentProfileResult.data?.user_roles.some(
    ({ role_code }) => role_code === "admin",
  );
  if (!isAdmin) {
    notFound();
  }

  if (staffResult.error || rolesResult.error) {
    throw new Error("No fue posible cargar la administración de personal.");
  }

  const staff: StaffDirectoryEntry[] = (staffResult.data ?? []).map(
    (profile) => ({
      displayName: profile.display_name,
      email: profile.staff_accounts?.email ?? null,
      id: profile.id,
      roleCodes: profile.user_roles
        .map(({ role_code }) => role_code)
        .filter(isStaffRoleCode),
      status: staffStatuses.includes(
        profile.status as (typeof staffStatuses)[number],
      )
        ? (profile.status as (typeof staffStatuses)[number])
        : "pending",
      updatedAt: profile.updated_at,
    }),
  );

  const roles: StaffRoleOption[] = (rolesResult.data ?? [])
    .filter((role): role is typeof role & { code: StaffRoleCode } =>
      isStaffRoleCode(role.code),
    )
    .map((role) => ({ code: role.code, name: role.name, scope: role.scope }));

  return (
    <>
      <div className="hero-row">
        <div>
          <p className="eyebrow">Administración protegida</p>
          <h1 className="page-title">Usuarios y accesos</h1>
          <p className="muted">
            Activa, suspende y asigna permisos sin exponer claves ni datos
            clínicos.
          </p>
        </div>
        <span className="badge success">
          <ShieldCheck size={14} /> Solo administración
        </span>
      </div>

      <section className="settings-summary-grid" aria-label="Estado operativo">
        <article className="card settings-summary-card">
          <UserRoundCog aria-hidden="true" size={22} />
          <div>
            <strong>{staff.length} cuentas sincronizadas</strong>
            <p className="muted">
              Las actualizaciones quedan registradas en la auditoría.
            </p>
          </div>
        </article>
        <article className="card settings-summary-card">
          <MailWarning aria-hidden="true" size={22} />
          <div>
            <strong>Invitación manual por ahora</strong>
            <p className="muted">
              Crea la cuenta en Supabase Auth y luego asigna su acceso aquí.
            </p>
          </div>
        </article>
      </section>

      <section className="staff-list" aria-label="Personal autorizado">
        {staff.map((entry) => (
          <StaffAccessForm
            currentUserId={currentUserId}
            entry={entry}
            key={entry.id}
            roles={roles}
          />
        ))}
      </section>
    </>
  );
}
