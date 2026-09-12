import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/patient-schema";
import { logAudit } from "@/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { professional: true, treatmentPlans: true, evolutions: true },
  });
  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });

  return NextResponse.json(patient);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para editar pacientes" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  const cpfOwner = await prisma.patient.findUnique({ where: { cpf: data.cpf } });
  if (cpfOwner && cpfOwner.id !== id) {
    return NextResponse.json(
      { error: { formErrors: ["Já existe outro paciente cadastrado com este CPF"] } },
      { status: 409 }
    );
  }

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      name: data.name,
      nickname: data.nickname || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      cpf: data.cpf,
      phone: data.phone,
      email: data.email,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      status: data.status,
      treatment: data.treatment || null,
      professionalId: data.professionalId || null,
      financialStatus: data.financialStatus,
    },
  });

  if (data.treatmentValue || data.treatmentSessionsTotal) {
    const currentPlan = await prisma.treatmentPlan.findFirst({
      where: { patientId: id },
      orderBy: { startDate: "desc" },
    });

    const planData = {
      professionalId: data.professionalId || null,
      name: data.treatment || "Tratamento",
      sessionsTotal: data.treatmentSessionsTotal || 1,
      sessionsDone: data.treatmentSessionsDone || 0,
      startDate: data.treatmentStartDate ? new Date(data.treatmentStartDate) : new Date(),
      value: data.treatmentValue || 0,
    };

    if (currentPlan) {
      await prisma.treatmentPlan.update({ where: { id: currentPlan.id }, data: planData });
    } else {
      await prisma.treatmentPlan.create({ data: { ...planData, patientId: id } });
    }
  }

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Patient",
    entityId: patient.id,
    details: `Paciente ${patient.name} atualizado`,
  });

  return NextResponse.json(patient);
}
