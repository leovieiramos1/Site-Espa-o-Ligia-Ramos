import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientsList } from "@/components/patients/patients-list";
import { UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const patients = await prisma.patient.findMany({
    include: { professional: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Pacientes</h1>
          <p className="mt-1 text-sm text-muted">
            {patients.length === 0
              ? "Nenhum paciente cadastrado ainda"
              : `${patients.length} paciente${patients.length > 1 ? "s" : ""} cadastrado${patients.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/pacientes/novo">
          <Button>
            <UserPlus size={16} />
            Novo paciente
          </Button>
        </Link>
      </div>

      {patients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-sage-darker">
            <Users size={24} strokeWidth={1.75} />
          </div>
          <p className="font-display text-lg text-ink">Comece cadastrando o primeiro paciente</p>
          <p className="max-w-sm text-sm text-muted">
            Ainda não há pacientes na plataforma. Cadastre o primeiro para iniciar o
            acompanhamento clínico e financeiro.
          </p>
          <Link href="/pacientes/novo">
            <Button className="mt-2">
              <UserPlus size={16} />
              Cadastrar paciente
            </Button>
          </Link>
        </Card>
      ) : (
        <PatientsList patients={patients} />
      )}
    </div>
  );
}
