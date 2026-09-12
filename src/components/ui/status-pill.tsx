import { cn } from "@/lib/utils";
import type { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { appointmentStatusLabels, paymentStatusLabels } from "@/lib/labels";

const appointmentStyles: Record<AppointmentStatus, string> = {
  AGENDADA: "bg-status-off-bg text-status-off",
  CONFIRMADA: "bg-sage-light text-sage-darker",
  EM_ATENDIMENTO: "bg-gold-light text-gold",
  CONCLUIDA: "bg-status-done-bg text-status-done",
  CANCELADA: "bg-status-off-bg text-status-off",
  FALTOU: "bg-status-alert-bg text-status-alert",
};

const paymentStyles: Record<PaymentStatus, string> = {
  PAGO: "bg-status-done-bg text-status-done",
  PENDENTE: "bg-status-wait-bg text-status-wait",
  ATRASADO: "bg-status-alert-bg text-status-alert",
  PARCIAL: "bg-gold-light text-gold",
};

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

export function AppointmentStatusPill({ status }: { status: AppointmentStatus }) {
  return <Pill className={appointmentStyles[status]}>{appointmentStatusLabels[status]}</Pill>;
}

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return <Pill className={paymentStyles[status]}>{paymentStatusLabels[status]}</Pill>;
}
