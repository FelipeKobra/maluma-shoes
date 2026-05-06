'use client';

// ============================================================
// SIDEBAR.TSX — Componente reutilizável
//
// No HTML você repetia o aside em cada página.
// No React, criamos UM componente e importamos em todo lugar.
//
// Conceito novo: Props
//   Props são as "configurações" que você passa pro componente.
//   interface SidebarProps define quais props são aceitas.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// Ícones SVG como componentes React
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
    <path d="M17 3 21 7l-4 4"/><path d="M21 7H9"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h12"/>
  </svg>
);
const IconUsuarios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconRelatorios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);
const IconSair = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/>
    <path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/>
  </svg>
);

// Lista de rotas da navegação
const navItems = [
  { href: '/dashboard',      label: 'Dashboard',      Icon: IconDashboard },
  { href: '/calcados',       label: 'Calçados',       Icon: IconCalcados },
  { href: '/estoque',        label: 'Estoque',        Icon: IconEstoque },
  { href: '/movimentacoes',  label: 'Movimentações',  Icon: IconMovimentacoes },
  { href: '/usuarios',       label: 'Usuários',       Icon: IconUsuarios },
  { href: '/relatorios',     label: 'Relatórios',     Icon: IconRelatorios },
];

export default function Sidebar() {
  // usePathname() retorna a rota atual, ex: '/dashboard'
  // Usamos pra marcar o item ativo com a classe CSS correta
  const pathname = usePathname();
  const { sair } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Maluma Shoes</div>

      <nav className="sidebar-nav">
        {navItems.map(({ href, label, Icon }) => (
          // Link é o componente de navegação do Next.js (substitui <a href="...">)
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

      {/* onClick={sair} — em React eventos são camelCase e recebem funções, não strings */}
      <button className="btn-sair" onClick={sair} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconSair /> Sair
      </button>
    </aside>
  );
}
