'use client';


import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fazerLogin } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  console.log("PASSOU");

  
  const [email, setEmail]       = useState<string>('');
  const [senha, setSenha]       = useState<string>('');
  const [erro, setErro]         = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  // app/login/page.tsx

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

  
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;

    router.push('/dashboard');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao fazer login.';
    setErro(msg);
  } finally {
    setCarregando(false);
  }
}

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

          {erro && <div className="msg-erro">{erro}</div>}

          <div className="campo">
            <label htmlFor="email">Email</label>
            
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
