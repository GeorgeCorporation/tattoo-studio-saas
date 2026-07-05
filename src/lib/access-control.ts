export const userRoles = ["manager", "artist"] as const;
export type UserRole = (typeof userRoles)[number];

export type SidebarItemDefinition = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "agenda"
    | "clientes"
    | "tatuadores"
    | "servicos"
    | "galeria"
    | "entregas"
    | "financeiro"
    | "configuracoes";
};

const managerSidebarItems: SidebarItemDefinition[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Agenda", href: "/agenda", icon: "agenda" },
  { label: "Clientes", href: "/clientes", icon: "clientes" },
  { label: "Tatuadores", href: "/tatuadores", icon: "tatuadores" },
  { label: "Serviços", href: "/servicos", icon: "servicos" },
  { label: "Galeria", href: "/galeria", icon: "galeria" },
  { label: "Entregas", href: "/entregas", icon: "entregas" },
  { label: "Financeiro", href: "/financeiro", icon: "financeiro" },
  { label: "Configurações", href: "/configuracoes", icon: "configuracoes" },
];

const artistSidebarItems: SidebarItemDefinition[] = [
  { label: "Painel", href: "/painel", icon: "dashboard" },
  { label: "Agenda", href: "/painel/agenda", icon: "agenda" },
  { label: "Clientes", href: "/painel/clientes", icon: "clientes" },
  { label: "Entregas", href: "/painel/entregas", icon: "entregas" },
  { label: "Financeiro", href: "/painel/financeiro", icon: "financeiro" },
];

export function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

export function getSidebarItemsForRole(role: UserRole) {
  return role === "artist" ? artistSidebarItems : managerSidebarItems;
}
