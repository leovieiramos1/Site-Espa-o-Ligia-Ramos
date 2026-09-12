"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Appointment, Patient, Professional } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { StatusQuickSelect } from "@/components/agenda/status-quick-select";
import { cn } from "@/lib/utils";
import { addDays, startOfWeek, startOfMonth, toDateParam } from "@/lib/date-utils";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

type FullAppointment = Appointment & { patient: Patient; professional: Professional | null };
type ViewName = "Dia" | "Semana" | "Mês" | "Lista";

const views: ViewName[] = ["Dia", "Semana", "Mês", "Lista"];
const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function navDelta(view: ViewName, date: Date, dir: 1 | -1): Date {
  if (view === "Semana") return addDays(date, 7 * dir);
  if (view === "Mês") return new Date(date.getFullYear(), date.getMonth() + dir, 1);
  return addDays(date, dir);
}

function AppointmentRow({
  a,
  canManage,
  showDate,
}: {
  a: FullAppointment;
  canManage: boolean;
  showDate?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-cream-soft/60">
      <div className="flex items-center gap-4">
        <div className="w-20 shrink-0">
          {showDate && (
            <p className="text-xs text-muted">
              {a.startsAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </p>
          )}
          <span className="font-display text-base text-ink">
            {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div>
          <p className="text-sm font-medium text-ink">{a.patient.name}</p>
          <p className="text-xs text-muted">
            {a.specialty} · {a.professional?.name ?? "Sem profissional"} · {a.room ?? "Sem sala"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusQuickSelect appointmentId={a.id} status={a.status} editable={canManage} />
        {canManage && (
          <Link
            href={`/agenda/${a.id}/editar`}
            className="flex items-center gap-1 text-xs font-medium text-sage-darker hover:underline"
          >
            <Pencil size={13} /> Editar
          </Link>
        )}
      </div>
    </div>
  );
}

export function AgendaView({
  appointments,
  professionals,
  view,
  date,
  canManage,
}: {
  appointments: FullAppointment[];
  professionals: Professional[];
  view: ViewName;
  date: Date;
  canManage: boolean;
}) {
  const [professionalFilter, setProfessionalFilter] = useState("Todos");
  const [specialtyFilter, setSpecialtyFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [query, setQuery] = useState("");

  const specialties = useMemo(
    () => Array.from(new Set(appointments.map((a) => a.specialty))).sort(),
    [appointments]
  );

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesProfessional = professionalFilter === "Todos" || a.professional?.name === professionalFilter;
      const matchesSpecialty = specialtyFilter === "Todas" || a.specialty === specialtyFilter;
      const matchesStatus = statusFilter === "Todos" || a.status === statusFilter;
      const matchesQuery = query.trim() === "" || a.patient.name.toLowerCase().includes(query.toLowerCase());
      return matchesProfessional && matchesSpecialty && matchesStatus && matchesQuery;
    });
  }, [appointments, professionalFilter, specialtyFilter, statusFilter, query]);

  const dateParam = toDateParam(date);
  const prevHref = `/agenda?view=${encodeURIComponent(view)}&date=${toDateParam(navDelta(view, date, -1))}`;
  const nextHref = `/agenda?view=${encodeURIComponent(view)}&date=${toDateParam(navDelta(view, date, 1))}`;
  const todayHref = `/agenda?view=${encodeURIComponent(view)}&date=${toDateParam(new Date())}`;

  let heading = "";
  if (view === "Dia") {
    heading = date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  } else if (view === "Semana") {
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    heading = `${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;
  } else if (view === "Mês") {
    heading = `${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
  } else {
    heading = "Todas as consultas";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-line bg-card p-1">
          {views.map((v) => (
            <Link
              key={v}
              href={`/agenda?view=${encodeURIComponent(v)}&date=${dateParam}`}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                view === v ? "bg-sage-dark text-cream" : "text-ink/70 hover:bg-sage-light"
              )}
            >
              {v}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={professionalFilter}
            onChange={(e) => setProfessionalFilter(e.target.value)}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink focus:border-sage focus:outline-none"
          >
            <option>Todos</option>
            {professionals.map((p) => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink focus:border-sage focus:outline-none"
          >
            <option>Todas</option>
            {specialties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink focus:border-sage focus:outline-none"
          >
            <option value="Todos">Todos os status</option>
            <option value="AGENDADA">Agendada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="EM_ATENDIMENTO">Em atendimento</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="FALTOU">Faltou</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar paciente…"
            className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none"
          />
        </div>
      </div>

      {view !== "Lista" && (
        <div className="flex items-center justify-between">
          <p className="font-display text-lg capitalize text-ink">{heading}</p>
          <div className="flex items-center gap-1">
            <Link href={prevHref} className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card text-ink/70 hover:bg-sage-light">
              <ChevronLeft size={16} />
            </Link>
            <Link href={todayHref} className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-sage-light">
              Hoje
            </Link>
            <Link href={nextHref} className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card text-ink/70 hover:bg-sage-light">
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {view === "Dia" && <DayView appointments={filtered} canManage={canManage} />}
      {view === "Lista" && <ListView appointments={filtered} canManage={canManage} />}
      {view === "Semana" && <WeekView appointments={filtered} date={date} canManage={canManage} />}
      {view === "Mês" && <MonthView appointments={filtered} date={date} />}
    </div>
  );
}

function DayView({ appointments, canManage }: { appointments: FullAppointment[]; canManage: boolean }) {
  return (
    <Card className="p-0">
      {appointments.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">Nenhuma consulta agendada para este dia.</p>
      ) : (
        <div className="divide-y divide-line">
          {appointments.map((a) => (
            <AppointmentRow key={a.id} a={a} canManage={canManage} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ListView({ appointments, canManage }: { appointments: FullAppointment[]; canManage: boolean }) {
  return (
    <Card className="p-0">
      {appointments.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">Nenhuma consulta encontrada.</p>
      ) : (
        <div className="divide-y divide-line">
          {appointments.map((a) => (
            <AppointmentRow key={a.id} a={a} canManage={canManage} showDate />
          ))}
        </div>
      )}
    </Card>
  );
}

function WeekView({
  appointments,
  date,
  canManage,
}: {
  appointments: FullAppointment[];
  date: Date;
  canManage: boolean;
}) {
  const start = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const todayParam = toDateParam(new Date());

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayParam = toDateParam(day);
        const dayAppointments = appointments
          .filter((a) => toDateParam(a.startsAt) === dayParam)
          .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
        const isToday = dayParam === todayParam;

        return (
          <Card key={dayParam} className={cn("flex flex-col gap-2 p-3", isToday && "border-sage")}>
            <Link href={`/agenda?view=Dia&date=${dayParam}`} className="mb-1">
              <p className="text-xs text-muted">{WEEKDAY_SHORT[day.getDay()]}</p>
              <p className={cn("font-display text-lg", isToday ? "text-sage-darker" : "text-ink")}>
                {day.getDate()}
              </p>
            </Link>
            <div className="space-y-1.5">
              {dayAppointments.length === 0 ? (
                <p className="text-xs text-muted">—</p>
              ) : (
                dayAppointments.map((a) => (
                  <Link
                    key={a.id}
                    href={canManage ? `/agenda/${a.id}/editar` : `/agenda?view=Dia&date=${dayParam}`}
                    className="block rounded-lg bg-sage-light px-2 py-1.5 text-xs text-sage-darker hover:bg-sage/30"
                  >
                    <span className="font-medium">
                      {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>{" "}
                    {a.patient.name}
                  </Link>
                ))
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MonthView({ appointments, date }: { appointments: FullAppointment[]; date: Date }) {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const todayParam = toDateParam(new Date());

  return (
    <Card className="p-3">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
        {WEEKDAY_SHORT.map((w) => (
          <div key={w} className="py-1.5">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayParam = toDateParam(day);
          const inMonth = day.getMonth() === date.getMonth();
          const dayAppointments = appointments.filter((a) => toDateParam(a.startsAt) === dayParam);
          const isToday = dayParam === todayParam;

          return (
            <Link
              key={dayParam}
              href={`/agenda?view=Dia&date=${dayParam}`}
              className={cn(
                "min-h-[84px] rounded-xl border border-transparent p-1.5 text-left hover:border-sage hover:bg-sage-light/40",
                !inMonth && "opacity-40",
                isToday && "border-sage bg-sage-light/40"
              )}
            >
              <p className={cn("mb-1 text-xs font-medium", isToday ? "text-sage-darker" : "text-ink/80")}>
                {day.getDate()}
              </p>
              <div className="space-y-0.5">
                {dayAppointments.slice(0, 3).map((a) => (
                  <p key={a.id} className="truncate rounded bg-sage-light px-1 py-0.5 text-[10px] text-sage-darker">
                    {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} {a.patient.name}
                  </p>
                ))}
                {dayAppointments.length > 3 && (
                  <p className="text-[10px] text-muted">+{dayAppointments.length - 3} mais</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
