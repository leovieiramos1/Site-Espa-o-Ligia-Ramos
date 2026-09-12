import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EventForm } from "@/components/events/event-form";

export default function NovoEventoPage() {
  return (
    <div className="space-y-6">
      <Link href="/eventos" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para eventos
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Novo evento</h1>
        <p className="mt-1 text-sm text-muted">Crie um workshop, palestra ou campanha.</p>
      </div>
      <EventForm />
    </div>
  );
}
