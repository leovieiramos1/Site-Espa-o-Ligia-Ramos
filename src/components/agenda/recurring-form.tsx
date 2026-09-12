"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  recurringAppointmentSchema,
  WEEKDAY_LABELS,
  type RecurringAppointmentInput,
} from "@/lib/appointment-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function RecurringForm({
  patients,
  professionals,
}: {
  patients: Option[];
  professionals: Option[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecurringAppointmentInput>({
    resolver: zodResolver(recurringAppointmentSchema),
    defaultValues: { weekdays: [], weeksCount: 8 },
  });

  const weekdays = watch("weekdays") ?? [];

  function toggleWeekday(day: number) {
    const next = weekdays.includes(day)
      ? weekdays.filter((d) => d !== day)
      : [...weekdays, day].sort();
    setValue("weekdays", next, { shouldValidate: true });
  }

  async function onSubmit(data: RecurringAppointmentInput) {
    setServerError(null);
    setSuccessCount(null);
    const res = await fetch("/api/agendamentos/recorrente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível salvar.");
      return;
    }
    const body = await res.json();
    setSuccessCount(body.count);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
            <label className={labelClass}>Horário</label>
            <input type="time" className={inputClass} {...register("time")} />
            {errors.time && <p className={errorClass}>{errors.time.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Data da primeira sessão</label>
            <input type="date" className={inputClass} {...register("startDate")} />
            {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Repetir por quantas semanas</label>
            <input
              type="number"
              min={1}
              max={52}
              className={inputClass}
              {...register("weeksCount", { valueAsNumber: true })}
            />
            {errors.weeksCount && <p className={errorClass}>{errors.weeksCount.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Dias da semana</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    weekdays.includes(day)
                      ? "border-sage-dark bg-sage-dark text-cream"
                      : "border-line text-ink/70 hover:bg-sage-light"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.weekdays && <p className={errorClass}>{errors.weekdays.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Observações</label>
            <input className={inputClass} placeholder="Ex: pacote de 16 sessões" {...register("notes")} />
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Exemplo: selecionando Seg e Qui, com 8 semanas, cria 16 consultas — duas por
          semana, durante 8 semanas.
        </p>
      </Card>

      {serverError && (
        <p className="rounded-xl bg-status-alert-bg px-3.5 py-2.5 text-sm text-status-alert">
          {serverError}
        </p>
      )}
      {successCount !== null && (
        <p className="rounded-xl bg-status-done-bg px-3.5 py-2.5 text-sm text-status-done">
          {successCount} consultas criadas com sucesso.
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/agenda")}>
          Voltar para agenda
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando…" : "Criar consultas recorrentes"}
        </Button>
      </div>
    </form>
  );
}
