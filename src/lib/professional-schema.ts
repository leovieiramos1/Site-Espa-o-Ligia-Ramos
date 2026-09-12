import { z } from "zod";
import { emailSchema, phoneSchema } from "@/lib/validation";

export const professionalSchema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  specialty: z.string().min(2, "Informe a especialidade"),
  email: emailSchema,
  phone: phoneSchema,
  active: z.boolean(),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;
