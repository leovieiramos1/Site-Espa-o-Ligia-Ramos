"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppointmentStatus } from "@prisma/client";
import { APPOINTMENT_STATUS_OPTIONS } from "@/lib/appointment-schema";
import { appointmentStatusLabels } from "@/lib/labels";

const toneClass: Record<AppointmentStatus, string> = {
  AGENDADA: "bg-status-off-bg text-status-off",
  CONFIRMADA: "bg-sage-light text-sage-darker",
  EM_ATENDIMENTO: "bg-gold-light text-gold",
  CONCLUIDA: "bg-status-done-bg text-status-done",
  CANCELADA: "bg-status-off-bg text-status-off",
  FALTOU: "bg-status-alert-bg text-status-alert",
};

export function StatusQuickSelect({
  appointmentId,
  status,
  editable,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [current, setCurrent] = useState(status);

  if (!editable) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[current]}`}>
        {appointmentStatusLabels[current]}
      </span>
    );
  }

  async function handleChange(next: AppointmentStatus) {
    setPending(true);
    setCurrent(next);
    const res = await fetch(`/api/agendamentos/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      value={current}
      disabled={pending}
      onClick={(e) => e.preventDefault()}
      onChange={(e) => handleChange(e.target.value as AppointmentStatus)}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sage ${toneClass[current]}`}
    >
      {APPOINTMENT_STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {appointmentStatusLabels[s]}
        </option>
      ))}
    </select>
  );
}
