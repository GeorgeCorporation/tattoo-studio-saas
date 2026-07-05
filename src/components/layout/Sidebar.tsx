import {
  Banknote,
  CalendarDays,
  Camera,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Scissors,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { inkoraLogo } from "@/assets";
import { useAccess } from "@/hooks/useAccess";
import { useAuth } from "@/hooks/useAuth";
import { getSidebarItemsForRole } from "@/lib/access-control";

type SidebarProps = {
  studioName?: string;
  showMobileButton?: boolean;
};

const icons = {
  dashboard: LayoutDashboard,
  agenda: CalendarDays,
  clientes: Users,
  tatuadores: Scissors,
  servicos: Palette,
  galeria: Camera,
  entregas: Images,
  financeiro: Banknote,
  configuracoes: Settings,
};

export function Sidebar({ studioName = "Seu estúdio", showMobileButton = true }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { access } = useAccess();
  const [open, setOpen] = useState(false);
  const items = getSidebarItemsForRole(access?.role ?? "manager");
  const subtitle = access?.role === "artist" ? "Painel do tatuador" : "Studio SaaS";

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const content = (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#0f0f0f] text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <img alt="Inkora" className="h-9 w-auto" src={inkoraLogo} />
          <div>
            <p className="text-lg font-semibold">Inkora</p>
            <p className="text-xs text-zinc-500">{subtitle}</p>
          </div>
        </div>
        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} type="button">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const Icon = icons[item.icon];

          return (
            <NavLink
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-[#E8650A] text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
              key={item.href}
              onClick={() => setOpen(false)}
              to={item.href}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold">{studioName}</p>
        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
          onClick={handleSignOut}
          type="button"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {showMobileButton ? (
        <button
          className="inline-flex rounded-xl border border-white/10 p-2 text-white lg:hidden"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Menu size={22} />
        </button>
      ) : null}

      <div className="hidden min-h-screen lg:block">{content}</div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="relative h-full">{content}</div>
        </div>
      ) : null}
    </>
  );
}
