import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone, Mail, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { patientStatusLabels } from "@/lib/labels";
import { PatientTabs } from "@/components/patients/patient-tabs";
import { RoleGate } from "@/components/auth/role-gate";
import { AvatarUploader } from "@/components/patients/avatar-uploader";
import { auth } from "@/auth";

function age(birthDate: Date | null) {
  if (!birthDate) return null;
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export const dynamic = "force-dynamic";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [patient, session] = await Promise.all([
    prisma.patient.findUnique({
      where: { id },
      include: {
        professional: true,
        treatmentPlans: { orderBy: { startDate: "desc" } },
        evolutions: { orderBy: { date: "desc" }, include: { professional: true } },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    }),
    auth(),
  ]);

  if (!patient) notFound();

  const patientAge = age(patient.birthDate);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <Link href="/pacientes" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para pacientes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <AvatarUploader
            patientId={patient.id}
            name={patient.name}
            photoPath={patient.photoPath}
            editable={isAdmin}
          />
          <div>
            <h1 className="font-display text-2xl text-ink">
              {patient.name}
              {patient.nickname && (
                <span className="ml-2 text-lg font-normal text-muted">“{patient.nickname}”</span>
              )}
            </h1>
            <p className="text-sm text-muted">
              {patientAge ? `${patientAge} anos · ` : ""}
              {patient.treatment || "Tratamento não definido"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-ink/70">
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {patient.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {patient.email}
              </span>
            </div>
          </div>
        </div>

        <RoleGate allow={["ADMIN"]}>
          <Link
            href={`/pacientes/${patient.id}/editar`}
            className="flex items-center gap-2 rounded-full border border-sage px-4 py-2 text-sm font-medium text-sage-darker hover:bg-sage-light"
          >
            <Pencil size={14} />
            Editar dados
          </Link>
        </RoleGate>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Última consulta", patient.lastVisitAt ? patient.lastVisitAt.toLocaleDateString("pt-BR") : "—"],
          ["Próxima consulta", patient.nextVisitAt ? patient.nextVisitAt.toLocaleDateString("pt-BR") : "Não agendada"],
          ["Profissional", patient.professional?.name ?? "Não definido"],
          ["Status", patientStatusLabels[patient.status]],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-card px-4 py-3">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-ink">{value}</p>
          </div>
        ))}
      </div>

      <PatientTabs patient={patient} canManageDocuments={isAdmin} />
    </div>
  );
}
