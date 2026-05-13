'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI } from '@/lib/api';
import {
  Archive,
  CheckCircle2,
  AlertCircle,
  Plus,
  ClipboardCheck,
  Loader2
} from 'lucide-react';
import type { 
  PosicaoEstoque, 
  TipoMovimento, 
  MovimentoPayload, 
  MovimentacaoResposta, 
  CriarPosicaoPayload,
  Calcado 
} from '@/types';

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<PosicaoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalInventarioAberto, setModalInventarioAberto] = useState(false);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<PosicaoEstoque | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    try {
      const listaEstoque = await estoqueAPI.listar();
      setEstoque(Array.isArray(listaEstoque) ? listaEstoque : []);
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="layout flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="main flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="page-title text-2xl font-bold">Estoque</h1>
          <button className="btn-primary w-full sm:w-auto" onClick={() => setModalAberto(true)}>
            + Movimentar Estoque
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="card-title flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <Archive size={20} strokeWidth={2.5} /> Posição de Estoque
            </div>
            <button 
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2" 
              onClick={() => setModalCriarAberto(true)}
            >
              <Plus size={16} /> Nova Posição
            </button>
          </div>

          {carregando ? (
            <div className="flex justify-center p-12 items-center gap-2">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : (
            <div className="tabela-wrapper overflow-x-auto w-full border rounded-lg">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Localização</th>
                    <th>Estoque Atual</th>
                    <th>Estoque Mínimo</th>
                    <th>Último Abastecimento</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((i) => {
                    const baixo = (i.quantidade_atual ?? 0) < (i.quantidade_minimo ?? 0);
                    return (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.cod_localizacao ?? '—'}</td>
                        <td><strong>{i.quantidade_atual}</strong></td>
                        <td>{i.quantidade_minimo}</td>
                        <td>{i.ultimo_abastecimento ? new Date(i.ultimo_abastecimento).toLocaleDateString('pt-BR') : '—'}</td>
                        <td>
                          {baixo ? (
                            <span className="badge badge-alerta flex items-center gap-1 w-fit"><AlertCircle size={14} /> Baixo</span>
                          ) : (
                            <span className="badge badge-entrada flex items-center gap-1 w-fit"><CheckCircle2 size={14} /> OK</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn-secondary flex items-center gap-1 mx-auto text-xs py-1 px-2"
                            onClick={() => { setPosicaoSelecionada(i); setModalInventarioAberto(true); }}
                          >
                            <ClipboardCheck size={16} /> Inventário
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: MOVIMENTAR */}
      {modalAberto && (
        <ModalMovimento 
          onFechar={() => setModalAberto(false)} 
          onSalvar={() => { setModalAberto(false); carregarTudo(); }} 
        />
      )}

      {/* MODAL: NOVA POSIÇÃO */}
      {modalCriarAberto && (
        <ModalCriarPosicao 
          onFechar={() => setModalCriarAberto(false)} 
          onSalvar={() => { setModalCriarAberto(false); carregarTudo(); }} 
        />
      )}

      {/* MODAL: INVENTÁRIO */}
      {modalInventarioAberto && posicaoSelecionada && (
        <ModalInventario 
          posicao={posicaoSelecionada} 
          onFechar={() => setModalInventarioAberto(false)} 
          onSalvar={() => { setModalInventarioAberto(false); carregarTudo(); }} 
        />
      )}
    </div>
  );
}

// ─── COMPONENTES INTERNOS ───────────────────────────────────────────────────

function ModalMovimento({ onFechar, onSalvar }: { onFechar: () => void; onSalvar: () => void }) {
  const [opcoesCalcados, setOpcoesCalcados] = useState<Calcado[]>([]);
  const [opcoesPosicoes, setOpcoesPosicoes] = useState<PosicaoEstoque[]>([]);
  const [form, setForm] = useState({ calcadoId: '', posicaoEstoqueId: '', quantidade: '', tipo: 'ENTRADA' as TipoMovimento, motivo: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [c, p] = await Promise.all([calcadosAPI.listar(), estoqueAPI.listar()]);
        setOpcoesCalcados(Array.isArray(c) ? c : []);
        setOpcoesPosicoes(Array.isArray(p) ? p : []);
      } catch (err) { console.error('Erro ao carregar opções:', err); }
    }
    carregar();
  }, []);

  async function confirmar() {
    if (!form.calcadoId || !form.posicaoEstoqueId || !form.quantidade) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const payload: MovimentoPayload = {
        calcadoId: Number(form.calcadoId),
        posicaoEstoqueId: Number(form.posicaoEstoqueId),
        quantidade: Number(form.quantidade),
        motivo: form.motivo || 'Movimentação via sistema',
        ordemMovimentacao: {
          tipo: form.tipo // Enviando apenas o tipo conforme sua interface
        }
      };

      const resposta: MovimentacaoResposta = await estoqueAPI.mover(payload);

      if (resposta.alertaEstoqueMin) {
        alert(`Atenção: Estoque mínimo atingido!`);
      }

      onSalvar();
    } catch (err: unknown) {
      alert(err || 'Erro ao processar movimentação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box bg-white w-full max-w-lg rounded-lg p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Movimentar Estoque</h2>
        <div className="space-y-4">
          <div className="campo">
            <label className="text-sm font-medium">Tipo *</label>
            <select className="w-full border rounded p-2" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as TipoMovimento})}>
              <option value="ENTRADA">Entrada (+)</option>
              <option value="SAIDA">Saída (-)</option>
            </select>
          </div>
          <div className="campo">
            <label className="text-sm font-medium">Calçado *</label>
            <select className="w-full border rounded p-2" value={form.calcadoId} onChange={e => setForm({...form, calcadoId: e.target.value})}>
              <option value="">Selecione...</option>
              {opcoesCalcados.map(c => <option key={c.id} value={c.id}>{c.modelo} - {c.marca}</option>)}
            </select>
          </div>
          <div className="campo">
            <label className="text-sm font-medium">Localização *</label>
            <select className="w-full border rounded p-2" value={form.posicaoEstoqueId} onChange={e => setForm({...form, posicaoEstoqueId: e.target.value})}>
              <option value="">Selecione...</option>
              {opcoesPosicoes.map(p => <option key={p.id} value={p.id}>{p.cod_localizacao} (Qtd: {p.quantidade_atual})</option>)}
            </select>
          </div>
          <div className="campo">
            <label className="text-sm font-medium">Quantidade *</label>
            <input className="w-full border rounded p-2" type="number" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
          </div>
          <div className="campo">
            <label className="text-sm font-medium">Motivo (Opcional)</label>
            <input className="w-full border rounded p-2" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="btn-primary" onClick={confirmar} disabled={loading}>{loading ? 'Processando...' : 'Confirmar'}</button>
        </div>
      </div>
    </div>
  );
}

function ModalCriarPosicao({ onFechar, onSalvar }: { onFechar: () => void; onSalvar: () => void }) {
  const [form, setForm] = useState({ cod: '', min: '5', max: '100', mostruario: false });
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    if (!form.cod) return alert('Localização obrigatória.');
    setLoading(true);
    try {
      const payload: CriarPosicaoPayload = {
        cod_localizacao: form.cod,
        quantidade_atual: 0,
        quantidade_minimo: Number(form.min),
        quantidade_maximo: Number(form.max),
        para_mostruario: form.mostruario,
        ultima_contagem: new Date().toISOString()
      };
      await estoqueAPI.criar(payload);
      onSalvar();
    } catch (err: unknown) { alert(err || 'Erro ao criar posição.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box bg-white w-full max-w-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Nova Posição</h2>
        <div className="space-y-4">
          <input className="w-full border rounded p-2" placeholder="Localização" value={form.cod} onChange={e => setForm({...form, cod: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full border rounded p-2" type="number" placeholder="Mínimo" value={form.min} onChange={e => setForm({...form, min: e.target.value})} />
            <input className="w-full border rounded p-2" type="number" placeholder="Máximo" value={form.max} onChange={e => setForm({...form, max: e.target.value})} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="btn-primary" onClick={confirmar} disabled={loading}>Criar</button>
        </div>
      </div>
    </div>
  );
}

function ModalInventario({ posicao, onFechar, onSalvar }: { posicao: PosicaoEstoque, onFechar: () => void, onSalvar: () => void }) {
  const [qtd, setQtd] = useState(posicao.quantidade_atual?.toString() || '0');
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    setLoading(true);
    try {
      await estoqueAPI.realizarInventario({
        posicaoEstoqueId: Number(posicao.id),
        quantidadeFisica: Number(qtd)
      });
      onSalvar();
    } catch (err) { alert('Erro ao realizar inventário.'); } 
    finally { setLoading(false); }
  }

  return (
    <div className="modal fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Inventário Físico</h2>
        <input className="w-full border rounded p-2 mb-4" type="number" value={qtd} onChange={e => setQtd(e.target.value)} />
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="btn-primary" onClick={confirmar} disabled={loading}>Salvar</button>
        </div>
      </div>
    </div>
  );
}