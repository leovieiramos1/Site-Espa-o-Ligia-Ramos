import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AgendaView } from "@/components/agenda/agenda-view";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/auth/role-gate";
import { Plus, Repeat } from "lucide-react";
import { addDays, parseDateParam, startOfWeek, startOfMonth } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

const VALID_VIEWS = ["Dia", "Semana", "Mês", "Lista"] as const;
type ViewName = (typeof VALID_VIEWS)[number];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const params = await searchParams;
  const view: ViewName = VALID_VIEWS.includes(params.view as ViewName)
    ? (params.view as ViewName)
    : "Dia";
  const date = parseDateParam(params.date);

  let range: { gte: Date; lt: Date } | undefined;
  if (view === "Dia") {
    range = { gte: date, lt: addDays(date, 1) };
  } else if (view === "Semana") {
    const start = startOfWeek(date);
    range = { gte: start, lt: addDays(start, 7) };
  } else if (view === "Mês") {
    const gridStart = startOfWeek(startOfMonth(date));
    range = { gte: gridStart, lt: addDays(gridStart, 42) };
  }
  // Lista: sem filtro de data — mostra tudo.

  const [appointments, professionals, session] = await Promise.all([
    prisma.appointment.findMany({
      where: range ? { startsAt: range } : undefined,
      include: { patient: true, professional: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.professional.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    auth(),
  ]);

  const canManage = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Agenda</h1>
          <p className="mt-1 text-sm text-muted">Gerencie consultas, confirmações e reagendamentos.</p>
        </div>
        <RoleGate allow={["ADMIN"]}>
          <div className="flex gap-2">
            <Link href="/agenda/recorrente">
              <Button variant="secondary">
                <Repeat size={16} />
                Agendamento recorrente
              </Button>
            </Link>
            <Link href="/agenda/nova">
              <Button>
                <Plus size={16} />
                Nova consulta
              </Button>
            </Link>
          </div>
        </RoleGate>
      </div>

      <AgendaView
        appointments={appointments}
        professionals={professionals}
        view={view}
        date={date}
        canManage={canManage}
      />
    </div>
  );
}
