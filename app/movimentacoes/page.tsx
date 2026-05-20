'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  History,
  Search,
  Eraser,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download
} from 'lucide-react';
import { movimentacoesAPI, relatoriosAPI } from '@/lib/api';
import type { Movimentacao } from '@/types';

export interface FiltrosHistorico {
  tipo?: string;
  responsavel?: string;
  motivo?: string;
  dataInicio?: string;
  dataFim?: string;
  page: number;
  limit: number;
}

interface RespostaPaginada {
  data: Movimentacao[];
  meta?: {
    totalPages?: number | string;
    [key: string]: unknown;
  };
}

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [exportando, setExportando] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosHistorico>({
    tipo: '',
    responsavel: '',
    dataInicio: '',
    dataFim: '',
    page: 1,
    limit: 10
  });

  const inicializado = useRef(false);

  const possuiFiltrosAtivos = Boolean(
    filtros.tipo || filtros.responsavel || filtros.motivo || filtros.dataInicio || filtros.dataFim
  );

  const carregarDados = useCallback(async (filtrosParaUso: FiltrosHistorico) => {
    console.log('[MovimentacoesPage] Iniciando carregarDados() com os filtros:', filtrosParaUso);
    setErro('');
    setCarregando(true);

    try {
      const response = await movimentacoesAPI.historico(filtrosParaUso);

      if (response && typeof response === 'object' && 'data' in response) {
        const resCast = response as RespostaPaginada;
        console.log('[MovimentacoesPage] Dados carregados (Formato Paginado):', resCast);
        setMovimentacoes(resCast.data || []);
        setTotalPaginas(resCast.meta?.totalPages ? Number(resCast.meta.totalPages) : 1);
      } else if (Array.isArray(response)) {
        console.log('[MovimentacoesPage] Dados carregados (Formato Array simples):', response);
        setMovimentacoes(response as Movimentacao[]);
        setTotalPaginas(1);
      }
    } catch (err: unknown) {
      console.error('[MovimentacoesPage] Erro ao carregar dados do histórico:', err);
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!inicializado.current) {
      console.log('[MovimentacoesPage] Executando carga de inicialização do useEffect.');
      carregarDados(filtros);
      inicializado.current = true;
    }
  }, [carregarDados, filtros]);

  const handleMudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    console.log(`[MovimentacoesPage] handleMudarPagina() acionado. Nova página: ${novaPagina}`);
    const novosFiltros = { ...filtros, page: novaPagina };
    setFiltros(novosFiltros);
    carregarDados(novosFiltros);
  };

  const handlePesquisar = () => {
    console.log('[MovimentacoesPage] handlePesquisar() acionado. Resetando para página 1 com os filtros atuais:', filtros);
    const filtrosResetados = { ...filtros, page: 1 };
    setFiltros(filtrosResetados);
    carregarDados(filtrosResetados);
  };

  const handleLimpar = () => {
    console.log('[MovimentacoesPage] handleLimpar() acionado. Limpando filtros para o estado padrão.');
    const defaultFiltros = {
      tipo: '', responsavel: '', dataInicio: '', dataFim: '', page: 1, limit: 10
    };
    setFiltros(defaultFiltros);
    carregarDados(defaultFiltros);
  };

  const handleExportarCsv = async () => {
    if (!possuiFiltrosAtivos || exportando) return;
    console.log('[MovimentacoesPage] handleExportarCsv() iniciado. Preparando payload de exportação:', {
      tipo: filtros.tipo || undefined,
      responsavel: filtros.responsavel || undefined,
      motivo: filtros.motivo || undefined,
      dataInicio: filtros.dataInicio || undefined,
      dataFim: filtros.dataFim || undefined,
    });
    setExportando(true);
    try {
      await relatoriosAPI.baixar('movimentacao', {
        tipo: filtros.tipo || undefined,
        responsavel: filtros.responsavel || undefined,
        motivo: filtros.motivo || undefined,
        dataInicio: filtros.dataInicio || undefined,
        dataFim: filtros.dataFim || undefined,
      });
      console.log('[MovimentacoesPage] Download do relatório executado com sucesso.');
    } catch (err) {
      console.error('[MovimentacoesPage] Erro ao exportar relatório CSV:', err);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="layout flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="main flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="page-header mb-6">
          <h1 className="page-title text-2xl font-bold">Movimentações</h1>
        </div>

        <div className="card mb-6 p-4">
          <div className="card-title flex items-center gap-2 text-sm mb-4">
            <Search size={18} /> Filtrar Resultados
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            alignItems: 'end'
          }}>
            <div className="campo m-0">
              <label className="block text-sm mb-1">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="w-full border rounded p-2"
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
            </div>

            <div className="campo m-0">
              <label className="block text-sm mb-1">Responsável</label>
              <input
                type="text"
                placeholder="Nome do usuário"
                value={filtros.responsavel}
                onChange={(e) => setFiltros({ ...filtros, responsavel: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="campo m-0">
              <label className="block text-sm mb-1">Data Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="campo m-0">
              <label className="block text-sm mb-1">Data Fim</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex gap-2 h-[42px]">
              <button
                className="btn-primary flex-1 flex items-center justify-center gap-2 px-4"
                onClick={handlePesquisar}
              >
                Pesquisar
              </button>
              <button
                className="btn-secondary w-[42px] flex items-center justify-center p-0"
                onClick={handleLimpar}
                title="Limpar Filtros"
              >
                <Eraser size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-title flex items-center justify-between font-bold mb-4">
            <div className="flex items-center gap-2">
              <History size={20} strokeWidth={2.5} /> Histórico
            </div>
            <button
              className="btn-secondary p-2 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportarCsv}
              disabled={!possuiFiltrosAtivos || exportando}
              title={possuiFiltrosAtivos ? "Exportar CSV" : "Utilize os filtros acima para habilitar a exportação"}
              style={{ minHeight: '38px', padding: '0 12px' }}
            >
              {exportando ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              <span className="text-sm font-medium hidden sm:inline">Exportar CSV</span>
            </button>
          </div>

          {carregando ? (
            <div className="loading-text flex items-center justify-center p-8 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Carregando...</span>
            </div>
          ) : erro ? (
            <p className="msg-erro p-4 text-red-500">{erro}</p>
          ) : (
            <>
              <div className="tabela-wrapper overflow-x-auto w-full border rounded-lg">
                <table className="min-w-[800px] w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Calçado</th>
                      <th>Qtd</th>
                      <th>Responsável</th>
                      <th>Posição</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoes.map((m) => (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>
                          <span className={`badge ${m.tipo === 'ENTRADA' ? 'badge-entrada' : 'badge-saida'}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td>{m.itensMovimentacao?.calcados?.modelo || '—'}</td>
                        <td>{m.itensMovimentacao?.quantidade ?? '0'}</td>
                        <td>{m.responsavel ?? '—'}</td>
                        <td>{m.posicaoEstoque?.cod_localizacao ?? '—'}</td>
                        <td className="whitespace-nowrap">
                          {m.data_hora ? new Date(m.data_hora).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    className="btn-secondary p-2"
                    disabled={filtros.page <= 1 || carregando}
                    onClick={() => handleMudarPagina(filtros.page - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-sm">
                    Página <strong>{filtros.page}</strong> de <strong>{totalPaginas}</strong>
                  </span>

                  <button
                    className="btn-secondary p-2"
                    disabled={filtros.page >= totalPaginas || carregando}
                    onClick={() => handleMudarPagina(filtros.page + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}