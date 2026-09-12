"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { z } from "zod";
import { eventSchema } from "@/lib/event-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function EventForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof eventSchema>, unknown, z.output<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
  });

  async function onSubmit(data: z.output<typeof eventSchema>) {
    setServerError(null);
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível salvar.");
      return;
    }
    router.push("/eventos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome do evento</label>
            <input className={inputClass} placeholder="Ex: Workshop Movimento e Saúde" {...register("name")} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Data e horário</label>
            <input type="datetime-local" className={inputClass} {...register("date")} />
            {errors.date && <p className={errorClass}>{errors.date.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Capacidade</label>
            <input type="number" min={1} className={inputClass} {...register("capacity")} />
            {errors.capacity && <p className={errorClass}>{errors.capacity.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Local</label>
            <input className={inputClass} placeholder="Ex: Auditório da clínica" {...register("location")} />
          </div>
          <div>
            <label className={labelClass}>Responsável</label>
            <input className={inputClass} placeholder="Nome do responsável" {...register("responsible")} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição</label>
            <input className={inputClass} placeholder="Breve descrição do evento" {...register("description")} />
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
          {isSubmitting ? "Salvando…" : "Criar evento"}
        </Button>
      </div>
    </form>
  );
}
