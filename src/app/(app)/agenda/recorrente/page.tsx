import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RecurringForm } from "@/components/agenda/recurring-form";

export const dynamic = "force-dynamic";

export default async function AgendamentoRecorrentePage() {
  const [patients, professionals] = await Promise.all([
    prisma.patient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.professional.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/agenda" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para agenda
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Agendamento recorrente</h1>
        <p className="mt-1 text-sm text-muted">
          Crie várias consultas de uma vez, em dias fixos da semana — ideal para
          fisioterapia (ex: 2x por semana durante 8 semanas).
        </p>
      </div>
      <RecurringForm patients={patients} professionals={professionals} />
    </div>
  );
}
