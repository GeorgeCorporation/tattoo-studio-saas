import { Outlet } from "react-router-dom";
import { Sidebar, StudioIdentity } from "@/components/layout/Sidebar";
import { useAccess } from "@/hooks/useAccess";

export function DashboardLayout() {
  const { access } = useAccess();
  const studioName = access?.studioName ?? "Seu estúdio";
  const studioLogoUrl = access?.studioLogoUrl ?? null;
  const role = access?.role ?? "manager";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar role={role} showMobileButton={false} studioLogoUrl={studioLogoUrl} studioName={studioName} />

      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-white/10 px-4 lg:hidden">
          <Sidebar role={role} studioLogoUrl={studioLogoUrl} studioName={studioName} />
          <StudioIdentity compact studioLogoUrl={studioLogoUrl} studioName={studioName} />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
