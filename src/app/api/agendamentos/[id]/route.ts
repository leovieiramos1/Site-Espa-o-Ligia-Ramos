import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema, APPOINTMENT_STATUS_OPTIONS } from "@/lib/appointment-schema";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true, professional: true },
  });
  if (!appointment) return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });

  return NextResponse.json(appointment);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para alterar a agenda" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Alteração rápida de status (usada nos menus de ação da lista/dia), sem
  // precisar reenviar o formulário inteiro.
  const statusOnlySchema = z.object({ status: z.enum(APPOINTMENT_STATUS_OPTIONS) });
  const isStatusOnly = Object.keys(body).length === 1 && "status" in body;

  if (isStatusOnly) {
    const parsed = statusOnlySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Appointment",
      entityId: id,
      details: `Status alterado para ${parsed.data.status}`,
    });
    return NextResponse.json(appointment);
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  const appointment = await prisma.appointment.update({
    where: { id },
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
    action: "UPDATE",
    entityType: "Appointment",
    entityId: id,
    details: `Consulta atualizada — novo horário ${appointment.startsAt.toISOString()}`,
  });

  return NextResponse.json(appointment);
}
