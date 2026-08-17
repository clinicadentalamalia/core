"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(12)
      .max(128)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmation: z.string(),
  })
  .refine(({ confirmation, password }) => confirmation === password);

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return {
      error:
        "Usa 12 caracteres o más, con mayúscula, minúscula, número y símbolo. Ambas contraseñas deben coincidir.",
    };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (typeof claimsData?.claims.sub !== "string") {
    return { error: "La invitación expiró. Solicita una nueva invitación." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "No fue posible guardar la contraseña. Inténtalo nuevamente." };
  }

  redirect("/dashboard");
}
