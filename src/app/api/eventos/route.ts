import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/event-schema";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const events = await prisma.event.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para criar eventos" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  const event = await prisma.event.create({
    data: {
      name: data.name,
      description: data.description || null,
      date: new Date(data.date),
      location: data.location || null,
      capacity: data.capacity,
      responsible: data.responsible || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Event",
    entityId: event.id,
    details: `Evento "${event.name}" criado`,
  });

  return NextResponse.json(event, { status: 201 });
}
