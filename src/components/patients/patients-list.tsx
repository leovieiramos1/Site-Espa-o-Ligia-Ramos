"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Patient, Professional } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { PaymentStatusPill } from "@/components/ui/status-pill";
import { getAvatarColorClass, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type PatientWithProfessional = Patient & { professional: Professional | null };

const filters = ["Todos", "Ativos", "Novos", "Pendências"] as const;

export function PatientsList({ patients }: { patients: PatientWithProfessional[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesQuery =
        query.trim() === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.cpf.includes(query) ||
        p.phone.includes(query);

      const matchesFilter =
        filter === "Todos" ||
        (filter === "Ativos" && p.status === "ATIVO") ||
        (filter === "Novos" && p.status === "NOVO") ||
        (filter === "Pendências" && p.financialStatus !== "PAGO");

      return matchesQuery && matchesFilter;
    });
  }, [patients, query, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone…"
            className="w-full rounded-full border border-line bg-card py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-full border border-line bg-card p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f ? "bg-sage-dark text-cream" : "text-ink/70 hover:bg-sage-light"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0">
        <div className="divide-y divide-line">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/pacientes/${p.id}`}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-cream-soft/60"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-base",
                    !p.photoPath && getAvatarColorClass(p.name)
                  )}
                >
                  {p.photoPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/files/${p.photoPath}`} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(p.name)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {p.name}
                    {p.nickname && <span className="ml-1.5 font-normal text-muted">“{p.nickname}”</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {p.treatment || "Tratamento não definido"}
                    {p.professional ? ` · ${p.professional.name}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div className="hidden text-right sm:block">
                  <p className="text-ink/80">{p.phone}</p>
                  <p className="text-xs text-muted">
                    Próxima: {p.nextVisitAt ? new Date(p.nextVisitAt).toLocaleDateString("pt-BR") : "não agendada"}
                  </p>
                </div>
                <PaymentStatusPill status={p.financialStatus} />
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Nenhum paciente encontrado.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
