import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProfessionalForm } from "@/components/professionals/professional-form";

export const dynamic = "force-dynamic";

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const professional = await prisma.professional.findUnique({ where: { id } });

  if (!professional) notFound();

  return (
    <div className="space-y-6">
      <Link href="/equipe" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para equipe
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Editar profissional</h1>
        <p className="mt-1 text-sm text-muted">Atualize os dados de {professional.name}.</p>
      </div>
      <ProfessionalForm
        professionalId={professional.id}
        professional={{
          name: professional.name,
          specialty: professional.specialty,
          email: professional.email,
          phone: professional.phone,
          active: professional.active,
        }}
      />
    </div>
  );
}
