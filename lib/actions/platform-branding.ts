"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BUCKET = "edoslmis-branding";
const PREFIX = "platform";
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB, under the 5MB Server Action body limit
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

type ActionState = { error: string | null } | null;

// The logo appears in the chrome of every page for every tenant, so a change
// here has to invalidate more than one route's cache.
function revalidateChrome() {
  revalidatePath("/admin/tenants");
  revalidatePath("/login");
  revalidatePath("/", "layout");
}

export async function uploadAppLogo(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get("app_logo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a logo file." };
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File is too large — max ${MAX_FILE_SIZE / (1024 * 1024)}MB.` };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { error: "Unsupported file type — upload an SVG, PNG, JPEG, or WEBP image." };
  }

  const staff = await getCurrentStaff();
  if (!staff.isPlatformAdmin) {
    return { error: "Only a platform administrator can change the application logo." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("edoslmis_platform_settings")
    .select("app_logo_path")
    .maybeSingle();
  const previousPath = existing?.app_logo_path ?? null;

  // Timestamped filename rather than a fixed one: the bucket is public and
  // sits behind a CDN, so reusing a path would keep serving the old image
  // from cache after a replacement.
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${PREFIX}/app-logo-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase
    .from("edoslmis_platform_settings")
    .upsert({ id: true, app_logo_path: path, updated_by: staff.userId }, { onConflict: "id" });
  if (error) return { error: error.message };

  if (previousPath && previousPath !== path) {
    await supabase.storage.from(BUCKET).remove([previousPath]);
  }

  revalidateChrome();
  return { error: null };
}

export async function clearAppLogo(_prevState: ActionState): Promise<ActionState> {
  const staff = await getCurrentStaff();
  if (!staff.isPlatformAdmin) {
    return { error: "Only a platform administrator can change the application logo." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("edoslmis_platform_settings")
    .select("app_logo_path")
    .maybeSingle();

  const { error } = await supabase
    .from("edoslmis_platform_settings")
    .upsert({ id: true, app_logo_path: null, updated_by: staff.userId }, { onConflict: "id" });
  if (error) return { error: error.message };

  if (existing?.app_logo_path) {
    await supabase.storage.from(BUCKET).remove([existing.app_logo_path]);
  }

  revalidateChrome();
  return { error: null };
}
