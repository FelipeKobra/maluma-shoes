'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI, ordemMovimentacaoAPI } from '@/lib/api';

import {
  Archive,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import type { PosicaoEstoque, TipoMovimento, MovimentoPayload } from '@/types';

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<PosicaoEstoque[]>([]);
  const [minimo, setMinimo] = useState<PosicaoEstoque[]>([]);
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

        <div className="card">
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
                    <th>Localização</th>
                    <th>Estoque Atual</th>
                    <th>Estoque Mínimo</th>
                    <th>Último Abastecimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((i) => {
                    const qtdAtual = i.quantidade_atual ?? 0;
                    const min = i.quantidade_minimo ?? 0;
                    const baixo = qtdAtual < min;
                    return (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.cod_localizacao ?? '—'}</td>
                        <td>{qtdAtual ?? '—'}</td>
                        <td>{min ?? '—'}</td>
                        <td>{i.ultimo_abastecimento ?? '—'}</td>
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
  // Estados para as opções do backend
  const [opcoesCalcados, setOpcoesCalcados] = useState<{ id: number, modelo: string }[]>([]);
  const [opcoesPosicoes, setOpcoesPosicoes] = useState<{ id: number, cod_localizacao: string }[]>([]);

  // Estados da Movimentação (Esquerda)
  const [tipo, setTipo] = useState<TipoMovimento>('ENTRADA');
  const [calcadoId, setCalcadoId] = useState('');
  const [posicaoEstoqueId, setPosicaoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');

  // Estados da Ordem (Direita)
  const [isCriandoOrdem, setIsCriandoOrdem] = useState(false);
  const [buscaOrdem, setBuscaOrdem] = useState('');
  const [ordemData, setOrdemData] = useState({
    data_emissao: '',
    empresa: '',
    cnpj: '',
    numero_ordem: '',
    status: 'PROCESSADO',
    valor_total: ''
  });

  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Busca dados iniciais para os selects
  useEffect(() => {
    async function buscarOpcoes() {
      try {
        const dataCalcados = await calcadosAPI.listar();
        const dataPosicoes = await estoqueAPI.listar();

        // Corrigindo o erro de 'string | undefined'
        const calcadosFormatados = dataCalcados.map(c => ({
          id: c.id,
          // O '??' garante que se for undefined, vira uma string, resolvendo o erro ts(2345)
          modelo: c.modelo ?? "Modelo não informado"
        }));

        const posicoesFormatadas = dataPosicoes.map(p => ({
          id: p.id,
          // O mesmo para a localização
          cod_localizacao: p.cod_localizacao ?? "Sem local"
        }));

        setOpcoesCalcados(calcadosFormatados);
        setOpcoesPosicoes(posicoesFormatadas);

      } catch (err) {
        console.error("Erro ao carregar opções:", err);
        setErro("Erro ao carregar listas de seleção.");
      }
    }

    buscarOpcoes();
  }, []);

  // FUNÇÃO ATUALIZADA: Pesquisa real no backend
  const pesquisarOrdem = async () => {
    if (!buscaOrdem) return;

    setErro('');
    setLoading(true);

    try {
      const data = await ordemMovimentacaoAPI.buscarPorNumero(buscaOrdem);

      // Seta os atributos nos campos
      setOrdemData({
        data_emissao: data.data_emissao ? data.data_emissao.slice(0, 16) : '',
        empresa: data.empresa || '',
        cnpj: data.cnpj || '',
        numero_ordem: data.numero_ordem || '',
        status: data.status || 'PROCESSADO',
        valor_total: data.valor_total || ''
      });

      setIsCriandoOrdem(false);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao buscar ordem de movimentação.');

      setOrdemData({
        data_emissao: '',
        empresa: '',
        cnpj: '',
        numero_ordem: '',
        status: 'PROCESSADO',
        valor_total: ''
      });

    } finally {
      setLoading(false);
    }
  };

  const iniciarCriacao = () => {
    setErro('');
    setOrdemData({
      data_emissao: new Date().toISOString().slice(0, 16),
      empresa: '',
      cnpj: '',
      numero_ordem: '',
      status: 'PROCESSADO',
      valor_total: ''
    });
    setBuscaOrdem('');
    setIsCriandoOrdem(true);
  };

  async function salvar() {
    setErro('');
    if (!calcadoId || !posicaoEstoqueId || !quantidade || !ordemData.numero_ordem) {
      setErro('Preencha os campos de estoque e selecione/crie uma Ordem.');
      return;
    }

    setLoading(true);
    const payload = {
      calcadoId: Number(calcadoId),
      posicaoEstoqueId: Number(posicaoEstoqueId),
      quantidade: Number(quantidade),
      motivo,
      ordemMovimentacao: {
        ...ordemData,
        tipo
      },
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
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box modal-largo">
        <div className="modal-header">
          <h2>Movimentar Estoque</h2>
        </div>

        {/* Mensagem de erro que aparece lá em cima */}
        {erro && <div className="msg-erro" style={{ margin: '15px 10px 10px 10px' }}>{erro}</div>}

        <div className="modal-content">
          <div className="secao-modal">
            <div className="subtitulo-modal">Dados do Item</div>

            <div className="campo">
              <label>Tipo de Movimentação *</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimento)}>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div className="campo">
              <label>Calçado *</label>
              <select value={calcadoId} onChange={(e) => setCalcadoId(e.target.value)}>
                <option value="">Selecione um calçado</option>
                {opcoesCalcados.map((c) => (
                  <option key={c.id} value={c.id}>{c.modelo}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Posição de Estoque *</label>
              <select value={posicaoEstoqueId} onChange={(e) => setPosicaoId(e.target.value)}>
                <option value="">Selecione uma posição no estoque</option>
                {opcoesPosicoes.map((p) => (
                  <option key={p.id} value={p.id}>{p.cod_localizacao}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Quantidade *</label>
              <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="Ex: 11" />
            </div>

            <div className="campo">
              <label>Motivo</label>
              <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Abastecimento Nike" />
            </div>
          </div>

          <div className="secao-modal direita">
            <div className="subtitulo-modal">
              Ordem de Movimentação
              <button className="btn-pequeno btn-primary" onClick={iniciarCriacao}>+ Criar Nova</button>
            </div>

            <div className="campo" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Pesquisar Ordem Existente</label>
                <input
                  type="text"
                  value={buscaOrdem}
                  onChange={(e) => setBuscaOrdem(e.target.value)}
                  placeholder="Nº da Ordem"
                  onKeyPress={(e) => e.key === 'Enter' && pesquisarOrdem()}
                />
              </div>
              <button
                className="btn-secondary"
                disabled={loading}
                style={{
                  padding: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={pesquisarOrdem}
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>

            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid var(--border)' }} />

            <div className="campo">
              <label>Número da Ordem</label>
              <input
                disabled={!isCriandoOrdem}
                value={ordemData.numero_ordem}
                onChange={(e) => setOrdemData({ ...ordemData, numero_ordem: e.target.value })}
              />
            </div>

            <div className="campo">
              <label>Empresa / Fornecedor</label>
              <input
                disabled={!isCriandoOrdem}
                value={ordemData.empresa}
                onChange={(e) => setOrdemData({ ...ordemData, empresa: e.target.value })}
              />
            </div>

            <div className="campo">
              <label>CNPJ</label>
              <input
                disabled={!isCriandoOrdem}
                value={ordemData.cnpj}
                onChange={(e) => setOrdemData({ ...ordemData, cnpj: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="campo">
                <label>Data Emissão</label>
                <input
                  type="datetime-local"
                  disabled={!isCriandoOrdem}
                  value={ordemData.data_emissao}
                  onChange={(e) => setOrdemData({ ...ordemData, data_emissao: e.target.value })}
                />
              </div>
              <div className="campo">
                <label>Valor Total</label>
                <input
                  type="number"
                  disabled={!isCriandoOrdem}
                  value={ordemData.valor_total}
                  onChange={(e) => setOrdemData({ ...ordemData, valor_total: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-botoes">
            <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
            <button className="btn-primary" onClick={salvar} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Movimentação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}