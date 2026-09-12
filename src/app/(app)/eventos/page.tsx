import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/auth/role-gate";
import { PartyPopper, Plus, MapPin, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Eventos</h1>
          <p className="mt-1 text-sm text-muted">
            {events.length === 0 ? "Nenhum evento cadastrado ainda" : `${events.length} eventos`}
          </p>
        </div>
        <RoleGate allow={["ADMIN"]}>
          <Link href="/eventos/novo">
            <Button>
              <Plus size={16} />
              Novo evento
            </Button>
          </Link>
        </RoleGate>
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-sage-darker">
            <PartyPopper size={24} strokeWidth={1.75} />
          </div>
          <p className="font-display text-lg text-ink">Nenhum evento ainda</p>
          <p className="max-w-sm text-sm text-muted">
            Workshops, palestras e campanhas da clínica aparecerão aqui, com inscrições e vagas.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <p className="font-display text-lg text-ink">{event.name}</p>
              <p className="mt-1 text-sm text-muted">{event.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink/70">
                <span>{event.date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {event.location}
                  </span>
                )}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-sage-darker">
                <Users size={14} />
                {event._count.registrations} / {event.capacity} vagas
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
