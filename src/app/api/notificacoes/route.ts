import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "default" | "alert" | "good";
};

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const items: NotificationItem[] = [];

  const appointmentsToday = await prisma.appointment.count({
    where: { startsAt: { gte: startOfToday, lt: endOfToday } },
  });
  if (appointmentsToday > 0) {
    items.push({
      id: "agenda-hoje",
      title: `${appointmentsToday} consulta${appointmentsToday > 1 ? "s" : ""} agendada${appointmentsToday > 1 ? "s" : ""} para hoje`,
      description: "Confira os horários na agenda.",
      href: "/agenda",
      tone: "default",
    });
  }

  if (session.user.role === "ADMIN") {
    const [overdueAgg, inventoryItems, waitingConfirmation] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, _count: true, where: { status: "ATRASADO" } }),
      prisma.inventoryItem.findMany({ select: { quantity: true, minQuantity: true } }),
      prisma.appointment.count({
        where: { startsAt: { gte: startOfToday, lt: endOfToday }, status: "AGENDADA" },
      }),
    ]);
    const lowStockItems = inventoryItems.filter((item) => item.quantity <= item.minQuantity);

    if ((overdueAgg._count ?? 0) > 0) {
      items.push({
        id: "pagamentos-atraso",
        title: `${overdueAgg._count} pagamento${overdueAgg._count > 1 ? "s" : ""} em atraso`,
        description: `Total de R$ ${(overdueAgg._sum.amount ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} pendente.`,
        href: "/financeiro",
        tone: "alert",
      });
    }

    if (lowStockItems.length > 0) {
      items.push({
        id: "estoque-baixo",
        title: `${lowStockItems.length} ite${lowStockItems.length > 1 ? "ns" : "m"} com estoque baixo`,
        description: "Reponha o estoque antes que falte.",
        href: "/estoque",
        tone: "alert",
      });
    }

    if (waitingConfirmation > 0) {
      items.push({
        id: "aguardando-confirmacao",
        title: `${waitingConfirmation} consulta${waitingConfirmation > 1 ? "s" : ""} aguardando confirmação`,
        description: "Consultas de hoje ainda não confirmadas.",
        href: "/agenda",
        tone: "default",
      });
    }
  }

  return NextResponse.json(items);
}
