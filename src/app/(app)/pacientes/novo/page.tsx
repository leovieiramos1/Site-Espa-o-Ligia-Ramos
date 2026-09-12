import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PatientForm } from "@/components/patients/patient-form";

export const dynamic = "force-dynamic";

export default async function NovoPacientePage() {
  const professionals = await prisma.professional.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Link href="/pacientes" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para pacientes
      </Link>

      <div>
        <h1 className="font-display text-3xl text-ink">Novo paciente</h1>
        <p className="mt-1 text-sm text-muted">Cadastre os dados do paciente para iniciar o acompanhamento.</p>
      </div>

      <PatientForm professionals={professionals} />
    </div>
  );
}
