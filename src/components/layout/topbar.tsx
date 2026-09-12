"use client";

import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { QuickActions } from "./quick-actions";
import { NotificationsPanel } from "./notifications-panel";

export function Topbar() {
  const [quickOpen, setQuickOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-cream/80 px-5 py-4 backdrop-blur md:px-8">
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Buscar paciente, consulta, documento…"
          className="w-full rounded-full border border-line bg-card py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <NotificationsPanel />
        {isAdmin && (
          <button
            onClick={() => setQuickOpen(true)}
            className="flex items-center gap-2 rounded-full bg-sage-dark px-4 py-2 text-sm font-medium text-cream hover:bg-sage-darker"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nova ação</span>
          </button>
        )}
      </div>

      {quickOpen && <QuickActions onClose={() => setQuickOpen(false)} />}
    </header>
  );
}
