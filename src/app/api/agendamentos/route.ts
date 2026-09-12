import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/appointment-schema";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    include: { patient: true, professional: true },
    orderBy: { startsAt: "desc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para agendar consultas" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      professionalId: data.professionalId || null,
      specialty: data.specialty,
      room: data.room || null,
      startsAt: new Date(data.startsAt),
      status: data.status,
      notes: data.notes || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Appointment",
    entityId: appointment.id,
    details: `Consulta agendada para ${appointment.startsAt.toISOString()}`,
  });

  return NextResponse.json(appointment, { status: 201 });
}
