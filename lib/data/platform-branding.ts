import { createClient } from "@/lib/supabase/server";

const BUCKET = "edoslmis-branding";

export type PlatformBranding = {
  appLogoPath: string | null;
  appLogoUrl: string | null;
};

/**
 * The EDOS product logo shown in the app chrome — sidebar, mobile nav drawer,
 * and the login page. One value for the whole installation, so every tenant
 * sees the same mark.
 *
 * Not to be confused with getTenantSettings().logo_url, which is the
 * individual clinic's logo printed on their invoices and reports.
 *
 * Safe to call unauthenticated: the row is world-readable by policy and the
 * bucket is public-read, which is what lets the login page render it.
 */
export async function getPlatformBranding(): Promise<PlatformBranding> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("edoslmis_platform_settings")
    .select("app_logo_path")
    .maybeSingle();

  const path = data?.app_logo_path ?? null;

  return {
    appLogoPath: path,
    appLogoUrl: path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : null,
  };
}
