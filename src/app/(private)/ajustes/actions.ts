"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { writeOperationalLog } from "@/lib/monitoring";
import { staffAccessSchema } from "@/lib/validation/staff";
import type { StaffAccessActionState } from "@/types/staff";

export async function updateStaffAccess(
  _previousState: StaffAccessActionState,
  formData: FormData,
): Promise<StaffAccessActionState> {
  const startedAt = Date.now();
  const requestId = (await headers()).get("x-vercel-id");
  const parsed = staffAccessSchema.safeParse({
    displayName: formData.get("displayName"),
    roleCodes: formData.getAll("roleCodes"),
    status: formData.get("status"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    writeOperationalLog({
      code: "VALIDATION",
      durationMs: Date.now() - startedAt,
      event: "staff_access_update",
      level: "error",
      outcome: "denied",
      requestId,
      route: "/ajustes",
    });
    return {
      message:
        parsed.error.issues[0]?.message ?? "Revisa los datos del personal.",
      status: "error",
    };
  }

  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || typeof claimsData?.claims.sub !== "string") {
      writeOperationalLog({
        code: "UNAUTHENTICATED",
        durationMs: Date.now() - startedAt,
        event: "staff_access_update",
        level: "error",
        outcome: "denied",
        requestId,
        route: "/ajustes",
      });
      return {
        message: "Tu sesión expiró. Vuelve a ingresar para continuar.",
        status: "error",
      };
    }

    const { error } = await supabase.rpc("manage_staff_access", {
      p_display_name: parsed.data.displayName,
      p_role_codes: parsed.data.roleCodes,
      p_status: parsed.data.status,
      p_user_id: parsed.data.userId,
    });

    if (!error) {
      writeOperationalLog({
        durationMs: Date.now() - startedAt,
        event: "staff_access_update",
        level: "info",
        outcome: "success",
        requestId,
        route: "/ajustes",
      });
      revalidatePath("/ajustes");
      return {
        message: "Acceso actualizado correctamente.",
        status: "success",
      };
    }

    const denied = error.code === "42501";
    writeOperationalLog({
      code: error.code,
      durationMs: Date.now() - startedAt,
      event: "staff_access_update",
      level: "error",
      outcome: denied ? "denied" : "error",
      requestId,
      route: "/ajustes",
    });
    return {
      message: denied
        ? "No tienes permiso para modificar esta cuenta."
        : "No fue posible guardar los permisos. Intenta nuevamente.",
      status: "error",
    };
  } catch {
    writeOperationalLog({
      code: "UNEXPECTED",
      durationMs: Date.now() - startedAt,
      event: "staff_access_update",
      level: "error",
      outcome: "error",
      requestId,
      route: "/ajustes",
    });
    return {
      message: "No fue posible guardar los permisos. Intenta nuevamente.",
      status: "error",
    };
  }
}
