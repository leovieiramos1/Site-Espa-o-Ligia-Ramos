"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChevronsLeft, ChevronsRight, HelpCircle, LogOut } from "lucide-react";
import { navItems } from "./nav-items";
import { LogoMark } from "./logo-mark";
import { cn } from "@/lib/utils";
import { canAccessPath, roleLabels, type Role } from "@/lib/permissions";
import { getInitials } from "@/lib/avatar";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const role = session?.user?.role as Role | undefined;

  const visibleItems = role
    ? navItems.filter((item) => canAccessPath(role, item.href))
    : navItems;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-cream-soft/60 py-6 transition-all md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex items-center gap-3 px-5", collapsed && "justify-center px-0")}>
        <LogoMark />
        {!collapsed && (
          <div>
            <p className="font-display text-base leading-tight text-ink">Espaço Lígia Ramos</p>
            <p className="text-xs text-muted">Movimento é saúde</p>
          </div>
        )}
      </div>

      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto px-3">
        {visibleItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sage-dark text-cream"
                  : "text-ink/75 hover:bg-sage-light hover:text-sage-darker",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-line px-3 pt-4">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-cream-soft",
            collapsed && "justify-center px-0"
          )}
        >
          <HelpCircle size={18} strokeWidth={1.75} />
          {!collapsed && <span>Ajuda</span>}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-cream-soft",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} strokeWidth={1.75} />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-cream-soft",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span>Recolher</span>}
        </button>

        {session?.user && (
          <div className={cn("flex items-center gap-3 rounded-xl px-3 pt-3", collapsed && "justify-center px-0")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-light font-display text-sm text-sage-darker">
              {getInitials(session.user.name ?? session.user.email ?? "?")}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{session.user.name}</p>
                <p className="truncate text-xs text-muted">{role ? roleLabels[role] : ""}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
