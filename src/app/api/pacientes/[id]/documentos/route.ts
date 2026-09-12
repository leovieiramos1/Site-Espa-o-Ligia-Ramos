import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const documents = await prisma.patientDocument.findMany({
    where: { patientId: id },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para anexar documentos" }, { status: 403 });
  }

  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo" }, { status: 422 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que 10MB" }, { status: 422 });
  }

  const filePath = await saveUploadedFile(file, `patients/${id}/documents`);

  const document = await prisma.patientDocument.create({
    data: {
      patientId: id,
      fileName: file.name,
      filePath,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "PatientDocument",
    entityId: document.id,
    details: `Documento "${file.name}" anexado ao paciente ${patient.name}`,
  });

  return NextResponse.json(document, { status: 201 });
}
