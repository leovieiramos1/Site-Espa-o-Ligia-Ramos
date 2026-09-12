import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().min(2, "Informe o nome do item"),
  category: z.string().min(1, "Informe a categoria"),
  quantity: z.coerce.number().int().min(0, "Informe a quantidade"),
  minQuantity: z.coerce.number().int().min(0).default(0),
  supplier: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
