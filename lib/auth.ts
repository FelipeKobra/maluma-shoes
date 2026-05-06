// ============================================================
// AUTH.TS — Funções de autenticação
//
// No React/Next.js não manipulamos o DOM diretamente.
// Em vez de document.getElementById, usamos estado (useState)
// e o router do Next.js para navegar entre páginas.
// ============================================================

'use client'; // Necessário no Next.js App Router para código que roda no browser

import { useRouter } from 'next/navigation';

// Hook customizado — funções de auth prontas para usar em qualquer componente
export function useAuth() {
  const router = useRouter();

  function requireAuth() {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }

  function sair() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return { requireAuth, sair };
}

// Login direto (sem hook, para usar na página de login)
export async function fazerLogin(
  email: string,
  senha: string
): Promise<string> {
  const response = await fetch('https://maluma-shoes.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const dados = await response.json();

  if (!response.ok) {
    throw new Error(dados.message || 'Email ou senha incorretos.');
  }

  const token = dados.token || dados.accessToken || dados.access_token;
  if (!token) throw new Error('Resposta inválida do servidor.');

  return token;
}
