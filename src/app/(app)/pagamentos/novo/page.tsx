import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PaymentForm } from "@/components/payments/payment-form";

export const dynamic = "force-dynamic";

export default async function NovoPagamentoPage() {
  const patients = await prisma.patient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <Link href="/pagamentos" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para pagamentos
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Novo pagamento</h1>
        <p className="mt-1 text-sm text-muted">Registre um pagamento de paciente.</p>
      </div>
      <PaymentForm patients={patients} />
    </div>
  );
}
