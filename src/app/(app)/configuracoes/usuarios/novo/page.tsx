import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UserForm } from "@/components/users/user-form";

export default function NovoUsuarioPage() {
  return (
    <div className="space-y-6">
      <Link href="/configuracoes" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para configurações
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Novo usuário</h1>
        <p className="mt-1 text-sm text-muted">Crie um acesso para a equipe, com o papel adequado.</p>
      </div>
      <UserForm />
    </div>
  );
}
