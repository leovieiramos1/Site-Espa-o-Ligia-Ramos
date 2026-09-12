import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/payment-schema";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    include: { patient: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para registrar pagamentos" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  const payment = await prisma.payment.create({
    data: {
      patientId: data.patientId,
      amount: data.amount,
      method: data.method,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paidAt: data.status === "PAGO" ? new Date() : null,
      description: data.description || null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Payment",
    entityId: payment.id,
    details: `Pagamento de R$ ${payment.amount} registrado`,
  });

  return NextResponse.json(payment, { status: 201 });
}
