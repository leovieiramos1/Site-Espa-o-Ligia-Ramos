import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inventoryItemSchema } from "@/lib/inventory-schema";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão para gerenciar estoque" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inventoryItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  const item = await prisma.inventoryItem.create({
    data: {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      minQuantity: data.minQuantity,
      supplier: data.supplier || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "InventoryItem",
    entityId: item.id,
    details: `Item de estoque "${item.name}" cadastrado`,
  });

  return NextResponse.json(item, { status: 201 });
}
