import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { professionalSchema } from "@/lib/professional-schema";
import { logAudit } from "@/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const professional = await prisma.professional.findUnique({ where: { id } });
  if (!professional) return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });

  return NextResponse.json(professional);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para editar profissionais" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = professionalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const professional = await prisma.professional.update({ where: { id }, data: parsed.data });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Professional",
    entityId: professional.id,
    details: `Profissional ${professional.name} atualizado`,
  });

  return NextResponse.json(professional);
}
