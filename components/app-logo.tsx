import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The EDOS product mark, as configured by a platform admin under
 * Administration → Tenant Management.
 *
 * Renders the uploaded logo when one is set, and the built-in flask badge
 * otherwise, so the chrome never shows a broken image on an installation
 * that has not uploaded a logo yet.
 *
 * `src` is a Supabase storage URL on a domain that is not registered with
 * next/image, so this deliberately uses a plain <img> — the same approach
 * BrandingUploadForm takes for tenant logos.
 */
export function AppLogo({
  src,
  size = "md",
  className,
}: {
  src: string | null;
  size?: "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const icon = size === "lg" ? 26 : 18;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="EDOS LMIS"
        className={cn(box, "shrink-0 rounded-lg object-contain", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <FlaskConical size={icon} />
    </div>
  );
}
