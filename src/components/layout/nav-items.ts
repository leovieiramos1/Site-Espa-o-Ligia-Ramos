import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  UserRound,
  Wallet,
  CreditCard,
  PartyPopper,
  MessageCircle,
  Package,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, ready: true },
  { href: "/pacientes", label: "Pacientes", icon: Users, ready: true },
  { href: "/prontuarios", label: "Prontuários", icon: FileText, ready: true },
  { href: "/equipe", label: "Equipe", icon: UserRound, ready: false },
  { href: "/financeiro", label: "Financeiro", icon: Wallet, ready: false },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard, ready: false },
  { href: "/eventos", label: "Eventos", icon: PartyPopper, ready: false },
  { href: "/comunicacao", label: "Comunicação", icon: MessageCircle, ready: false },
  { href: "/estoque", label: "Estoque", icon: Package, ready: false },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, ready: false },
  { href: "/configuracoes", label: "Configurações", icon: Settings, ready: false },
];

export function getMobileNavItems(visibleItems: NavItem[]) {
  return visibleItems.slice(0, 3);
}
