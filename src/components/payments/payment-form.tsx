"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { z } from "zod";
import { paymentSchema, PAYMENT_METHODS, PAYMENT_STATUS_OPTIONS } from "@/lib/payment-schema";
import { paymentStatusLabels } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function PaymentForm({ patients }: { patients: { id: string; name: string }[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof paymentSchema>, unknown, z.output<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { status: "PENDENTE", method: "Pix" },
  });

  const amountValue = watch("amount");

  async function onSubmit(data: z.output<typeof paymentSchema>) {
    setServerError(null);
    const res = await fetch("/api/pagamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível salvar.");
      return;
    }
    router.push("/pagamentos");
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
            <label className={labelClass}>Valor</label>
            <CurrencyInput
              value={typeof amountValue === "number" ? amountValue : 0}
              onChange={(v) => setValue("amount", v, { shouldValidate: true })}
            />
            {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Forma de pagamento</label>
            <select className={inputClass} {...register("method")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} {...register("status")}>
              {PAYMENT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {paymentStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Vencimento</label>
            <input type="date" className={inputClass} {...register("dueDate")} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição</label>
            <input className={inputClass} placeholder="Ex: Sessão de fisioterapia — pacote mensal" {...register("description")} />
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
          {isSubmitting ? "Salvando…" : "Registrar pagamento"}
        </Button>
      </div>
    </form>
  );
}
