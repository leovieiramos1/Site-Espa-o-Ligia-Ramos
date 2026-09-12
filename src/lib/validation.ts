import { z } from "zod";

/**
 * Regras de segurança da plataforma (security by design):
 * ver SECURITY.md para o racional completo de cada regra abaixo.
 */

const ALLOWED_EMAIL_DOMAINS = ["gmail.com", "hotmail.com"];

export function isAllowedEmailDomain(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && ALLOWED_EMAIL_DOMAINS.includes(domain);
}

export const emailSchema = z
  .string()
  .min(1, "Informe o e-mail")
  .email("E-mail inválido")
  .refine(isAllowedEmailDomain, {
    message: "Utilize um e-mail @gmail.com ou @hotmail.com",
  });

// Formato exigido: (DD) 9.XXXX-XXXX — ex: (81) 9.1234-5678
const PHONE_REGEX = /^\(\d{2}\) 9\.\d{4}-\d{4}$/;

export const phoneSchema = z
  .string()
  .min(1, "Informe o telefone")
  .regex(PHONE_REGEX, "Telefone deve estar no formato (DD) 9.XXXX-XXXX");

export function formatPhoneMask(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 11);
  const ddd = digits.slice(0, 2);
  const nine = digits.slice(2, 3);
  const part1 = digits.slice(3, 7);
  const part2 = digits.slice(7, 11);

  let out = "";
  if (ddd) out += `(${ddd}`;
  if (ddd.length === 2) out += ") ";
  if (nine) out += `${nine}`;
  if (part1) out += `.${part1}`;
  if (part2) out += `-${part2}`;
  return out;
}

export const cpfSchema = z
  .string()
  .min(1, "Informe o CPF")
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00");

function hasSequentialDigits(value: string) {
  for (let i = 0; i < value.length - 2; i++) {
    const a = value.charCodeAt(i);
    const b = value.charCodeAt(i + 1);
    const c = value.charCodeAt(i + 2);
    const isDigit = (code: number) => code >= 48 && code <= 57;
    if (!isDigit(a) || !isDigit(b) || !isDigit(c)) continue;
    if (b - a === 1 && c - b === 1) return true; // ascendente: 123, 456...
    if (a - b === 1 && b - c === 1) return true; // descendente: 321, 987...
  }
  return false;
}

function hasRepeatedRun(value: string) {
  for (let i = 0; i < value.length - 2; i++) {
    if (value[i] === value[i + 1] && value[i + 1] === value[i + 2]) return true;
  }
  return false;
}

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um símbolo (ex: @ # ! $)")
  .refine((v) => !hasSequentialDigits(v), {
    message: "A senha não pode conter números em sequência (ex: 123, 987)",
  })
  .refine((v) => !hasRepeatedRun(v), {
    message: "A senha não pode conter caracteres repetidos em sequência (ex: aaa, 111)",
  });

export const passwordRules = [
  "Mínimo de 8 caracteres",
  "Ao menos uma letra maiúscula e uma minúscula",
  "Ao menos um número e um símbolo",
  "Sem sequências numéricas (ex: 123, 987)",
  "Sem caracteres repetidos em sequência (ex: aaa, 111)",
];
