import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { OfflineIndicator } from "@/components/offline-indicator";
import { BackButton } from "@/components/back-button";
import { getCurrentStaff } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const staff = await getCurrentStaff();
  const locale = await getLocale();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar locale={locale} isPlatformAdmin={staff.isPlatformAdmin} />
      {/* min-w-0 is what keeps a wide table inside its own scroll container:
          without it this flex child refuses to shrink below its content width
          and the whole page scrolls sideways instead. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          staffName={`${staff.firstName} ${staff.lastName}`}
          branchLabel={staff.branchName ?? ""}
          locale={locale}
          isPlatformAdmin={staff.isPlatformAdmin}
        />
        <OfflineIndicator />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <BackButton />
          {children}
        </main>
      </div>
    </div>
  );
}
