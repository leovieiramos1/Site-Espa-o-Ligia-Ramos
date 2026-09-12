"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { professionalSchema, type ProfessionalInput } from "@/lib/professional-schema";
import { formatPhoneMask } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function ProfessionalForm({
  professional,
  professionalId,
}: {
  professional?: ProfessionalInput;
  professionalId?: string;
} = {}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!professionalId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalInput>({
    resolver: zodResolver(professionalSchema),
    defaultValues: professional ?? {
      name: "",
      specialty: "",
      email: "",
      phone: "",
      active: true,
    },
  });

  const phoneValue = watch("phone") ?? "";
  const activeValue = watch("active");

  async function onSubmit(data: ProfessionalInput) {
    setServerError(null);
    const url = isEditing ? `/api/profissionais/${professionalId}` : "/api/profissionais";
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
    router.push("/equipe");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nome completo</label>
            <input className={inputClass} placeholder="Nome do profissional" {...register("name")} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Especialidade</label>
            <input className={inputClass} placeholder="Ex: Fisioterapia" {...register("specialty")} />
            {errors.specialty && <p className={errorClass}>{errors.specialty.message}</p>}
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} placeholder="profissional@gmail.com" {...register("email")} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            <p className="mt-1 text-xs text-muted">Apenas @gmail.com ou @hotmail.com</p>
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              className={inputClass}
              placeholder="(81) 9.1234-5678"
              value={phoneValue}
              onChange={(e) => setValue("phone", formatPhoneMask(e.target.value), { shouldValidate: true })}
            />
            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
          </div>
          {isEditing && (
            <label className="flex items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={activeValue}
                onChange={(e) => setValue("active", e.target.checked)}
                className="h-4 w-4 rounded border-line accent-sage-dark"
              />
              Profissional ativo
            </label>
          )}
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
          {isSubmitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar profissional"}
        </Button>
      </div>
    </form>
  );
}
