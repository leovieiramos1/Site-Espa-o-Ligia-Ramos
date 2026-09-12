import Link from "next/link";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAvatarColorClass, getInitials } from "@/lib/avatar";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProntuariosPage() {
  const patients = await prisma.patient.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Prontuários</h1>
        <p className="mt-1 text-sm text-muted">
          Acesse o prontuário eletrônico completo de cada paciente.
        </p>
      </div>

      {patients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="font-display text-lg text-ink">Nenhum prontuário ainda</p>
          <p className="max-w-sm text-sm text-muted">
            Os prontuários aparecem aqui assim que os pacientes forem cadastrados.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {patients.map((p) => (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-cream-soft/60"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm ${getAvatarColorClass(p.name)}`}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="truncate text-xs text-muted">{p.treatment || "Tratamento não definido"}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-sage-darker">
                  <FileText size={14} /> Ver prontuário
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
