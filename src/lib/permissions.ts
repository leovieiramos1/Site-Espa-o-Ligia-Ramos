export type Role = "ADMIN" | "PROFISSIONAL" | "RECEPCAO" | "FINANCEIRO";

/**
 * Só ADMIN acessa estas áreas — dados de pacientes, equipe, estoque,
 * configurações e pagamentos são tratados como sensíveis (LGPD / dados
 * financeiros) e não ficam livres para os demais papéis.
 */
export const ADMIN_ONLY_PATHS = [
  "/pacientes",
  "/prontuarios",
  "/equipe",
  "/estoque",
  "/configuracoes",
  "/comunicacao",
  "/relatorios",
  "/pagamentos",
];

/**
 * Papéis não-ADMIN enxergam só estas áreas, e apenas em modo leitura:
 * agenda, dívidas (financeiro) e eventos. O acompanhamento de tratamento
 * passou a viver dentro do perfil do paciente (área ADMIN-only).
 */
export const READ_ONLY_PATHS = ["/agenda", "/financeiro", "/eventos"];

export function canAccessPath(role: Role, pathname: string) {
  if (role === "ADMIN") return true;

  const isAdminOnly = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminOnly) return false;

  const isReadOnly = READ_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isReadOnly) return true;

  // Dashboard e páginas neutras (ex: perfil) ficam liberadas por padrão.
  return true;
}

export function canWrite(role: Role, pathname: string) {
  if (role === "ADMIN") return true;
  const isReadOnly = READ_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isReadOnly) return false;
  return canAccessPath(role, pathname);
}

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  PROFISSIONAL: "Profissional",
  RECEPCAO: "Recepção",
  FINANCEIRO: "Financeiro",
};
