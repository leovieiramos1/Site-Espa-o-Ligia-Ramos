import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { professionalSchema } from "@/lib/professional-schema";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const professionals = await prisma.professional.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(professionals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para cadastrar profissionais" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = professionalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const professional = await prisma.professional.create({ data: parsed.data });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Professional",
    entityId: professional.id,
    details: `Profissional ${professional.name} cadastrado`,
  });

  return NextResponse.json(professional, { status: 201 });
}
