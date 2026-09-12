import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/users/user-form";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <Link href="/configuracoes" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para configurações
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Editar usuário</h1>
        <p className="mt-1 text-sm text-muted">Atualize os dados de {user.name}.</p>
      </div>
      <UserForm userId={user.id} user={user} />
    </div>
  );
}
