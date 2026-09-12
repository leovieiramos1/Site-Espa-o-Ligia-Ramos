import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { LogoMark } from "@/components/layout/logo-mark";

export default function AcessoNegadoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <LogoMark className="mb-2" />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-alert-bg text-status-alert">
        <ShieldAlert size={26} strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-2xl text-ink">Acesso restrito</h1>
      <p className="max-w-sm text-sm text-muted">
        Seu perfil não tem permissão para acessar esta área. Fale com a administração do
        Espaço Lígia Ramos caso precise de acesso ampliado.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-full bg-sage-dark px-5 py-2 text-sm font-medium text-cream hover:bg-sage-darker"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
