import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Clock } from "lucide-react";

const templates = [
  {
    title: "Confirmação de consulta",
    body: "Olá, {{paciente}}! 🌿 Sua consulta no Espaço Lígia Ramos está confirmada para {{data}} às {{hora}}.",
  },
  {
    title: "Lembrete — 24 horas antes",
    body: "Oi, {{paciente}}! Passando para lembrar da sua consulta amanhã às {{hora}}. Até lá 🌿",
  },
  {
    title: "Lembrete — 2 horas antes",
    body: "{{paciente}}, sua consulta é daqui a pouco, às {{hora}}. Te esperamos no Espaço Lígia Ramos!",
  },
  {
    title: "Retorno de paciente inativo",
    body: "Sentimos sua falta, {{paciente}}! Que tal retomar seu cuidado com a gente? Responda esta mensagem para reagendar.",
  },
];

export default function ComunicacaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Comunicação</h1>
        <p className="mt-1 text-sm text-muted">
          Modelos de mensagem para confirmações, lembretes e campanhas com pacientes.
        </p>
      </div>

      <Card className="flex items-start gap-3 border-dashed">
        <Clock size={18} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-sm text-muted">
          O envio automático por WhatsApp/e-mail e o agendamento de campanhas estão planejados
          para uma próxima etapa. Por enquanto, use os modelos abaixo como referência.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.title}>
            <div className="mb-2 flex items-center gap-2">
              <MessageCircle size={16} className="text-sage-dark" />
              <p className="font-display text-base text-ink">{t.title}</p>
            </div>
            <p className="rounded-xl bg-cream-soft/70 px-3.5 py-3 text-sm text-ink/80">{t.body}</p>
            <button className="mt-3 flex items-center gap-1.5 text-xs font-medium text-sage-darker hover:underline">
              <Send size={12} /> Copiar modelo
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
