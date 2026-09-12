import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatusPill } from "@/components/ui/status-pill";
import { RoleGate } from "@/components/auth/role-gate";
import { Wallet, Hourglass, AlertTriangle, TrendingUp } from "lucide-react";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pendingAgg, overdueAgg, monthAgg, debts] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PENDENTE" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "ATRASADO" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAGO", paidAt: { gte: startOfMonth } },
    }),
    prisma.payment.findMany({
      where: { status: { in: ["PENDENTE", "ATRASADO", "PARCIAL"] } },
      include: { patient: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Financeiro</h1>
        <p className="mt-1 text-sm text-muted">Faturamento, dívidas e contas a receber da clínica.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-done-bg text-status-done">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="font-display text-xl text-ink">{currency(monthAgg._sum.amount ?? 0)}</p>
            <p className="text-xs text-muted">Faturamento do mês</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-light text-sage-darker">
            <Hourglass size={18} />
          </div>
          <div>
            <p className="font-display text-xl text-ink">{currency(pendingAgg._sum.amount ?? 0)}</p>
            <p className="text-xs text-muted">A receber (pendente)</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-alert-bg text-status-alert">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-display text-xl text-ink">{currency(overdueAgg._sum.amount ?? 0)}</p>
            <p className="text-xs text-muted">Atrasado</p>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Dívidas e pendências</CardTitle>
          <RoleGate allow={["ADMIN"]}>
            <Link href="/pagamentos" className="text-sm font-medium text-sage-darker hover:underline">
              Gerenciar pagamentos
            </Link>
          </RoleGate>
        </CardHeader>
        {debts.length === 0 ? (
          <p className="px-5 pb-6 text-center text-sm text-muted">
            <Wallet className="mx-auto mb-2 text-sage" size={22} />
            Nenhuma pendência financeira no momento.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {debts.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{d.patient.name}</p>
                  <p className="text-xs text-muted">
                    {d.description || "Sem descrição"}
                    {d.dueDate ? ` · vencimento ${d.dueDate.toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm text-ink">{currency(d.amount)}</span>
                  <PaymentStatusPill status={d.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
