"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createClient() {
  const { key, url } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, key);
}
