import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { signOut } from "@/lib/actions/auth";
import type { Locale } from "@/lib/i18n/dictionaries";
import { Search, LogOut } from "lucide-react";

export function Topbar({
  staffName,
  branchLabel,
  locale,
  isPlatformAdmin = false,
}: {
  staffName: string;
  branchLabel: string;
  locale: Locale;
  isPlatformAdmin?: boolean;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:gap-4 sm:px-4 lg:px-6">
      <MobileNav locale={locale} isPlatformAdmin={isPlatformAdmin} />

      <div className="flex min-w-0 flex-1 items-center gap-2 max-w-md">
        <div className="relative w-full">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            placeholder="Search patients, orders, specimens..."
            aria-label="Search"
            className="h-9 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
          />
        </div>
      </div>

      {/* ml-auto, not justify-between on the header: the search box is capped
          at max-w-md, so the space it declines to fill would otherwise pool
          between it and these controls instead of pushing them to the edge. */}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-muted-foreground lg:inline">{branchLabel}</span>
        <LanguageSwitcher locale={locale} />
        <ThemeToggle />
        <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-3">
          <span className="hidden max-w-[12rem] truncate text-sm font-medium text-foreground lg:inline">
            {staffName}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface-muted"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
