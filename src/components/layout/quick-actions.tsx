"use client";

import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  UserPlus,
  UserRoundPlus,
  Receipt,
  PartyPopper,
  PackagePlus,
  X,
} from "lucide-react";

const actions = [
  { label: "Nova consulta", icon: CalendarPlus, href: "/agenda/nova" },
  { label: "Novo paciente", icon: UserPlus, href: "/pacientes/novo" },
  { label: "Novo profissional", icon: UserRoundPlus, href: "/equipe/novo" },
  { label: "Novo pagamento", icon: Receipt, href: "/pagamentos/novo" },
  { label: "Novo evento", icon: PartyPopper, href: "/eventos/novo" },
  { label: "Novo item de estoque", icon: PackagePlus, href: "/estoque/novo" },
];

export function QuickActions({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-card p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Ações rápidas</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {actions.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              onClick={() => go(href)}
              className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-left text-sm text-ink hover:border-sage hover:bg-sage-light"
            >
              <Icon size={16} className="shrink-0 text-sage-dark" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
