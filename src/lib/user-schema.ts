import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/validation";

export const ROLES = ["ADMIN", "PROFISSIONAL", "RECEPCAO", "FINANCEIRO"] as const;

export const userSchema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(ROLES),
});

export type UserInput = z.infer<typeof userSchema>;

// Na edição, a senha é opcional — em branco mantém a senha atual.
export const userEditSchema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  email: emailSchema,
  role: z.enum(ROLES),
  password: z.union([passwordSchema, z.literal("")]),
});

export type UserEditInput = z.infer<typeof userEditSchema>;
