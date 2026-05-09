'use client';

import { useState, useEffect } from 'react';
import { ElementType } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI } from '@/lib/api';
import type { Alerta, PosicaoEstoque } from '@/types';
import { Footprints, Archive, RefreshCcw, CircleAlert, MessageCircleWarning, TrendingDown } from 'lucide-react';


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
          <StatCard Icon={Footprints} valor={totalCalcados} label="Calçados Cadastrados" />
          <StatCard Icon={Archive} valor={totalEstoque} label="Posições de Estoque" />
          <StatCard Icon={RefreshCcw} valor={totalMovimentacoes} label="Movimentações" />
          <StatCard Icon={CircleAlert} valor={alertas.length} label="Alertas de Estoque" alerta />
        </div>


        {/* Card de Itens Abaixo do Estoque Mínimo */}
        <div className="card">
          <div className="card-title">
            <TrendingDown size={20} strokeWidth={2.5} />
            Itens Abaixo do Estoque Mínimo
          </div>
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : minimo.length > 0 ? (
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Calçado</th>
                    <th>Marca</th>
                    <th>Quantidade Atual</th>
                    <th>Estoque Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {minimo.map((m, i) => (
                    <tr key={i}>
                      <td>{m.modelo ?? '—'}</td>
                      <td>{m.marca ?? '—'}</td>
                      <td>{m.quantidadeAtual ?? '—'}</td>
                      <td>{m.quantidadeMinima ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="texto-vazio">Nenhum calçado abaixo do estoque mínimo.</p>
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  Icon: ElementType; // "ElementType" permite passar componentes como Footprints, Archive, etc.
  valor: number | null;
  label: string;
  alerta?: boolean;
}

function StatCard({ Icon, valor, label, alerta }: StatCardProps) {
  return (
    <div className={`card card-stat${alerta ? ' card-alerta' : ''}`}>
      <span className="stat-icon">
        <Icon size={24} strokeWidth={2} /> {/* O Lucide aceita essas props diretamente */}
      </span>
      <div>
        <div className="stat-valor">{valor ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}