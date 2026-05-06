'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI } from '@/lib/api';
import type { Alerta, PosicaoEstoque } from '@/types';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalCalcados: null as number | null,
    totalEstoque: null as number | null,
    totalMovimentacoes: null as number | null,
    alertas: [] as Alerta[],
    minimo: [] as PosicaoEstoque[],
    carregando: true, // Movemos o 'carregando' para dentro do objeto principal
  });

  useEffect(() => {
    // Definimos a função dentro do useEffect para isolar o escopo
    async function carregarDashboard() {
      try {
        const [calcados, estoque, movs, alertasData, minimoData] = await Promise.all([
          calcadosAPI.listar().catch(() => []),
          estoqueAPI.listar().catch(() => []),
          movimentacoesAPI.listar().catch(() => []),
          alertasAPI.estoqueMinimo().catch(() => []),
          estoqueAPI.minimo().catch(() => []),
        ]);

        // ATUALIZAÇÃO ÚNICA: Dados e status de carregamento no mesmo ciclo
        setDashboardData({
          totalCalcados: Array.isArray(calcados) ? calcados.length : 0,
          totalEstoque: Array.isArray(estoque) ? estoque.length : 0,
          totalMovimentacoes: Array.isArray(movs) ? movs.length : 0,
          alertas: Array.isArray(alertasData) ? alertasData : [],
          minimo: Array.isArray(minimoData) ? minimoData : [],
          carregando: false, // O fim do loading acontece junto com a chegada dos dados
        });

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setDashboardData(prev => ({ ...prev, carregando: false }));
      }
    }

    carregarDashboard();
  }, []);

  // Extraímos as variáveis para manter o seu HTML intacto
  const { totalCalcados, totalEstoque, totalMovimentacoes, alertas, minimo, carregando } = dashboardData;

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
                      <td>{m.calcado?.nome || m.localizacao || '—'}</td>
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

interface StatCardProps {
  icon: string;
  valor: number | null;
  label: string;
  alerta?: boolean;
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