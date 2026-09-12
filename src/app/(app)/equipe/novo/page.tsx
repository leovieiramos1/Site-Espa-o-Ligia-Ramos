import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProfessionalForm } from "@/components/professionals/professional-form";

export default function NovoProfissionalPage() {
  return (
    <div className="space-y-6">
      <Link href="/equipe" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para equipe
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Novo profissional</h1>
        <p className="mt-1 text-sm text-muted">Cadastre um novo membro da equipe.</p>
      </div>
      <ProfessionalForm />
    </div>
  );
}
