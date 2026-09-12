"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  userSchema,
  userEditSchema,
  ROLES,
  type UserInput,
  type UserEditInput,
} from "@/lib/user-schema";
import { passwordRules } from "@/lib/validation";
import { roleLabels } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

type FormValues = UserInput | UserEditInput;

export function UserForm({
  user,
  userId,
}: {
  user?: { name: string; email: string; role: (typeof ROLES)[number] };
  userId?: string;
} = {}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!userId;

  const inputClass =
    "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";
  const errorClass = "mt-1 text-xs text-status-alert";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isEditing ? userEditSchema : userSchema),
    defaultValues: isEditing
      ? { name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "RECEPCAO", password: "" }
      : { role: "RECEPCAO" },
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const url = isEditing ? `/api/usuarios/${userId}` : "/api/usuarios";
    const method = isEditing ? "PATCH" : "POST";

    const payload = isEditing && !data.password ? { ...data, password: undefined } : data;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.formErrors?.[0] ?? body?.error ?? "Não foi possível salvar.");
      return;
    }
    router.push("/configuracoes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nome completo</label>
            <input className={inputClass} placeholder="Nome do usuário" {...register("name")} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Papel de acesso</label>
            <select className={inputClass} {...register("role")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} placeholder="usuario@gmail.com" {...register("email")} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            <p className="mt-1 text-xs text-muted">Apenas @gmail.com ou @hotmail.com</p>
          </div>
          <div>
            <label className={labelClass}>{isEditing ? "Nova senha (opcional)" : "Senha provisória"}</label>
            <input
              type="password"
              className={inputClass}
              placeholder={isEditing ? "Deixe em branco para manter a atual" : "••••••••"}
              {...register("password")}
            />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-cream-soft/70 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-ink">Requisitos de senha</p>
          <ul className="space-y-1">
            {passwordRules.map((rule) => (
              <li key={rule} className="flex items-center gap-1.5 text-xs text-muted">
                <Check size={12} className="text-sage" /> {rule}
              </li>
            ))}
          </ul>
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
          {isSubmitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar usuário"}
        </Button>
      </div>
    </form>
  );
}
