import { z } from "zod";

export const APPOINTMENT_STATUS_OPTIONS = [
  "AGENDADA",
  "CONFIRMADA",
  "EM_ATENDIMENTO",
  "CONCLUIDA",
  "CANCELADA",
  "FALTOU",
] as const;

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione o paciente"),
  professionalId: z.string().optional().or(z.literal("")),
  specialty: z.string().min(2, "Informe a especialidade"),
  room: z.string().optional().or(z.literal("")),
  startsAt: z.string().min(1, "Informe a data e horário"),
  status: z.enum(APPOINTMENT_STATUS_OPTIONS),
  notes: z.string().optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const recurringAppointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione o paciente"),
  professionalId: z.string().optional().or(z.literal("")),
  specialty: z.string().min(2, "Informe a especialidade"),
  room: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Informe a data de início"),
  time: z.string().min(1, "Informe o horário"),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1, "Selecione ao menos um dia da semana"),
  weeksCount: z.number().int().min(1, "Informe por quantas semanas").max(52, "Máximo de 52 semanas"),
  notes: z.string().optional().or(z.literal("")),
});

export type RecurringAppointmentInput = z.infer<typeof recurringAppointmentSchema>;
