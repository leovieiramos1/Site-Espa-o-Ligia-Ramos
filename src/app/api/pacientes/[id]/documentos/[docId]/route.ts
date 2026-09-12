import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveStoredFilePath } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para remover documentos" }, { status: 403 });
  }

  const { docId } = await params;
  const document = await prisma.patientDocument.findUnique({ where: { id: docId } });
  if (!document) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });

  await prisma.patientDocument.delete({ where: { id: docId } });
  await unlink(resolveStoredFilePath(document.filePath)).catch(() => null);

  await logAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "PatientDocument",
    entityId: docId,
    details: `Documento "${document.fileName}" removido`,
  });

  return NextResponse.json({ ok: true });
}
