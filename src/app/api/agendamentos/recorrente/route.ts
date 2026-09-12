import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recurringAppointmentSchema } from "@/lib/appointment-schema";
import { parseDateParam, startOfWeek, addDays } from "@/lib/date-utils";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para agendar consultas" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = recurringAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  const startDate = parseDateParam(data.startDate);
  const [hour, minute] = data.time.split(":").map(Number);
  const weekStart = startOfWeek(startDate);

  const dates: Date[] = [];
  for (let week = 0; week < data.weeksCount; week++) {
    for (const weekday of data.weekdays) {
      const day = addDays(weekStart, week * 7 + weekday);
      if (day >= startDate) {
        const withTime = new Date(day);
        withTime.setHours(hour || 0, minute || 0, 0, 0);
        dates.push(withTime);
      }
    }
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return NextResponse.json(
      { error: { formErrors: ["Nenhuma data resultou dessa combinação de dias e período"] } },
      { status: 422 }
    );
  }

  const created = await prisma.$transaction(
    dates.map((startsAt) =>
      prisma.appointment.create({
        data: {
          patientId: data.patientId,
          professionalId: data.professionalId || null,
          specialty: data.specialty,
          room: data.room || null,
          startsAt,
          status: "AGENDADA",
          notes: data.notes || null,
        },
      })
    )
  );

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Appointment",
    entityId: created[0]?.id ?? "series",
    details: `${created.length} consultas recorrentes criadas para o paciente ${data.patientId}`,
  });

  return NextResponse.json({ count: created.length }, { status: 201 });
}
