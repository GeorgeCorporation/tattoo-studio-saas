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
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type SidebarProps = {
  studioName?: string;
  showMobileButton?: boolean;
};

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Tatuadores", href: "/tatuadores", icon: Scissors },
  { label: "Serviços", href: "/servicos", icon: Palette },
  { label: "Galeria", href: "/galeria", icon: Camera },
  { label: "Entregas", href: "/entregas", icon: Images },
  { label: "Financeiro", href: "/financeiro", icon: Banknote },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar({ studioName = "Ideal Tattoo", showMobileButton = true }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const content = (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#0f0f0f] text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <div>
          <p className="text-lg font-semibold">Ideal Tattoo</p>
          <p className="text-xs text-zinc-500">Studio SaaS</p>
        </div>
        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} type="button">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;

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
