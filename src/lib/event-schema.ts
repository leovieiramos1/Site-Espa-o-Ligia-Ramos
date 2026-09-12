import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2, "Informe o nome do evento"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Informe a data e horário"),
  location: z.string().optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(1, "Informe a capacidade"),
  responsible: z.string().optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;
