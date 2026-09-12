"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/app/api/notificacoes/route";

const toneDot: Record<NotificationItem["tone"], string> = {
  default: "bg-sage",
  alert: "bg-status-alert",
  good: "bg-status-done",
};

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && items === null) {
      try {
        const res = await fetch("/api/notificacoes");
        if (res.ok) setItems(await res.json());
        else setItems([]);
      } catch {
        setItems([]);
      }
    }
  }

  const hasUnread = (items?.length ?? 0) > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink/70 hover:bg-sage-light"
        aria-label="Notificações"
      >
        <Bell size={18} strokeWidth={1.75} />
        {hasUnread && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-status-alert" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-line bg-card p-2 shadow-xl">
          <p className="px-3 py-2 font-display text-sm text-ink">Notificações</p>
          {items === null ? (
            <p className="px-3 py-6 text-center text-sm text-muted">Carregando…</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <BellOff size={20} className="text-muted" />
              <p className="text-sm text-muted">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 hover:bg-cream-soft"
                >
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", toneDot[item.tone])} />
                  <span>
                    <span className="block text-sm font-medium text-ink">{item.title}</span>
                    <span className="block text-xs text-muted">{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
