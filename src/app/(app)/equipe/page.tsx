import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAvatarColorClass, getInitials } from "@/lib/avatar";
import { UserRound, UserPlus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const professionals = await prisma.professional.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { patients: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Equipe</h1>
          <p className="mt-1 text-sm text-muted">
            {professionals.length === 0
              ? "Nenhum profissional cadastrado ainda"
              : `${professionals.length} profissionais cadastrados`}
          </p>
        </div>
        <Link href="/equipe/novo">
          <Button>
            <UserPlus size={16} />
            Novo profissional
          </Button>
        </Link>
      </div>

      {professionals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-sage-darker">
            <UserRound size={24} strokeWidth={1.75} />
          </div>
          <p className="font-display text-lg text-ink">Cadastre sua equipe</p>
          <p className="max-w-sm text-sm text-muted">
            Cadastre fisioterapeutas, médicos e demais profissionais para vinculá-los a
            pacientes, agendas e tratamentos.
          </p>
          <Link href="/equipe/novo">
            <Button className="mt-2">
              <UserPlus size={16} />
              Cadastrar profissional
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {professionals.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-base ${getAvatarColorClass(p.name)}`}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">{p.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-ink/70">
                  <span>{p.phone}</span>
                  <span>{p._count.patients} pacientes</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.active ? "bg-status-done-bg text-status-done" : "bg-status-off-bg text-status-off"}`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                  <Link
                    href={`/equipe/${p.id}/editar`}
                    className="flex items-center gap-1.5 text-xs font-medium text-sage-darker hover:underline"
                  >
                    <Pencil size={13} /> Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
