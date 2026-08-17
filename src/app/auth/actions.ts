"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";

const signInSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(8).max(128),
});

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Revisa el correo y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "No fue posible iniciar sesión con esas credenciales." };
  }

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId =
    typeof claimsData?.claims.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (!userId) {
    await supabase.auth.signOut();
    return { error: "No fue posible validar la sesión." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, user_roles!user_roles_user_id_fkey(role_code)")
    .eq("id", userId)
    .maybeSingle();

  if (
    profile?.status !== "active" ||
    profile.user_roles.length === 0
  ) {
    await supabase.auth.signOut();
    return {
      error: "La cuenta aún no está activa o no tiene un rol asignado.",
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
