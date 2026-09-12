"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteUserButton({
  userId,
  userName,
  isSelf,
}: {
  userId: string;
  userName: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return null;

  async function handleDelete() {
    const confirmed = window.confirm(
      `Remover o usuário "${userName}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);
    const res = await fetch(`/api/usuarios/${userId}`, { method: "DELETE" });
    setPending(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível remover.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        onClick={handleDelete}
        disabled={pending}
        className="flex items-center gap-1.5 text-xs font-medium text-status-alert hover:underline disabled:opacity-50"
      >
        <Trash2 size={13} /> {pending ? "Removendo…" : "Remover"}
      </button>
      {error && <span className="text-[11px] text-status-alert">{error}</span>}
    </span>
  );
}
