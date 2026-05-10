'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Eraser,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { movimentacoesAPI } from '@/lib/api';
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

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [filtros, setFiltros] = useState<FiltrosHistorico>({
    tipo: '',
    responsavel: '',
    dataInicio: '',
    dataFim: '',
    page: 1,
    limit: 10
  });

  const inicializado = useRef(false);

  // Função de carregamento unificada
  const carregarDados = useCallback(async (filtrosParaUso: FiltrosHistorico) => {
    setErro('');
    setCarregando(true);

    try {
      const response = await movimentacoesAPI.historico(filtrosParaUso);

      // Validação rigorosa do seu JSON (data + meta)
      if (response && typeof response === 'object' && 'data' in response) {
        const resCast = response as any;
        setMovimentacoes(resCast.data || []);

        // Acessando o meta.totalPages do seu JSON
        if (resCast.meta && resCast.meta.totalPages) {
          setTotalPaginas(Number(resCast.meta.totalPages));
        } else {
          setTotalPaginas(1);
        }
      } else if (Array.isArray(response)) {
        setMovimentacoes(response);
        setTotalPaginas(1);
      }
    } catch (err: unknown) {
      setErro('Erro ao conectar com o servidor.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    if (!inicializado.current) {
      carregarDados(filtros);
      inicializado.current = true;
    }
  }, [carregarDados, filtros]);

  // Handlers de interação
  const handleMudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;

    // IMPORTANTE: Atualizamos o objeto local para disparar a busca 
    // sem depender da velocidade do setState
    const novosFiltros = { ...filtros, page: novaPagina };
    setFiltros(novosFiltros);
    carregarDados(novosFiltros);
  };

  const handlePesquisar = () => {
    const filtrosResetados = { ...filtros, page: 1 };
    setFiltros(filtrosResetados);
    carregarDados(filtrosResetados);
  };

  const handleLimpar = () => {
    const defaultFiltros = {
      tipo: '', responsavel: '', dataInicio: '', dataFim: '', page: 1, limit: 10
    };
    setFiltros(defaultFiltros);
    carregarDados(defaultFiltros);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Movimentações</h1>
        </div>

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-title" style={{ fontSize: '14px', marginBottom: '15px' }}>
            <Search size={18} /> Filtrar Resultados
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1.2fr', // Ajustado para distribuir melhor o espaço
            gap: '15px',
            alignItems: 'end' // Alinha todos os itens da linha pela base (importante para os inputs)
          }}>
            <div className="campo" style={{ marginBottom: 0 }}>
              <label>Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
            </div>

            <div className="campo" style={{ marginBottom: 0 }}>
              <label>Responsável</label>
              <input
                type="text"
                placeholder="Nome do usuário"
                value={filtros.responsavel}
                onChange={(e) => setFiltros({ ...filtros, responsavel: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="campo" style={{ marginBottom: 0 }}>
              <label>Data Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="campo" style={{ marginBottom: 0 }}>
              <label>Data Fim</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            {/* Container de Botões alinhado com a altura dos inputs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              height: '38px', // Mesma altura padrão dos seus inputs/selects
              alignItems: 'stretch'
            }}>
              <button
                className="btn-primary"
                onClick={handlePesquisar}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px'
                }}
              >
                Pesquisar
              </button>
              <button
                className="btn-secondary"
                onClick={handleLimpar}
                title="Limpar Filtros"
                style={{
                  width: '42px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Eraser size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card">
          <div className="card-title">
            <History size={20} strokeWidth={2.5} /> Histórico
          </div>

          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : erro ? (
            <p className="msg-erro">{erro}</p>
          ) : (
            <>
              <div className="tabela-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Calçado</th>
                      <th>Qtd</th>
                      <th>Responsável</th>
                      <th>Posição-Estoque</th>
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
                        <td>{m.responsavel  ?? '—'}</td>
                        <td>{m.posicaoEstoque?.cod_localizacao ?? '—'}</td>
                        <td>{m.data_hora ? new Date(m.data_hora).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '15px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee'
              }}>
                <button
                  className="btn-secondary"
                  disabled={filtros.page <= 1 || carregando}
                  onClick={() => handleMudarPagina(filtros.page - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                <span style={{ fontSize: '14px' }}>
                  Página <strong>{filtros.page}</strong> de <strong>{totalPaginas}</strong>
                </span>

                <button
                  className="btn-secondary"
                  disabled={filtros.page >= totalPaginas || carregando}
                  onClick={() => handleMudarPagina(filtros.page + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}