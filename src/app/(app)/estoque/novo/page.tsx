import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { InventoryForm } from "@/components/inventory/inventory-form";

export default function NovoItemEstoquePage() {
  return (
    <div className="space-y-6">
      <Link href="/estoque" className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-darker">
        <ChevronLeft size={16} />
        Voltar para estoque
      </Link>
      <div>
        <h1 className="font-display text-3xl text-ink">Novo item</h1>
        <p className="mt-1 text-sm text-muted">Cadastre um produto, material ou equipamento.</p>
      </div>
      <InventoryForm />
    </div>
  );
}
