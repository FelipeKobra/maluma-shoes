'use client';

// ============================================================
// DASHBOARD/PAGE.TSX
//
// Equivalente a: dashboard.html + dashboard.js
//
// Conceito novo: useEffect
//   Substitui o código que rodava automaticamente ao carregar
//   a página (ex: carregarDashboard() no final do .js).
//   useEffect(() => { ... }, []) roda UMA VEZ após o componente
//   aparecer na tela. O [] vazio significa "sem dependências".
// ============================================================

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI } from '@/lib/api';
import type { Alerta, PosicaoEstoque } from '@/types';

export default function DashboardPage() {
  // Estados para os números dos cards
  const [totalCalcados, setTotalCalcados]         = useState<number | null>(null);
  const [totalEstoque, setTotalEstoque]           = useState<number | null>(null);
  const [totalMovimentacoes, setTotalMovimentacoes] = useState<number | null>(null);
  const [alertas, setAlertas]                     = useState<Alerta[]>([]);
  const [minimo, setMinimo]                       = useState<PosicaoEstoque[]>([]);
  const [carregando, setCarregando]               = useState(true);

  // useEffect substitui o carregarDashboard() chamado no fim do .js
  useEffect(() => {
    carregarDashboard();
  }, []); // [] = roda só uma vez, quando o componente monta

  async function carregarDashboard() {
    try {
      const [calcados, estoque, movs, alertasData, minimoData] = await Promise.all([
        calcadosAPI.listar(),
        estoqueAPI.listar(),
        movimentacoesAPI.listar(),
        alertasAPI.estoqueMinimo(),
        estoqueAPI.minimo(),
      ]);

      setTotalCalcados(Array.isArray(calcados) ? calcados.length : 0);
      setTotalEstoque(Array.isArray(estoque) ? estoque.length : 0);
      setTotalMovimentacoes(Array.isArray(movs) ? movs.length : 0);
      setAlertas(Array.isArray(alertasData) ? alertasData : []);
      setMinimo(Array.isArray(minimoData) ? minimoData : []);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>

        <div className="cards-grid">
          <StatCard icon="👟" valor={totalCalcados} label="Calçados Cadastrados" />
          <StatCard icon="📦" valor={totalEstoque} label="Posições de Estoque" />
          <StatCard icon="🔄" valor={totalMovimentacoes} label="Movimentações" />
          <StatCard icon="⚠️" valor={alertas.length} label="Alertas de Estoque" alerta />
        </div>

        {/* Alertas */}
        <div className="card">
          <div className="card-title">⚠️ Alertas de Estoque Mínimo</div>
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : alertas.length > 0 ? (
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr><th>Produto</th><th>Estoque Atual</th><th>Estoque Mínimo</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {alertas.map((a, i) => (
                    <tr key={i}>
                      <td>{a.nomeProduto || a.nome || a.calcado?.nome || '—'}</td>
                      <td>{a.quantidadeAtual ?? a.saldo ?? '—'}</td>
                      <td>{a.estoqueMinimo ?? a.minimo ?? '—'}</td>
                      <td><span className="badge badge-alerta">⚠️ Abaixo do mínimo</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="texto-vazio">✅ Nenhum alerta no momento.</p>
          )}
        </div>

        {/* Estoque mínimo */}
        <div className="card">
          <div className="card-title">📉 Itens Abaixo do Estoque Mínimo</div>
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : minimo.length > 0 ? (
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr><th>Calçado</th><th>Saldo Atual</th><th>Mínimo</th></tr>
                </thead>
                <tbody>
                  {minimo.map((m, i) => (
                    <tr key={i}>
                      <td>{m.calcado?.nome || m.nome || '—'}</td>
                      <td>{m.saldo ?? m.quantidade ?? '—'}</td>
                      <td>{m.estoqueMinimo ?? m.minimo ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="texto-vazio">✅ Todos os calçados estão com estoque adequado.</p>
          )}
        </div>
      </main>
    </div>
  );
}

// ---- Componente interno StatCard ----
// Props tipadas com interface: obriga quem usa a passar os valores certos
interface StatCardProps {
  icon: string;
  valor: number | null;
  label: string;
  alerta?: boolean; // ? = opcional, padrão é undefined (falso)
}

function StatCard({ icon, valor, label, alerta }: StatCardProps) {
  return (
    <div className={`card card-stat${alerta ? ' card-alerta' : ''}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-valor">{valor ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
