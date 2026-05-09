'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { estoqueAPI } from '@/lib/api';
// Importação dos ícones necessários
import { 
  Archive, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { PosicaoEstoque, TipoMovimento, MovimentoPayload } from '@/types';

export default function EstoquePage() {
  const [estoque, setEstoque]   = useState<PosicaoEstoque[]>([]);
  const [minimo, setMinimo]     = useState<PosicaoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    try {
      const [listaEstoque, listaMinimo] = await Promise.all([
        estoqueAPI.listar(),
        estoqueAPI.minimo(),
      ]);
      setEstoque(Array.isArray(listaEstoque) ? listaEstoque : []);
      setMinimo(Array.isArray(listaMinimo) ? listaMinimo : []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Estoque</h1>
          <button className="btn-primary" onClick={() => setModalAberto(true)}>
            + Movimentar Estoque
          </button>
        </div>

        {/* Tabela posição de estoque */}
        <div className="card">
          {/* Substituído 📦 por Archive */}
          <div className="card-title">
            <Archive size={20} strokeWidth={2.5} /> Posição de Estoque
          </div>
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : estoque.length === 0 ? (
            <p className="texto-vazio">Nenhuma posição de estoque encontrada.</p>
          ) : (
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Calçado ID</th>
                    <th>Localização</th>
                    <th>Saldo</th>
                    <th>Estoque Mínimo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((i) => {
                    const saldo = i.saldo ?? i.quantidade ?? 0;
                    const min   = i.estoqueMinimo ?? i.minimo ?? 0;
                    const baixo = saldo < min;
                    return (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.calcadosId ?? i.calcadoId ?? '—'}</td>
                        <td>{i.localizacao ?? i.posicao ?? '—'}</td>
                        <td>{saldo}</td>
                        <td>{min}</td>
                        <td>
                          {baixo ? (
                            <span className="badge badge-alerta" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={14} /> Baixo
                            </span>
                          ) : (
                            <span className="badge badge-entrada" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tabela estoque mínimo */}
        <div className="card">
          {/* Substituído ⚠️ por AlertTriangle */}
          <div className="card-title">
            <AlertTriangle size={20} strokeWidth={2.5} /> Itens com Estoque Baixo
          </div>
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : minimo.length === 0 ? (
            <p className="texto-vazio" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" /> Nenhum item abaixo do mínimo.
            </p>
          ) : (
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Calçado ID</th>
                    <th>Saldo</th>
                    <th>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {minimo.map((i) => (
                    <tr key={i.id}>
                      <td>{i.id}</td>
                      <td>{i.calcadosId ?? i.calcadoId ?? '—'}</td>
                      <td>{i.saldo ?? i.quantidade ?? '—'}</td>
                      <td>{i.estoqueMinimo ?? i.minimo ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modalAberto && (
        <ModalMovimento
          onFechar={() => setModalAberto(false)}
          onSalvar={() => { setModalAberto(false); carregarTudo(); }}
        />
      )}
    </div>
  );
}

// ---- Modal de Movimentação ----
interface ModalMovimentoProps {
  onFechar: () => void;
  onSalvar: () => void;
}

function ModalMovimento({ onFechar, onSalvar }: ModalMovimentoProps) {
  const [tipo, setTipo]                   = useState<TipoMovimento>('ENTRADA');
  const [calcadoId, setCalcadoId]         = useState('');
  const [posicaoEstoqueId, setPosicaoId]  = useState('');
  const [quantidade, setQuantidade]       = useState('');
  const [motivo, setMotivo]               = useState('');
  const [erro, setErro]                   = useState('');
  const [loading, setLoading]             = useState(false);

  async function salvar() {
    setErro('');
    if (!calcadoId || !posicaoEstoqueId || !quantidade) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    const payload: MovimentoPayload = {
      calcadoId: Number(calcadoId),
      posicaoEstoqueId: Number(posicaoEstoqueId),
      quantidade: Number(quantidade),
      motivo,
      ordemMovimentacao: { tipo },
    };
    try {
      await estoqueAPI.mover(payload);
      onSalvar();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao movimentar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="modal-box">
        <h2>Movimentar Estoque</h2>
        {erro && <div className="msg-erro">{erro}</div>}
        <div className="campo"><label>Tipo *</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimento)}>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>
        <div className="campo"><label>ID do Calçado *</label>
          <input type="number" value={calcadoId} onChange={(e) => setCalcadoId(e.target.value)} placeholder="Ex: 1" />
        </div>
        <div className="campo"><label>ID da Posição de Estoque *</label>
          <input type="number" value={posicaoEstoqueId} onChange={(e) => setPosicaoId(e.target.value)} placeholder="Ex: 1" />
        </div>
        <div className="campo"><label>Quantidade *</label>
          <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="Ex: 10" />
        </div>
        <div className="campo"><label>Motivo</label>
          <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Compra de fornecedor" />
        </div>
        <div className="modal-botoes">
          <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="btn-primary" onClick={salvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
