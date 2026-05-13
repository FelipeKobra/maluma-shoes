'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/* ─── Ícones ──────────────────────────────────────────── */
const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);
const IconCalcados = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l5-5 4 4 5-6 4 3"/></svg>
);
const IconEstoque = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
);
const IconMovimentacoes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3 21 7l-4 4"/><path d="M21 7H9"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h12"/></svg>
);
const IconUsuarios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconRelatorios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);
const IconSair = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     Icon: IconDashboard },
  { href: '/calcados',      label: 'Calçados',      Icon: IconCalcados },
  { href: '/estoque',       label: 'Estoque',       Icon: IconEstoque },
  { href: '/movimentacoes', label: 'Movimentações', Icon: IconMovimentacoes },
  { href: '/usuarios',      label: 'Usuários',      Icon: IconUsuarios },
  { href: '/relatorios',    label: 'Relatórios',    Icon: IconRelatorios },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      {/* HEADER MOBILE (Aparece apenas quando a tela for pequena) */}
      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .header-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-desktop { display: flex !important; }
          .header-mobile { display: none !important; }
        }
      `}</style>

      <header className="header-mobile" style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#111827', color: 'white',
        padding: '15px 20px', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>MALUMA SHOES</span>
        <button onClick={() => setMenuAberto(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <IconMenu />
        </button>
      </header>

      {/* SIDEBAR DESKTOP ORIGINAL */}
      <aside className="sidebar sidebar-desktop">
        <div className="sidebar-brand">Maluma Shoes</div>
        <nav className="sidebar-nav">
          {navItems.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={`nav-item ${pathname === href ? 'active' : ''}`}>
              <Icon /> {label}
            </Link>
          ))}
        </nav>
        <button className="btn-sair" onClick={sair}><IconSair /> Sair</button>
      </aside>

      {/* MENU DRAWER MOBILE */}
      {menuAberto && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 110
        }} onClick={() => setMenuAberto(false)}>
          <div style={{
            width: '280px', height: '100%', backgroundColor: '#111827',
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'white' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Menu</span>
              <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', color: 'gray' }}><IconX /></button>
            </div>
            
            {navItems.map(({ href, label, Icon }) => (
              <Link 
                key={href} 
                href={href} 
                onClick={() => setMenuAberto(false)}
                className={`nav-item ${pathname === href ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', textDecoration: 'none' }}
              >
                <Icon /> {label}
              </Link>
            ))}

            <button className="btn-sair" onClick={sair} style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
              <IconSair /> Sair
            </button>
          </div>
        </div>
      )}
    </>
  );
}