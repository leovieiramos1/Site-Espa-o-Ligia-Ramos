import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusPill } from "@/components/ui/status-pill";
import { CreditCard, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PagamentosPage() {
  const payments = await prisma.payment.findMany({
    include: { patient: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Pagamentos</h1>
          <p className="mt-1 text-sm text-muted">
            {payments.length === 0 ? "Nenhum pagamento registrado ainda" : `${payments.length} pagamentos registrados`}
          </p>
        </div>
        <Link href="/pagamentos/novo">
          <Button>
            <Plus size={16} />
            Novo pagamento
          </Button>
        </Link>
      </div>

      {payments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-sage-darker">
            <CreditCard size={24} strokeWidth={1.75} />
          </div>
          <p className="font-display text-lg text-ink">Nenhum pagamento ainda</p>
          <p className="max-w-sm text-sm text-muted">
            Registre pagamentos e acompanhe pacotes, parcelamentos e recibos por paciente.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {payments.map((pay) => (
              <div key={pay.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{pay.patient.name}</p>
                  <p className="text-xs text-muted">
                    {pay.method} · {pay.description || "Sem descrição"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-display text-sm text-ink">
                    R$ {pay.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <PaymentStatusPill status={pay.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
