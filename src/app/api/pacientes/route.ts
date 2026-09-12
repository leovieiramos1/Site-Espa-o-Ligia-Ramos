import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/patient-schema";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const patients = await prisma.patient.findMany({
    include: { professional: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(patients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para cadastrar pacientes" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  const existing = await prisma.patient.findUnique({ where: { cpf: data.cpf } });
  if (existing) {
    return NextResponse.json(
      { error: { formErrors: ["Já existe um paciente cadastrado com este CPF"] } },
      { status: 409 }
    );
  }

  const patient = await prisma.patient.create({
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
    await prisma.treatmentPlan.create({
      data: {
        patientId: patient.id,
        professionalId: data.professionalId || null,
        name: data.treatment || "Tratamento",
        sessionsTotal: data.treatmentSessionsTotal || 1,
        sessionsDone: data.treatmentSessionsDone || 0,
        startDate: data.treatmentStartDate ? new Date(data.treatmentStartDate) : new Date(),
        value: data.treatmentValue || 0,
      },
    });
  }

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Patient",
    entityId: patient.id,
    details: `Paciente ${patient.name} cadastrado`,
  });

  return NextResponse.json(patient, { status: 201 });
}
