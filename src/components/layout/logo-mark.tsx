import { cn } from "@/lib/utils";

/**
 * Logo oficial da marca. A imagem real fica em `public/logo.png` — troque
 * esse arquivo para atualizar a logo em todo o site (sidebar, login, etc).
 * Veja LOGO.md na raiz do projeto para instruções.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Espaço Lígia Ramos"
      className={cn("h-8 w-8 shrink-0 rounded-full object-cover", className)}
    />
  );
}
