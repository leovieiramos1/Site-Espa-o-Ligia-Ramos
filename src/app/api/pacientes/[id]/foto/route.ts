import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para editar pacientes" }, { status: 403 });
  }

  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo de imagem" }, { status: 422 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WEBP." }, { status: 422 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 10MB" }, { status: 422 });
  }

  const filePath = await saveUploadedFile(file, `patients/${id}/photo`);

  const updated = await prisma.patient.update({
    where: { id },
    data: { photoPath: filePath },
  });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Patient",
    entityId: id,
    details: `Foto do paciente ${patient.name} atualizada`,
  });

  return NextResponse.json({ photoPath: updated.photoPath });
}
