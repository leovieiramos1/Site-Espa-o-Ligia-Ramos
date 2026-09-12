import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentStatusPill } from "@/components/ui/status-pill";
import { prisma } from "@/lib/prisma";
import {
  CalendarCheck2,
  Clock,
  CircleCheck,
  CircleX,
  UserX,
  Wallet,
  Hourglass,
  AlertTriangle,
  TrendingUp,
  DoorOpen,
  DoorClosed,
  Users2,
  Sparkles,
  ArrowUpRight,
  ClipboardCheck,
} from "lucide-react";

const TOTAL_ROOMS = 4;

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof CalendarCheck2;
  label: string;
  value: string | number;
  tone?: "default" | "alert" | "good";
}) {
  const toneStyles = {
    default: "bg-sage-light text-sage-darker",
    alert: "bg-status-alert-bg text-status-alert",
    good: "bg-status-done-bg text-status-done",
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneStyles}`}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-display text-xl leading-none text-ink">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayAppointments,
    activeProfessionals,
    patientsTotal,
    patientsInTreatment,
    newPatientsThisMonth,
    pendingPayments,
    overduePayments,
    monthRevenueAgg,
    dayRevenueAgg,
    finishedPlans,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: startOfToday, lt: endOfToday } },
      include: { patient: true, professional: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.professional.count({ where: { active: true } }),
    prisma.patient.count(),
    prisma.patient.count({ where: { status: "ATIVO" } }),
    prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PENDENTE" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "ATRASADO" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAGO", paidAt: { gte: startOfMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAGO", paidAt: { gte: startOfToday, lt: endOfToday } },
    }),
    prisma.treatmentPlan.count({ where: { sessionsDone: { gte: 1 } } }),
  ]);

  const scheduled = todayAppointments.length;
  const completed = todayAppointments.filter((a) => a.status === "CONCLUIDA").length;
  const absences = todayAppointments.filter((a) => a.status === "FALTOU").length;
  const cancellations = todayAppointments.filter((a) => a.status === "CANCELADA").length;
  const waiting = todayAppointments.filter((a) =>
    ["AGENDADA", "CONFIRMADA"].includes(a.status)
  ).length;

  const roomsOccupied = new Set(
    todayAppointments
      .filter((a) => ["CONFIRMADA", "EM_ATENDIMENTO"].includes(a.status))
      .map((a) => a.room)
      .filter(Boolean)
  ).size;

  const nextAppointment = todayAppointments.find((a) =>
    ["AGENDADA", "CONFIRMADA"].includes(a.status)
  );

  const insights: string[] = [];
  if (patientsTotal === 0) {
    insights.push(
      "Nenhum paciente cadastrado ainda — comece cadastrando o primeiro em Pacientes."
    );
  } else {
    insights.push(`${patientsTotal} paciente${patientsTotal > 1 ? "s" : ""} cadastrado${patientsTotal > 1 ? "s" : ""} na plataforma.`);
    if (patientsInTreatment > 0) insights.push(`${patientsInTreatment} pacientes em tratamento ativo.`);
    if (scheduled > 0) insights.push(`${scheduled} consulta${scheduled > 1 ? "s" : ""} agendada${scheduled > 1 ? "s" : ""} para hoje.`);
    const pendingCount = (pendingPayments._sum.amount ?? 0) > 0 || (overduePayments._sum.amount ?? 0) > 0;
    if (pendingCount) insights.push("Existem pagamentos pendentes ou atrasados no financeiro.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Bom dia, Lígia 🌿</h1>
        <p className="mt-1 text-sm text-muted">
          Aqui está um resumo do Espaço Lígia Ramos.
        </p>
      </div>

      <Card className="flex items-start gap-3 border-gold-light bg-gold-light/40">
        <Sparkles size={20} className="mt-0.5 shrink-0 text-gold" />
        <div>
          <p className="font-display text-base text-ink">Insights da clínica</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
            {insights.map((insight) => (
              <li key={insight} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardTitle className="mb-4 text-base">Hoje</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <StatTile icon={CalendarCheck2} label="Consultas agendadas" value={scheduled} />
            <StatTile icon={Clock} label="Aguardando" value={waiting} />
            <StatTile icon={CircleCheck} label="Concluídos" value={completed} tone="good" />
            <StatTile icon={UserX} label="Faltas" value={absences} tone="alert" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4 text-base">Financeiro</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <StatTile icon={Wallet} label="Faturamento do dia" value={currency(dayRevenueAgg._sum.amount ?? 0)} tone="good" />
            <StatTile icon={Hourglass} label="A receber" value={currency(pendingPayments._sum.amount ?? 0)} />
            <StatTile icon={AlertTriangle} label="Atrasado" value={currency(overduePayments._sum.amount ?? 0)} tone="alert" />
            <StatTile icon={TrendingUp} label="Faturamento do mês" value={currency(monthRevenueAgg._sum.amount ?? 0)} tone="good" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4 text-base">Operação</CardTitle>
          <div className="space-y-3">
            <p className="text-sm text-ink/80">
              <span className="text-muted">Próximo atendimento: </span>
              {nextAppointment
                ? `${nextAppointment.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — ${nextAppointment.patient.name}`
                : "Nenhum atendimento pendente hoje"}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <StatTile icon={Users2} label="Profissionais ativos" value={activeProfessionals} />
              <StatTile icon={DoorClosed} label="Salas ocupadas" value={roomsOccupied} />
              <StatTile icon={DoorOpen} label="Salas livres" value={Math.max(TOTAL_ROOMS - roomsOccupied, 0)} tone="good" />
              <StatTile icon={CircleX} label="Cancelamentos" value={cancellations} tone="alert" />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4 text-base">Indicadores</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <StatTile icon={ArrowUpRight} label="Novos pacientes (mês)" value={newPatientsThisMonth} tone="good" />
            <StatTile icon={Users2} label="Pacientes cadastrados" value={patientsTotal} />
            <StatTile icon={ClipboardCheck} label="Em tratamento" value={patientsInTreatment} />
            <StatTile icon={CircleCheck} label="Planos com evolução" value={finishedPlans} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de hoje</CardTitle>
          <a href="/agenda" className="text-sm font-medium text-sage-darker hover:underline">
            Ver agenda completa
          </a>
        </CardHeader>
        {todayAppointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Nenhuma consulta agendada para hoje.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {todayAppointments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="w-14 shrink-0 font-display text-sm text-ink">
                    {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{a.patient.name}</p>
                    <p className="text-xs text-muted">
                      {a.specialty} · {a.professional?.name ?? "Sem profissional"} · {a.room ?? "Sem sala"}
                    </p>
                  </div>
                </div>
                <AppointmentStatusPill status={a.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
