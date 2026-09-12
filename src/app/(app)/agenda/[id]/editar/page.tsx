import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/agenda/appointment-form";

export const dynamic = "force-dynamic";

function toDateTimeLocalValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default async function EditarConsultaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [appointment, patients, professionals] = await Promise.all([
    prisma.appointment.findUnique({ where: { id } }),
    prisma.patient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.professional.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <Link href="/agenda" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para agenda
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Editar consulta</h1>
        <p className="mt-1 text-sm text-muted">Reagende, mude o status ou atualize os dados da consulta.</p>
      </div>
      <AppointmentForm
        patients={patients}
        professionals={professionals}
        appointmentId={appointment.id}
        appointment={{
          patientId: appointment.patientId,
          professionalId: appointment.professionalId ?? "",
          specialty: appointment.specialty,
          room: appointment.room ?? "",
          startsAt: toDateTimeLocalValue(appointment.startsAt),
          status: appointment.status,
          notes: appointment.notes ?? "",
        }}
      />
    </div>
  );
}
