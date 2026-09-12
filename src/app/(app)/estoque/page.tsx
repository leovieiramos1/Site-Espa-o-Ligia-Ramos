import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Estoque</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length === 0 ? "Nenhum item cadastrado ainda" : `${items.length} itens no estoque`}
          </p>
        </div>
        <Link href="/estoque/novo">
          <Button>
            <Plus size={16} />
            Novo item
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-light text-sage-darker">
            <Package size={24} strokeWidth={1.75} />
          </div>
          <p className="font-display text-lg text-ink">Nenhum item ainda</p>
          <p className="max-w-sm text-sm text-muted">
            Cadastre produtos, materiais e equipamentos para controlar o estoque da clínica.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {items.map((item) => {
              const low = item.quantity <= item.minQuantity;
              return (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-muted">
                      {item.category}
                      {item.supplier ? ` · ${item.supplier}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-ink/80">{item.quantity} un.</span>
                    {low && (
                      <span className="flex items-center gap-1.5 rounded-full bg-status-alert-bg px-2.5 py-1 text-xs font-medium text-status-alert">
                        <AlertTriangle size={13} /> Estoque baixo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
