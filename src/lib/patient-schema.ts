import { z } from "zod";
import { cpfSchema, emailSchema, phoneSchema } from "@/lib/validation";

export const PATIENT_STATUS = ["ATIVO", "INATIVO", "NOVO"] as const;
export const PAYMENT_STATUS = ["PAGO", "PENDENTE", "ATRASADO", "PARCIAL"] as const;

export const patientSchema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  nickname: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  cpf: cpfSchema,
  phone: phoneSchema,
  email: emailSchema,
  address: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  status: z.enum(PATIENT_STATUS),
  treatment: z.string().optional().or(z.literal("")),
  professionalId: z.string().optional().or(z.literal("")),
  financialStatus: z.enum(PAYMENT_STATUS),
  treatmentValue: z.number().min(0).optional(),
  treatmentSessionsTotal: z.number().int().min(0).optional(),
  treatmentSessionsDone: z.number().int().min(0).optional(),
  treatmentStartDate: z.string().optional().or(z.literal("")),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const statusLabels: Record<(typeof PATIENT_STATUS)[number], string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  NOVO: "Novo",
};

export const paymentLabels: Record<(typeof PAYMENT_STATUS)[number], string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
  PARCIAL: "Parcial",
};
