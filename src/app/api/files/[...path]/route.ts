import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { guessMimeType, resolveStoredFilePath } from "@/lib/storage";
import { readFile } from "fs/promises";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { path: segments } = await params;
  const relativePath = segments.join("/");

  if (relativePath.includes("..")) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
  }

  try {
    const filePath = resolveStoredFilePath(relativePath);
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": guessMimeType(relativePath) },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}
