import { auth } from "@/auth";
import type { Role } from "@/lib/permissions";

export async function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!role || !allow.includes(role)) return null;
  return <>{children}</>;
}
