import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import { AuthSessionProvider } from "@/components/session-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Espaço Lígia Ramos",
  description:
    "Plataforma de gestão clínica do Espaço Lígia Ramos — fisioterapia e medicina integrativa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
