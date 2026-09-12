"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PaymentStatusPill } from "@/components/ui/status-pill";
import type { Patient, Professional, TreatmentPlan, Evolution, PatientDocument } from "@prisma/client";
import { Paperclip, Sparkles } from "lucide-react";
import { DocumentsPanel } from "@/components/patients/documents-panel";

type FullPatient = Patient & {
  professional: Professional | null;
  treatmentPlans: TreatmentPlan[];
  evolutions: (Evolution & { professional: Professional | null })[];
  documents: PatientDocument[];
};

const tabs = [
  "Informações pessoais",
  "Prontuário",
  "Plano integrado",
  "Financeiro",
  "Documentos",
] as const;

export function PatientTabs({
  patient,
  canManageDocuments,
}: {
  patient: FullPatient;
  canManageDocuments: boolean;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Informações pessoais");
  const plan = patient.treatmentPlans[0];
  const notes = patient.evolutions;

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-full border border-line bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "bg-sage-dark text-cream" : "text-ink/70 hover:bg-sage-light"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Informações pessoais" && (
          <Card>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Nome completo", patient.name],
                ["CPF", patient.cpf],
                ["Telefone", patient.phone],
                ["E-mail", patient.email],
                ["Endereço", patient.address || "Não informado"],
                ["Contato de emergência", patient.emergencyContact || "Não informado"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        {tab === "Prontuário" && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-display text-base text-ink">Anamnese e plano terapêutico</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Hipótese funcional / tratamento</dt>
                  <dd className="mt-0.5 text-sm text-ink">
                    {patient.treatment || "Ainda não definido"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Profissional responsável</dt>
                  <dd className="mt-0.5 text-sm text-ink">
                    {patient.professional?.name ?? "Não definido"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted">Anexos</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    <Paperclip size={14} />
                    {patient.documents.length === 0
                      ? "Nenhum documento anexado ainda"
                      : `${patient.documents.length} documento${patient.documents.length > 1 ? "s" : ""} — veja na aba Documentos`}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h3 className="mb-4 font-display text-base text-ink">Evolução por sessão</h3>
              <div className="space-y-4">
                {notes.length === 0 && (
                  <p className="text-sm text-muted">Nenhuma evolução registrada ainda.</p>
                )}
                {notes.map((n) => (
                  <div key={n.id} className="border-l-2 border-sage-light pl-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-medium text-ink">
                        {new Date(n.date).toLocaleDateString("pt-BR")}
                      </span>
                      {n.professional && <span>· {n.professional.name}</span>}
                      {n.pain != null && (
                        <span className="rounded-full bg-status-alert-bg px-2 py-0.5 text-status-alert">
                          Dor {n.pain}/10
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink/85">{n.note}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "Plano integrado" && (
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-gold" />
              <h3 className="font-display text-base text-ink">
                Cuidado completo para {patient.name.split(" ")[0]}
              </h3>
            </div>
            <p className="text-sm text-ink/80">
              Objetivo: redução da dor e recuperação da mobilidade, com acompanhamento integrado
              entre as especialidades envolvidas.
            </p>
            <div className="mt-4 space-y-3">
              {patient.professional ? (
                <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                  <span className="text-sm font-medium text-ink">
                    {patient.professional.specialty}
                  </span>
                  <span className="text-sm text-muted">{patient.professional.name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Nenhum profissional associado a este paciente ainda.
                </p>
              )}
            </div>
          </Card>
        )}

        {tab === "Financeiro" && (
          <div className="space-y-4">
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Situação financeira</p>
                <p className="mt-1 font-display text-lg text-ink">
                  {plan ? `R$ ${plan.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                </p>
              </div>
              <PaymentStatusPill status={patient.financialStatus} />
            </Card>
            {plan ? (
              <Card>
                <h3 className="font-display text-base text-ink">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  Início em {new Date(plan.startDate).toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-4">
                  <ProgressBar value={plan.sessionsDone} max={plan.sessionsTotal} />
                </div>
              </Card>
            ) : (
              <p className="text-sm text-muted">Nenhum plano de tratamento cadastrado ainda.</p>
            )}
          </div>
        )}

        {tab === "Documentos" && (
          <DocumentsPanel
            patientId={patient.id}
            documents={patient.documents}
            canManage={canManageDocuments}
          />
        )}
      </div>
    </div>
  );
}
