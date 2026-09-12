"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, MoreHorizontal } from "lucide-react";
import { navItems, getMobileNavItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { canAccessPath, type Role } from "@/lib/permissions";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const visibleItems = role ? navItems.filter((item) => canAccessPath(role, item.href)) : navItems;
  const mobileItems = getMobileNavItems(visibleItems);

  return (
    <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-line bg-card/95 py-2 backdrop-blur md:hidden">
      {mobileItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px]",
              active ? "text-sage-darker" : "text-muted"
            )}
          >
            <Icon size={20} strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
      <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] text-cream">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-dark">
          <Plus size={18} />
        </span>
      </button>
      <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] text-muted">
        <MoreHorizontal size={20} strokeWidth={1.75} />
        Mais
      </button>
    </nav>
  );
}
