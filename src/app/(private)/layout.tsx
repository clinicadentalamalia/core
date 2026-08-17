import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId =
    typeof claimsData?.claims.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (!userId) {
    redirect("/login?reason=unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, status, user_roles!user_roles_user_id_fkey(role_code)",
    )
    .eq("id", userId)
    .maybeSingle();

  const roleCodes =
    profile?.user_roles.map(({ role_code }) => role_code) ?? [];

  if (profile?.status !== "active" || roleCodes.length === 0) {
    redirect("/login?reason=inactive");
  }

  return (
    <AppShell
      user={{
        displayName: profile.display_name ?? "Usuario autorizado",
        roleCodes,
      }}
    >
      {children}
    </AppShell>
  );
}
