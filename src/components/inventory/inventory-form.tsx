"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { z } from "zod";
import { inventoryItemSchema } from "@/lib/inventory-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function InventoryForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof inventoryItemSchema>, unknown, z.output<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: { minQuantity: 0 },
  });

  async function onSubmit(data: z.output<typeof inventoryItemSchema>) {
    setServerError(null);
    const res = await fetch("/api/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível salvar.");
      return;
    }
    router.push("/estoque");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome do item</label>
            <input className={inputClass} placeholder="Ex: Faixa elástica" {...register("name")} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Categoria</label>
            <input className={inputClass} placeholder="Ex: Materiais" {...register("category")} />
            {errors.category && <p className={errorClass}>{errors.category.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Fornecedor</label>
            <input className={inputClass} placeholder="Nome do fornecedor" {...register("supplier")} />
          </div>
          <div>
            <label className={labelClass}>Quantidade em estoque</label>
            <input type="number" min={0} className={inputClass} {...register("quantity")} />
            {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Estoque mínimo</label>
            <input type="number" min={0} className={inputClass} {...register("minQuantity")} />
          </div>
          <div>
            <label className={labelClass}>Validade (se aplicável)</label>
            <input type="date" className={inputClass} {...register("expiresAt")} />
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
          {isSubmitting ? "Salvando…" : "Cadastrar item"}
        </Button>
      </div>
    </form>
  );
}
