import { FlaskConical } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import type { Locale } from "@/lib/i18n/dictionaries";

export function Sidebar({ locale = "en", isPlatformAdmin = false }: { locale?: Locale; isPlatformAdmin?: boolean }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FlaskConical size={18} />
        </div>
        <span className="font-semibold text-foreground">EDOS LMIS</span>
      </div>
      <SidebarNav locale={locale} isPlatformAdmin={isPlatformAdmin} />
    </aside>
  );
}
