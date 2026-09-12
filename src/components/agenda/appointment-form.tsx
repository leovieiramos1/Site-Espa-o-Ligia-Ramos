"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  appointmentSchema,
  APPOINTMENT_STATUS_OPTIONS,
  type AppointmentInput,
} from "@/lib/appointment-schema";
import { appointmentStatusLabels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Option = { id: string; name: string };

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function AppointmentForm({
  patients,
  professionals,
  appointment,
  appointmentId,
  returnTo,
}: {
  patients: Option[];
  professionals: Option[];
  appointment?: Partial<AppointmentInput>;
  appointmentId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!appointmentId;
  const backHref = returnTo ?? "/agenda";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      professionalId: appointment?.professionalId ?? "",
      specialty: appointment?.specialty ?? "",
      room: appointment?.room ?? "",
      startsAt: appointment?.startsAt ?? "",
      status: appointment?.status ?? "AGENDADA",
      notes: appointment?.notes ?? "",
    },
  });

  async function onSubmit(data: AppointmentInput) {
    setServerError(null);
    const url = isEditing ? `/api/agendamentos/${appointmentId}` : "/api/agendamentos";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível salvar.");
      return;
    }
    router.push(backHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Paciente</label>
            <select className={inputClass} {...register("patientId")}>
              <option value="">Selecione</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patientId && <p className={errorClass}>{errors.patientId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Profissional</label>
            <select className={inputClass} {...register("professionalId")}>
              <option value="">Não definido</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Especialidade</label>
            <input className={inputClass} placeholder="Ex: Fisioterapia" {...register("specialty")} />
            {errors.specialty && <p className={errorClass}>{errors.specialty.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Sala</label>
            <input className={inputClass} placeholder="Ex: Sala 01" {...register("room")} />
          </div>
          <div>
            <label className={labelClass}>Data e horário</label>
            <input type="datetime-local" className={inputClass} {...register("startsAt")} />
            {errors.startsAt && <p className={errorClass}>{errors.startsAt.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} {...register("status")}>
              {APPOINTMENT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {appointmentStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Observações</label>
            <input className={inputClass} placeholder="Observações sobre o atendimento" {...register("notes")} />
          </div>
        </div>
      </Card>

      {serverError && (
        <p className="rounded-xl bg-status-alert-bg px-3.5 py-2.5 text-sm text-status-alert">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Agendar consulta"}
        </Button>
      </div>
    </form>
  );
}
