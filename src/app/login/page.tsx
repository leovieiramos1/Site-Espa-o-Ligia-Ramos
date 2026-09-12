"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogoMark } from "@/components/layout/logo-mark";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-sage-dark p-12 text-cream lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sage/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="rounded-full bg-cream/10 p-0.5">
            <LogoMark />
          </div>
          <span className="font-display text-lg">Espaço Lígia Ramos</span>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-4xl italic leading-snug">
            Cuidar do corpo é cuidar da qualidade de vida.
          </p>
          <p className="mt-4 text-sm text-cream/75">
            Fisioterapia, Medicina Integrativa e uma equipe multidisciplinar dedicada
            ao seu movimento e bem-estar.
          </p>
        </div>

        <p className="relative text-xs text-cream/60">
          © 2026 Espaço Lígia Ramos — Cuidado integrado e humanizado.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <LogoMark />
            <p className="font-display text-2xl text-ink">Espaço Lígia Ramos</p>
            <p className="text-sm text-muted">
              Cuidar do corpo é cuidar da qualidade de vida.
            </p>
          </div>

          <h1 className="font-display text-2xl text-ink">Bem-vinda de volta 🌿</h1>
          <p className="mt-1 text-sm text-muted">Entre para acessar sua plataforma de gestão.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-sage focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-status-alert-bg px-3 py-2 text-sm text-status-alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-full bg-sage-dark px-4 py-2.5 text-sm font-medium text-cream hover:bg-sage-darker disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>

            <p className="text-center text-sm text-muted">
              <a href="#" className="hover:text-sage-darker hover:underline">
                Esqueci minha senha
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
