import { z } from "zod";

export const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão", "Transferência", "Outros"] as const;
export const PAYMENT_STATUS_OPTIONS = ["PAGO", "PENDENTE", "ATRASADO", "PARCIAL"] as const;

export const paymentSchema = z.object({
  patientId: z.string().min(1, "Selecione o paciente"),
  amount: z.coerce.number().positive("Informe um valor válido"),
  method: z.enum(PAYMENT_METHODS),
  status: z.enum(PAYMENT_STATUS_OPTIONS),
  dueDate: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
