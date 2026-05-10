// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Obtém o token do cookie (ajuste o nome para o que você usa no login)
  const token = request.cookies.get('auth_token')?.value;

  const { pathname } = request.nextUrl;

  // 2. Definir a rota de login
  const isLoginPage = pathname === '/login';

  // 3. Lógica de proteção
  if (!token && !isLoginPage) {
    // Se não está logado e tenta acessar qualquer página (estoque, usuários, etc)
    // Redireciona para o login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginPage) {
    // Se já está logado e tenta ir para o login, manda para o dashboard/estoque
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 4. Configurar quais rotas o middleware deve observar
export const config = {
  matcher: [
    /*
     * Ignora arquivos estáticos (imagem, favicon, etc)
     * Protege todas as rotas EXCETO /api (se necessário), /_next/static, /_next/image e favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};