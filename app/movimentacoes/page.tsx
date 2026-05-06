'use client';

// ============================================================
// MOVIMENTACOES/PAGE.TSX
// Equivalente a: movimentacoes.html + movimentacoes.js
// ============================================================

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { movimentacoesAPI } from '@/lib/api';
import type { Movimentacao } from '@/types';

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando]       = useState(true);
  const [erro, setErro]                   = useState('');

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  async function carregarMovimentacoes() {
    setCarregando(true);
    setErro('');
    try {
      let lista: Movimentacao[];
      try {
        lista = await movimentacoesAPI.historico();
      } catch {
        lista = await movimentacoesAPI.listar();
      }
      setMovimentacoes(Array.isArray(lista) ? lista : []);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Movimentações</h1>
        </div>

        <div className="card">
          <div className="card-title">🕐 Histórico de Movimentações</div>
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
                  <tr><th>ID</th><th>Tipo</th><th>Calçado</th><th>Quantidade</th><th>Data</th></tr>
                </thead>
                <tbody>
                  {movimentacoes.map((m) => {
                    const tipo = m.tipo || m.tipoMovimentacao || '—';
                    const isEntrada = tipo.toUpperCase().includes('ENTRADA');
                    const data = m.data || m.createdAt;
                    return (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>
                          <span className={`badge ${isEntrada ? 'badge-entrada' : 'badge-saida'}`}>
                            {tipo}
                          </span>
                        </td>
                        <td>{m.calcado?.nome || m.nomeProduto || m.nome || '—'}</td>
                        <td>{m.quantidade ?? m.saldo ?? '—'}</td>
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
