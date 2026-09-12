import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { canAccessPath, type Role } from "@/lib/permissions";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname.startsWith("/login");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isHealthCheck = pathname.startsWith("/api/health");
  const isAcessoNegado = pathname.startsWith("/acesso-negado");

  if (isApiAuth || isHealthCheck) return NextResponse.next();

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (isLoggedIn && !isAcessoNegado) {
    const role = req.auth?.user?.role as Role | undefined;
    if (role && !canAccessPath(role, pathname)) {
      return NextResponse.redirect(new URL("/acesso-negado", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
