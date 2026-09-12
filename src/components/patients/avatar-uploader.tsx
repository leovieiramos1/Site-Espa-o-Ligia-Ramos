"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { getAvatarColorClass, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function AvatarUploader({
  patientId,
  name,
  photoPath,
  editable,
}: {
  patientId: string;
  name: string;
  photoPath: string | null;
  editable: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/pacientes/${patientId}/foto`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Não foi possível enviar a foto.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        disabled={!editable || uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-2xl",
          !photoPath && getAvatarColorClass(name),
          editable && "cursor-pointer"
        )}
      >
        {photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/files/${photoPath}`} alt={name} className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
        {editable && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream opacity-0 transition-opacity group-hover:bg-ink/40 group-hover:opacity-100">
            <Camera size={18} />
          </span>
        )}
      </button>
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      )}
      {uploading && <span className="text-[11px] text-muted">Enviando…</span>}
      {error && <span className="text-[11px] text-status-alert">{error}</span>}
    </div>
  );
}
