import { Outlet } from "react-router-dom";
import { inkoraMark } from "@/assets";
import { Sidebar } from "@/components/layout/Sidebar";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardLayout() {
  const { studio } = useDashboard();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar showMobileButton={false} studioName={studio?.name} />

      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-white/10 px-4 lg:hidden">
          <Sidebar studioName={studio?.name} />
          <img alt="Inkora" className="h-8 w-8" src={inkoraMark} />
          <p className="font-semibold">Inkora</p>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
