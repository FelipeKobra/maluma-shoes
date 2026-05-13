'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/* ─── Ícones ──────────────────────────────────────────── */
const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IconCalcados = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12l5-5 4 4 5-6 4 3"/>
  </svg>
);
const IconEstoque = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
  </svg>
);
const IconMovimentacoes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3 21 7l-4 4"/><path d="M21 7H9"/>
    <path d="M7 21l-4-4 4-4"/><path d="M3 17h12"/>
  </svg>
);
const IconUsuarios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconRelatorios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);
const IconSair = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─── Rotas ───────────────────────────────────────────── */
const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     Icon: IconDashboard },
  { href: '/calcados',      label: 'Calçados',      Icon: IconCalcados },
  { href: '/estoque',       label: 'Estoque',       Icon: IconEstoque },
  { href: '/movimentacoes', label: 'Movimentações', Icon: IconMovimentacoes },
  { href: '/usuarios',      label: 'Usuários',      Icon: IconUsuarios },
  { href: '/relatorios',    label: 'Relatórios',    Icon: IconRelatorios },
];

/* ─── Componente ──────────────────────────────────────── */
export default function Sidebar() {
  const pathname = usePathname();
  const { sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const fechar = () => setMenuAberto(false);

  return (
    <>
      {/* ── DESKTOP: sidebar lateral fixa ─────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">Maluma Shoes</div>

        <nav className="sidebar-nav">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? 'active' : ''}`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        <button className="btn-sair" onClick={sair}>
          <IconSair /> Sair
        </button>
      </aside>

      {/* ── MOBILE: topbar fixa no topo ───────────────── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111827] text-white sticky top-0 z-50 shrink-0">
        <span className="font-bold text-base tracking-tight">Maluma Shoes</span>
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Abrir menu"
        >
          {menuAberto ? <IconX /> : <IconMenu />}
        </button>
      </header>

      {/* Overlay escuro ao abrir drawer */}
      {menuAberto && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={fechar}
        />
      )}

      {/* Drawer deslizante */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-[#111827] z-50
          flex flex-col p-6 gap-1 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-bold text-lg text-white">Maluma Shoes</span>
          <button
            onClick={fechar}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <IconX />
          </button>
        </div>

        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? 'active' : ''}`}
            onClick={fechar}
          >
            <Icon />
            {label}
          </Link>
        ))}

        <button
          className="nav-item mt-auto text-left w-full"
          onClick={() => { fechar(); sair(); }}
        >
          <IconSair /> Sair
        </button>
      </div>
    </>
  );
}
