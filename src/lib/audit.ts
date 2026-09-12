import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
    },
  });
}
