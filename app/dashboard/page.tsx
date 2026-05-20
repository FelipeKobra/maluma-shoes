'use client';

import { useState, useEffect } from 'react';
import { ElementType } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI } from '@/lib/api';
import type { Alerta, PosicaoEstoque } from '@/types';
import { Footprints, Archive, RefreshCcw, CircleAlert, TrendingDown } from 'lucide-react';


export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalCalcados: null as number | null,
    totalEstoque: null as number | null,
    totalMovimentacoes: null as number | null,
    alertas: [] as Alerta[],
    minimo: [] as PosicaoEstoque[],
    carregando: true,
  });

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [calcados, estoque, movs, alertasData, minimoData] = await Promise.all([
          calcadosAPI.listar().catch(() => []),
          estoqueAPI.listar().catch(() => []),
          movimentacoesAPI.listar().catch(() => []),
          alertasAPI.estoqueMinimo().catch(() => []),
          estoqueAPI.minimo().catch(() => []),
        ]);

        setDashboardData({
          totalCalcados: Array.isArray(calcados) ? calcados.length : 0,
          totalEstoque: Array.isArray(estoque) ? estoque.length : 0,
          totalMovimentacoes: Array.isArray(movs) ? movs.length : 0,
          alertas: Array.isArray(alertasData) ? alertasData : [],
          minimo: Array.isArray(minimoData) ? minimoData : [],
          carregando: false,
        });

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setDashboardData(prev => ({ ...prev, carregando: false }));
      }
    }

    carregarDashboard();
  }, []);

  const { totalCalcados, totalEstoque, totalMovimentacoes, alertas, minimo, carregando } = dashboardData;

  return (
    <div className="layout flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <main className="main flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="page-header mb-6">
          <h1 className="page-title text-2xl font-bold">Dashboard</h1>
        </div>

        <div className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard Icon={Footprints} valor={totalCalcados} label="Calçados Cadastrados" />
          <StatCard Icon={Archive} valor={totalEstoque} label="Posições de Estoque" />
          <StatCard Icon={RefreshCcw} valor={totalMovimentacoes} label="Movimentações" />
          <StatCard Icon={CircleAlert} valor={alertas.length} label="Alertas de Estoque" alerta />
        </div>

        <div className="card w-full">
          <div className="card-title flex items-center gap-2 mb-4 font-semibold text-lg">
            <TrendingDown size={20} strokeWidth={2.5} />
            Itens Abaixo do Estoque Mínimo
          </div>
          
          {carregando ? (
            <p className="loading-text p-4">Carregando...</p>
          ) : minimo.length > 0 ? (
            <div className="tabela-wrapper overflow-x-auto border rounded-lg">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase font-medium">
                    <th className="p-3">Calçado</th>
                    <th className="p-3">Marca</th>
                    <th className="p-3 text-center">Quantidade Atual</th>
                    <th className="p-3 text-center">Estoque Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {minimo.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">{m.modelo ?? '—'}</td>
                      <td className="p-3">{m.marca ?? '—'}</td>
                      <td className="p-3 text-center">{m.quantidade_atual ?? '—'}</td>
                      <td className="p-3 text-center">{m.quantidade_minimo ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="texto-vazio p-8 text-center text-gray-500">
              Nenhum calçado abaixo do estoque mínimo.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  Icon: ElementType;
  valor: number | null;
  label: string;
  alerta?: boolean;
}

function StatCard({ Icon, valor, label, alerta }: StatCardProps) {
  return (
    <div className={`card card-stat flex items-center p-4 gap-4 ${alerta ? 'card-alerta' : ''}`}>
      <span className="stat-icon p-3 rounded-full">
        <Icon size={24} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <div className="stat-valor text-xl font-bold">{valor ?? '—'}</div>
        <div className="stat-label text-sm text-gray-500 leading-tight">{label}</div>
      </div>
    </div>
  );
}