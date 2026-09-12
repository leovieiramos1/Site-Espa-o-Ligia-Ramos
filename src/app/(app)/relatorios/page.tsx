import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Users, CalendarCheck2, Stethoscope, Wallet, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalPatients,
    activePatients,
    newPatients,
    appointmentsThisMonth,
    absencesThisMonth,
    activeTreatments,
    monthRevenueAgg,
    overdueAgg,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { status: "ATIVO" } }),
    prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.appointment.count({ where: { startsAt: { gte: startOfMonth } } }),
    prisma.appointment.count({ where: { startsAt: { gte: startOfMonth }, status: "FALTOU" } }),
    prisma.treatmentPlan.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAGO", paidAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "ATRASADO" } }),
  ]);

  const reportGroups = [
    {
      title: "Pacientes",
      icon: Users,
      items: [
        [`${totalPatients}`, "Total de pacientes"],
        [`${activePatients}`, "Pacientes ativos"],
        [`${newPatients}`, "Novos pacientes no mês"],
      ],
    },
    {
      title: "Agenda",
      icon: CalendarCheck2,
      items: [
        [`${appointmentsThisMonth}`, "Consultas no mês"],
        [`${absencesThisMonth}`, "Faltas no mês"],
      ],
    },
    {
      title: "Clínico",
      icon: Stethoscope,
      items: [[`${activeTreatments}`, "Planos de tratamento"]],
    },
    {
      title: "Financeiro",
      icon: Wallet,
      items: [
        [
          (monthRevenueAgg._sum.amount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          "Faturamento do mês",
        ],
        [
          (overdueAgg._sum.amount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          "Total em atraso",
        ],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Relatórios</h1>
        <p className="mt-1 text-sm text-muted">
          Indicadores de pacientes, agenda, clínico e financeiro, calculados em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reportGroups.map((group) => (
          <Card key={group.title}>
            <div className="mb-4 flex items-center gap-2">
              <group.icon size={18} className="text-sage-dark" />
              <h3 className="font-display text-base text-ink">{group.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {group.items.map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-xl text-ink">{value}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-center gap-3 border-dashed">
        <Download size={18} className="text-muted" />
        <p className="text-sm text-muted">
          Exportação em PDF e Excel está planejada para uma próxima etapa da plataforma.
        </p>
      </Card>
    </div>
  );
}
