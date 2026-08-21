import { SidebarNav } from "@/components/sidebar-nav";
import { AppLogo } from "@/components/app-logo";
import type { Locale } from "@/lib/i18n/dictionaries";

export function Sidebar({
  locale = "en",
  isPlatformAdmin = false,
  appLogoUrl = null,
}: {
  locale?: Locale;
  isPlatformAdmin?: boolean;
  appLogoUrl?: string | null;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <AppLogo src={appLogoUrl} />
        <span className="font-semibold text-foreground">EDOS LMIS</span>
      </div>
      <SidebarNav locale={locale} isPlatformAdmin={isPlatformAdmin} />
    </aside>
  );
}
