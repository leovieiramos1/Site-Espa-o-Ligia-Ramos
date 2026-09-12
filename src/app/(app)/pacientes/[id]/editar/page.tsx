import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PatientForm } from "@/components/patients/patient-form";

export const dynamic = "force-dynamic";

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [patient, professionals] = await Promise.all([
    prisma.patient.findUnique({
      where: { id },
      include: { treatmentPlans: { orderBy: { startDate: "desc" }, take: 1 } },
    }),
    prisma.professional.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!patient) notFound();

  const currentPlan = patient.treatmentPlans[0];

  return (
    <div className="space-y-6">
      <Link
        href={`/pacientes/${id}`}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker"
      >
        <ChevronLeft size={16} />
        Voltar para o perfil
      </Link>

      <div>
        <h1 className="font-display text-3xl text-ink">Editar paciente</h1>
        <p className="mt-1 text-sm text-muted">Atualize os dados de {patient.name}.</p>
      </div>

      <PatientForm
        professionals={professionals}
        patientId={patient.id}
        patient={{
          name: patient.name,
          nickname: patient.nickname ?? "",
          birthDate: patient.birthDate ? patient.birthDate.toISOString().slice(0, 10) : "",
          cpf: patient.cpf,
          phone: patient.phone,
          email: patient.email,
          address: patient.address ?? "",
          emergencyContact: patient.emergencyContact ?? "",
          status: patient.status,
          treatment: patient.treatment ?? "",
          professionalId: patient.professionalId ?? "",
          financialStatus: patient.financialStatus,
          treatmentValue: currentPlan?.value,
          treatmentSessionsTotal: currentPlan?.sessionsTotal,
          treatmentSessionsDone: currentPlan?.sessionsDone,
          treatmentStartDate: currentPlan ? currentPlan.startDate.toISOString().slice(0, 10) : "",
        }}
      />
    </div>
  );
}
