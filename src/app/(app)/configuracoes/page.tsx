import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { roleLabels, type Role } from "@/lib/permissions";
import { passwordRules } from "@/lib/validation";
import { ShieldCheck, UserPlus, Mail, Phone, Lock, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Configurações</h1>
        <p className="mt-1 text-sm text-muted">Segurança, permissões e usuários do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regras de segurança ativas</CardTitle>
          <ShieldCheck size={18} className="text-sage-dark" />
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Mail size={14} className="text-sage-dark" /> E-mail
            </p>
            <p className="text-xs text-muted">Apenas domínios @gmail.com e @hotmail.com são aceitos em qualquer cadastro.</p>
          </div>
          <div className="rounded-xl border border-line px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Phone size={14} className="text-sage-dark" /> Telefone
            </p>
            <p className="text-xs text-muted">Formato obrigatório: (DD) 9.XXXX-XXXX.</p>
          </div>
          <div className="rounded-xl border border-line px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
              <Lock size={14} className="text-sage-dark" /> Senhas
            </p>
            <ul className="space-y-0.5 text-xs text-muted">
              {passwordRules.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Veja o racional completo dessas regras e das recomendações de infraestrutura em{" "}
          <span className="font-medium text-ink">SECURITY.md</span>, na raiz do projeto.
        </p>
      </Card>

      <Card className="p-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Usuários do sistema</CardTitle>
          <Link href="/configuracoes/usuarios/novo">
            <Button>
              <UserPlus size={16} />
              Novo usuário
            </Button>
          </Link>
        </CardHeader>
        {users.length === 0 ? (
          <p className="px-5 pb-6 text-center text-sm text-muted">Nenhum usuário cadastrado.</p>
        ) : (
          <div className="divide-y divide-line">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-sage-darker">
                    {roleLabels[u.role as Role]}
                  </span>
                  <span className="text-xs text-muted">
                    {u.lastLoginAt ? `Último acesso: ${u.lastLoginAt.toLocaleDateString("pt-BR")}` : "Nunca acessou"}
                  </span>
                  <Link
                    href={`/configuracoes/usuarios/${u.id}/editar`}
                    className="flex items-center gap-1.5 text-xs font-medium text-sage-darker hover:underline"
                  >
                    <Pencil size={13} /> Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
