"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  patientSchema,
  paymentLabels,
  statusLabels,
  type PatientInput,
} from "@/lib/patient-schema";
import { formatPhoneMask } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";

type Professional = { id: string; name: string; specialty: string };

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-status-alert";

export function PatientForm({
  professionals,
  patient,
  patientId,
}: {
  professionals: Professional[];
  patient?: Partial<PatientInput>;
  patientId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!patientId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: patient?.name ?? "",
      nickname: patient?.nickname ?? "",
      birthDate: patient?.birthDate ?? "",
      cpf: patient?.cpf ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      address: patient?.address ?? "",
      emergencyContact: patient?.emergencyContact ?? "",
      status: patient?.status ?? "NOVO",
      treatment: patient?.treatment ?? "",
      professionalId: patient?.professionalId ?? "",
      financialStatus: patient?.financialStatus ?? "PENDENTE",
      treatmentValue: patient?.treatmentValue ?? undefined,
      treatmentSessionsTotal: patient?.treatmentSessionsTotal ?? undefined,
      treatmentSessionsDone: patient?.treatmentSessionsDone ?? undefined,
      treatmentStartDate: patient?.treatmentStartDate ?? "",
    },
  });

  const phoneValue = watch("phone");
  const treatmentValue = watch("treatmentValue");

  async function onSubmit(data: PatientInput) {
    setServerError(null);
    const url = isEditing ? `/api/pacientes/${patientId}` : "/api/pacientes";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        body?.error?.formErrors?.[0] ??
        body?.error ??
        "Não foi possível salvar o paciente.";
      setServerError(typeof message === "string" ? message : "Não foi possível salvar o paciente.");
      return;
    }

    const saved = await res.json();
    router.push(`/pacientes/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <h3 className="mb-4 font-display text-base text-ink">Dados pessoais</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nome completo</label>
            <input className={inputClass} placeholder="Nome do paciente" {...register("name")} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nome social / apelido</label>
            <input className={inputClass} placeholder="Como prefere ser chamado(a)" {...register("nickname")} />
          </div>
          <div>
            <label className={labelClass}>Data de nascimento</label>
            <input type="date" className={inputClass} {...register("birthDate")} />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input className={inputClass} placeholder="000.000.000-00" {...register("cpf")} />
            {errors.cpf && <p className={errorClass}>{errors.cpf.message}</p>}
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
            <p className="mt-1 text-xs text-muted">Formato exigido: (DD) 9.XXXX-XXXX</p>
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} placeholder="paciente@gmail.com ou @hotmail.com" {...register("email")} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            <p className="mt-1 text-xs text-muted">Apenas @gmail.com ou @hotmail.com</p>
          </div>
          <div>
            <label className={labelClass}>Contato de emergência</label>
            <input className={inputClass} placeholder="Nome — telefone" {...register("emergencyContact")} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Endereço</label>
            <input className={inputClass} placeholder="Rua, número — bairro, cidade/UF" {...register("address")} />
          </div>
        </div>
        {isEditing && (
          <p className="mt-4 text-xs text-muted">
            A foto do paciente e os documentos anexados são gerenciados diretamente no perfil,
            após salvar aqui.
          </p>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base text-ink">Perfil clínico</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Profissional responsável</label>
            <select className={inputClass} {...register("professionalId")}>
              <option value="">Não definido</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.specialty}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status do paciente</label>
            <select className={inputClass} {...register("status")}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Situação financeira</label>
            <select className={inputClass} {...register("financialStatus")}>
              {Object.entries(paymentLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-display text-ink">Plano de tratamento</h3>
        <p className="mt-1 mb-4 text-xs text-muted">
          Cadastre o tratamento já vinculado ao paciente. Pode ser editado depois neste
          mesmo formulário.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Descrição do tratamento</label>
            <input className={inputClass} placeholder="Ex: Fisioterapia — Reabilitação de joelho" {...register("treatment")} />
          </div>
          <div>
            <label className={labelClass}>Valor acordado</label>
            <CurrencyInput
              value={treatmentValue ?? 0}
              onChange={(v) => setValue("treatmentValue", v, { shouldValidate: true })}
            />
          </div>
          <div>
            <label className={labelClass}>Data de início</label>
            <input type="date" className={inputClass} {...register("treatmentStartDate")} />
          </div>
          <div>
            <label className={labelClass}>Total de sessões</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              {...register("treatmentSessionsTotal", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className={labelClass}>Sessões já realizadas</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              {...register("treatmentSessionsDone", { valueAsNumber: true })}
            />
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
          {isSubmitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar paciente"}
        </Button>
      </div>
    </form>
  );
}
