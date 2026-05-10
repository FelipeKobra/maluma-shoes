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
  page: number; // Agora obrigatório para controle interno
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
    limit: 10 // Reduzi para 10 para a paginação ser mais visível
  });

  const inicializado = useRef(false);

  const carregarMovimentacoes = useCallback(async (filtrosAplicados: FiltrosHistorico) => {
    setErro('');
    setCarregando(true);

    try {
      const response = await movimentacoesAPI.historico(filtrosAplicados);
      
      let lista: Movimentacao[] = [];
      let total = 1;

      // Tratamento do retorno paginado ({ data: [], totalPages: X } ou similar)
      if (response && typeof response === 'object' && 'data' in response) {
        lista = (response as any).data || [];
        // Tenta pegar o total de páginas da API (ajuste o nome da chave conforme seu backend)
        total = (response as any).totalPages || (response as any).total_pages || 1;
      } else if (Array.isArray(response)) {
        lista = response;
      }

      setMovimentacoes(lista);
      setTotalPaginas(total);
    } catch (err: unknown) {
      setErro('Erro ao carregar movimentações.');
      setMovimentacoes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    if (!inicializado.current) {
      carregarMovimentacoes(filtros);
      inicializado.current = true;
    }
  }, [carregarMovimentacoes]);

  // Efeito para buscar sempre que a página mudar (navegação)
  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    const novosFiltros = { ...filtros, page: novaPagina };
    setFiltros(novosFiltros);
    carregarMovimentacoes(novosFiltros);
  };

  const handlePesquisar = () => {
    // Ao pesquisar manualmente, sempre resetamos para a página 1
    const novosFiltros = { ...filtros, page: 1 };
    setFiltros(novosFiltros);
    carregarMovimentacoes(novosFiltros);
  };

  const limparFiltros = () => {
    const defaultFiltros = { tipo: '', responsavel: '', dataInicio: '', dataFim: '', page: 1, limit: 10 };
    setFiltros(defaultFiltros);
    carregarMovimentacoes(defaultFiltros);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Movimentações</h1>
        </div>

        {/* --- SEÇÃO DE FILTROS --- */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-title" style={{ fontSize: '14px', marginBottom: '15px' }}>
            <Search size={18} /> Filtrar Resultados
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            <div className="campo">
              <label>Tipo</label>
              <select value={filtros.tipo} onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}>
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div className="campo">
              <label>Responsável</label>
              <input 
                type="text" 
                placeholder="Nome do usuário" 
                value={filtros.responsavel}
                onChange={(e) => setFiltros({...filtros, responsavel: e.target.value})}
              />
            </div>

            <div className="campo">
              <label>Data Início</label>
              <input type="date" value={filtros.dataInicio} onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})} />
            </div>

            <div className="campo">
              <label>Data Fim</label>
              <input type="date" value={filtros.dataFim} onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button className="btn-primary" onClick={handlePesquisar} style={{ flex: 1, height: '38px' }}>Pesquisar</button>
              <button className="btn-secondary" onClick={limparFiltros} style={{ height: '38px', padding: '0 12px' }}><Eraser size={18} /></button>
            </div>
          </div>
        </div>

        {/* --- TABELA E PAGINAÇÃO --- */}
        <div className="card">
          <div className="card-title">
            <History size={20} strokeWidth={2.5} /> Histórico de Movimentações
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
                      <th>Quantidade</th>
                      <th>Responsável</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoes.map((m) => {
                      const isEntrada = m.tipo?.toUpperCase().includes('ENTRADA');
                      return (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td>
                            <span className={`badge ${isEntrada ? 'badge-entrada' : 'badge-saida'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {isEntrada ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                              {m.tipo}
                            </span>
                          </td>
                          <td>{m.itensMovimentacao?.calcados?.modelo || '—'}</td>
                          <td>{m.itensMovimentacao?.quantidade ?? '—'}</td>
                          <td>{m.responsavel ?? '—'}</td>
                          <td>{m.data_hora ? new Date(m.data_hora).toLocaleDateString('pt-BR') : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CONTROLES DE PAGINAÇÃO */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '15px', 
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(0,0,0,0.05)'
              }}>
                <button 
                  className="btn-secondary" 
                  disabled={filtros.page === 1 || carregando}
                  onClick={() => mudarPagina(Number(filtros.page) - 1)}
                  style={{ padding: '5px 10px' }}
                >
                  <ChevronLeft size={18} />
                </button>
                
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Página {filtros.page} de {totalPaginas}
                </span>

                <button 
                  className="btn-secondary" 
                  disabled={filtros.page === totalPaginas || carregando}
                  onClick={() => mudarPagina(Number(filtros.page) + 1)}
                  style={{ padding: '5px 10px' }}
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