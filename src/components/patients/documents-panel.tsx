"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PatientDocument } from "@prisma/client";
import { Paperclip, Download, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPanel({
  patientId,
  documents,
  canManage,
}: {
  patientId: string;
  documents: PatientDocument[];
  canManage: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/pacientes/${patientId}/documentos`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Não foi possível enviar o documento.");
      return;
    }
    router.refresh();
  }

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/pacientes/${patientId}/documentos/${docId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base text-ink">Documentos</h3>
        {canManage && (
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-sage px-3 py-1.5 text-xs font-medium text-sage-darker hover:bg-sage-light">
            <Upload size={13} />
            {uploading ? "Enviando…" : "Anexar documento"}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && <p className="mb-3 text-xs text-status-alert">{error}</p>}

      {documents.length === 0 ? (
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Paperclip size={14} /> Nenhum documento anexado ainda.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Paperclip size={15} className="shrink-0 text-sage-dark" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{doc.fileName}</p>
                  <p className="text-xs text-muted">
                    {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={`/api/files/${doc.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-sage-darker hover:underline"
                >
                  <Download size={13} /> Baixar
                </a>
                {canManage && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex items-center gap-1 text-xs font-medium text-status-alert hover:underline"
                  >
                    <Trash2 size={13} /> Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
