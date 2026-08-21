"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, FlaskConical } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Navigation for anything narrower than the `lg` breakpoint, where the fixed
 * 240px sidebar is hidden. Phones and tablets get the same nav tree in a
 * slide-in drawer instead of losing navigation entirely.
 */
export function MobileNav({
  locale = "en",
  isPlatformAdmin = false,
}: {
  locale?: Locale;
  isPlatformAdmin?: boolean;
}) {
  const pathname = usePathname();
  // Remembering which route the drawer was opened on — rather than a plain
  // boolean — closes it on any navigation, including browser back/forward,
  // without an effect that would have to chase `pathname`.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  // The drawer covers the page, so let Escape dismiss it and stop the page
  // behind it from scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedAt(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface-muted"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex h-full w-[17rem] max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl"
          >
            <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FlaskConical size={18} />
              </div>
              <span className="flex-1 font-semibold text-foreground">EDOS LMIS</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav
              locale={locale}
              isPlatformAdmin={isPlatformAdmin}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
