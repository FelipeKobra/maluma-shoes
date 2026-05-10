'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { History, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { movimentacoesAPI } from '@/lib/api';
import type { Movimentacao } from '@/types';

// Interface para os parâmetros de busca
export interface FiltrosHistorico {
  tipo?: string;
  responsavel?: string;
  motivo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number | string;
  limit?: number | string;
}

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando]       = useState(true); // Já inicia como true
  const [erro, setErro]                   = useState('');
  
  // useRef ajuda a garantir que a busca aconteça apenas uma vez se necessário
  const inicializado = useRef(false);

  const carregarMovimentacoes = useCallback(async () => {
  setErro('');
  setCarregando(true);

  const filtros: FiltrosHistorico = { page: 1, limit: 10 };

  try {
    let listaFinal: Movimentacao[] = [];

    try {
      // 1. A busca paginada provavelmente retorna { data: Movimentacao[], total: number }
      const response = await movimentacoesAPI.historico(filtros);

      console.log("HISTORICO: " + response);
      
      // CORREÇÃO: Verifique se o retorno é um array ou se está dentro de .data
      if (Array.isArray(response)) {
        listaFinal = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Se a API retornar o padrão paginado
        listaFinal = (response as any).data;
      } else {
        listaFinal = [];
      }
      
    } catch (err) {
      // 2. Fallback
      const fallback = await movimentacoesAPI.listar();
      listaFinal = Array.isArray(fallback) ? fallback : [];
    }

    setMovimentacoes(listaFinal);
  } catch (err: unknown) {
    setErro(err instanceof Error ? err.message : 'Erro ao carregar.');
    setMovimentacoes([]); // Garante que não fique com lixo que cause crash
  } finally {
    setCarregando(false);
  }
}, []);

  useEffect(() => {
    // Verificação simples para evitar chamadas duplas em StrictMode
    if (!inicializado.current) {
      carregarMovimentacoes();
      inicializado.current = true;
    }
  }, [carregarMovimentacoes]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Movimentações</h1>
        </div>

        <div className="card">
          <div className="card-title">
            <History size={20} strokeWidth={2.5} /> Histórico de Movimentações
          </div>
          
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : erro ? (
            <p className="msg-erro">{erro}</p>
          ) : movimentacoes.length === 0 ? (
            <p className="texto-vazio">Nenhuma movimentação encontrada.</p>
          ) : (
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Calçado</th>
                    <th>Quantidade</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((m) => {
                    const tipo = m.tipo || '—';
                    const isEntrada = tipo.toUpperCase().includes('ENTRADA');
                    const data = m.data_hora || '—';
                    
                    return (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>
                          <span 
                            className={`badge ${isEntrada ? 'badge-entrada' : 'badge-saida'}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {isEntrada ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                            {tipo}
                          </span>
                        </td>
                        <td>{m.itensMovimentacao?.calcados?.modelo ||  '—'}</td>
                        <td>{m.itensMovimentacao?.quantidade ?? '—'}</td>
                        <td>{data ? new Date(data).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}