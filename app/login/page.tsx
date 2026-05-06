'use client';

// ============================================================
// LOGIN/PAGE.TSX — Página de login
//
// Equivalente a: index.html + auth.js
//
// Conceitos novos aqui:
//   useState  — armazena valores que mudam (ex: o texto do input)
//   onChange  — evento que dispara a cada letra digitada
//   onKeyDown — evento de teclado (substitui addEventListener)
// ============================================================

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fazerLogin } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  console.log("PASSOU");

  // useState<string>('') cria uma variável reativa.
  // [valor, setValor] — valor lê, setValor atualiza e re-renderiza.
  const [email, setEmail]       = useState<string>('');
  const [senha, setSenha]       = useState<string>('');
  const [erro, setErro]         = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  async function handleLogin() {
    if (!email || !senha) {
      setErro('Preencha o email e a senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const token = await fazerLogin(email, senha);
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err: unknown) {
      // err é 'unknown' no TypeScript — precisamos verificar o tipo antes de usar
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  // Substitui o addEventListener('keydown') do auth.js
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div className="login-bg">
      <div className="login-left">
        <div className="brand-block">
          <span className="brand-icon"></span>
          <h1 className="brand-name">Maluma<br />Shoes</h1>
          <p className="brand-tagline">Gestão de Estoque Inteligente</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Bem-vindo de volta</h2>
          <p className="login-sub">Acesse sua conta para continuar</p>

          {/* Renderização condicional: só mostra o erro se tiver mensagem */}
          {erro && <div className="msg-erro">{erro}</div>}

          <div className="campo">
            <label htmlFor="email">Email</label>
            {/*
              value={email}        — valor controlado pelo estado
              onChange={e => ...}  — atualiza o estado a cada tecla
              onKeyDown={...}      — detecta Enter
            */}
            <input
              type="email"
              id="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              placeholder="••••••••"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
