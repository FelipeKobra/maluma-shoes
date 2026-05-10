'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI, ordemMovimentacaoAPI } from '@/lib/api';

import {
  Archive,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  ClipboardCheck
} from 'lucide-react';
import type { PosicaoEstoque, TipoMovimento, MovimentoPayload, MovimentacaoResposta } from '@/types';

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<PosicaoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  
  // Estados para o novo Modal de Inventário
  const [modalInventarioAberto, setModalInventarioAberto] = useState(false);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<PosicaoEstoque | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    try {
      const [listaEstoque] = await Promise.all([
        estoqueAPI.listar(),
        estoqueAPI.minimo(),
      ]);
      setEstoque(Array.isArray(listaEstoque) ? listaEstoque : []);
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
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Archive size={20} strokeWidth={2.5} /> Posição de Estoque
            </div>
            <button 
              className="btn-primary" 
              onClick={() => setModalCriarAberto(true)}
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={16} /> Nova Posição
            </button>
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
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((i) => {
                    const qtdAtual = i.quantidade_atual ?? 0;
                    const min = i.quantidade_minimo ?? 0;
                    const max = i.quantidade_maximo ?? 0;
                    const baixo = qtdAtual < min;
                    const alto = qtdAtual > max;
                    
                    return (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.cod_localizacao ?? '—'}</td>
                        <td><strong>{qtdAtual}</strong></td>
                        <td>{min}</td>
                        <td>{i.ultimo_abastecimento ? new Date(i.ultimo_abastecimento).toLocaleDateString('pt-BR') : '—'}</td>
                        <td>
                          {baixo ? (
                            <span className="badge badge-alerta" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={14} /> Baixo
                            </span>
                          ) : alto ? (
                            <span className="badge badge-alerta" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={14} /> Alto
                            </span>  
                          ) : (
                            <span className="badge badge-entrada" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> OK
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn-secondary"
                            title="Realizar Inventário / Ajuste"
                            onClick={() => {
                              setPosicaoSelecionada(i);
                              setModalInventarioAberto(true);
                            }}
                            style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
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

      {/* Modal de Movimentação Padrão */}
      {modalAberto && (
        <ModalMovimento
          onFechar={() => setModalAberto(false)}
          onSalvar={() => { setModalAberto(false); carregarTudo(); }}
        />
      )}

      {/* Modal de Criação de Posição */}
      {modalCriarAberto && (
        <ModalCriarPosicao 
          onFechar={() => setModalCriarAberto(false)}
          onSalvar={() => { setModalCriarAberto(false); carregarTudo(); }}
        />
      )}

      {/* NOVO: Modal de Inventário / Ajuste */}
      {modalInventarioAberto && posicaoSelecionada && (
        <ModalInventario 
          posicao={posicaoSelecionada}
          onFechar={() => {
            setModalInventarioAberto(false);
            setPosicaoSelecionada(null);
          }}
          onSalvar={() => {
            setModalInventarioAberto(false);
            setPosicaoSelecionada(null);
            carregarTudo();
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE: ModalInventario (CORRIGIDO)
// ==========================================
function ModalInventario({ posicao, onFechar, onSalvar }: { posicao: PosicaoEstoque, onFechar: () => void, onSalvar: () => void }) {
  const [qtdFisica, setQtdFisica] = useState<string>(posicao.quantidade_atual?.toString() || '0');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSalvarAjuste() {
  const valorNumerico = Number(qtdFisica);

  if (isNaN(valorNumerico) || valorNumerico < 0) {
    setErro('A quantidade física deve ser um número maior ou igual a zero.');
    return;
  }

  setLoading(true);
  setErro('');

  try {
    // Agora utilizamos o padrão centralizado da sua API
    await estoqueAPI.realizarInventario({
      posicaoEstoqueId: posicao.id,
      quantidadeFisica: valorNumerico,
      responsavel: "Sistema / Admin" // Futuramente pode vir do authContext
    });

    // Emite uma notificação de sucesso (opcional, já que você usa o evento customizado no sistema)
    window.dispatchEvent(new CustomEvent('nova-notificacao', {
      detail: {
        id: Math.random().toString(36).substr(2, 9),
        mensagem: `Inventário realizado na posição ${posicao.cod_localizacao}`,
        data: new Date().toISOString(),
        tipo: 'SUCESSO'
      }
    }));

    onSalvar();
  } catch (err: any) {
    // O apiFetch já extrai a mensagem de erro do JSON do backend
    setErro(err.message || 'Falha ao processar inventário.');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>Inventário Físico</h2>
        </div>

        <div className="secao-modal">
          {erro && <div className="msg-erro" style={{ marginBottom: '16px' }}>{erro}</div>}
          
          <div className="subtitulo-modal">Informações do Sistema</div>
          
          <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <div className="campo" style={{ marginBottom: '12px' }}>
              <label>Localização</label>
              <input type="text" value={posicao.cod_localizacao || ''} disabled style={{ background: 'transparent' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="campo" style={{ marginBottom: 0 }}>
                <label>Qtd. no Sistema</label>
                <input type="text" value={posicao.quantidade_atual || 0} disabled style={{ background: 'transparent' }} />
              </div>
              <div className="campo" style={{ marginBottom: 0 }}>
                <label>Última Contagem</label>
                <input 
                  type="text" 
                  value={posicao.ultima_contagem ? new Date(posicao.ultima_contagem).toLocaleDateString('pt-BR') : 'Nenhuma'} 
                  disabled 
                  style={{ background: 'transparent' }} 
                />
              </div>
            </div>
          </div>

          <div className="subtitulo-modal">Ajuste de Saldo</div>

          <div className="campo">
            <label>Quantidade Física (Contada em mãos) *</label>
            <input 
              type="number" 
              min="0"
              value={qtdFisica} 
              onChange={(e) => setQtdFisica(e.target.value)}
              placeholder="Ex: 15"
              autoFocus
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
              * Ao salvar, o saldo será atualizado para o valor informado e uma movimentação de <strong>AJUSTE</strong> será registrada no histórico.
            </p>
          </div>

          <div className="modal-botoes" style={{ marginTop: '30px' }}>
            <button className="btn-secondary" onClick={onFechar} disabled={loading}>
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSalvarAjuste} 
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Salvar Ajuste'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: ModalCriarPosicao
// ==========================================
function ModalCriarPosicao({ onFechar, onSalvar }: { onFechar: () => void; onSalvar: () => void }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState({
    cod_localizacao: '',
    quantidade_atual: '',
    quantidade_minimo: '',
    quantidade_maximo: '100',
    para_mostruario: false
  });

  async function handleSalvar() {
    if (!formData.cod_localizacao) {
      setErro('O código de localização é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        cod_localizacao: formData.cod_localizacao,
        quantidade_atual: Number(formData.quantidade_atual) || 0,
        quantidade_minimo: Number(formData.quantidade_minimo) || 0,
        quantidade_maximo: Number(formData.quantidade_maximo) || 0,
        para_mostruario: formData.para_mostruario,
        ultima_contagem: new Date().toISOString()
      };
      await estoqueAPI.criar(payload);
      onSalvar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar posição.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box">
        <div className="modal-header" style={{ textAlign: 'center' }}>
          <h2>Nova Posição de Estoque</h2>
        </div>

        <div className="secao-modal">
          {erro && <div className="msg-erro" style={{ marginBottom: '16px' }}>{erro}</div>}
          
          <div className="campo">
            <label>Código de Localização *</label>
            <input 
              type="text" 
              value={formData.cod_localizacao} 
              onChange={(e) => setFormData({...formData, cod_localizacao: e.target.value})} 
              placeholder="Ex: A1-B2" 
            />
          </div>

          <div className="campo">
            <label>Quantidade Atual</label>
            <input 
              min="0"
              type="number" 
              value={formData.quantidade_atual} 
              onChange={(e) => setFormData({...formData, quantidade_atual: e.target.value})} 
            />
          </div>

          <div className="campo">
            <label>Quantidade Mínima</label>
            <input 
              min="1"
              type="number" 
              value={formData.quantidade_minimo} 
              onChange={(e) => setFormData({...formData, quantidade_minimo: e.target.value})} 
            />
          </div>

          <div className="campo">
            <label>Quantidade Máxima</label>
            <input 
              min="1"
              type="number" 
              value={formData.quantidade_maximo} 
              onChange={(e) => setFormData({...formData, quantidade_maximo: e.target.value})} 
            />
          </div>

          <div className="campo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <input 
              type="checkbox" 
              id="mostruario" 
              checked={formData.para_mostruario} 
              onChange={(e) => setFormData({...formData, para_mostruario: e.target.checked})} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
            />
            <label htmlFor="mostruario" style={{ marginBottom: 0, cursor: 'pointer' }}>
              Para Mostruário?
            </label>
          </div>

          <div className="modal-botoes" style={{ marginTop: '32px' }}>
            <button className="btn-secondary" onClick={onFechar}>
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSalvar} 
              disabled={loading}
              style={{ backgroundColor: '#db707a' }} 
            >
              {loading ? 'Salvando...' : 'Criar Posição'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: ModalMovimento
// ==========================================
function ModalMovimento({ onFechar, onSalvar }: { onFechar: () => void; onSalvar: () => void }) {
  const [opcoesCalcados, setOpcoesCalcados] = useState<{ id: number, modelo: string }[]>([]);
  const [opcoesPosicoes, setOpcoesPosicoes] = useState<{ id: number, cod_localizacao: string }[]>([]);
  const [tipo, setTipo] = useState<TipoMovimento>('ENTRADA');
  const [calcadoId, setCalcadoId] = useState('');
  const [posicaoEstoqueId, setPosicaoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isCriandoOrdem, setIsCriandoOrdem] = useState(false);
  const [buscaOrdem, setBuscaOrdem] = useState('');
  const [ordemData, setOrdemData] = useState({
    data_emissao: '', empresa: '', cnpj: '', numero_ordem: '', status: 'PROCESSADO', valor_total: ''
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function buscarOpcoes() {
      try {
        const [dataCalcados, dataPosicoes] = await Promise.all([
          calcadosAPI.listar(),
          estoqueAPI.listar()
        ]);
        setOpcoesCalcados(dataCalcados.map(c => ({ id: c.id, modelo: c.modelo ?? "Sem modelo" })));
        setOpcoesPosicoes(dataPosicoes.map(p => ({ id: p.id, cod_localizacao: p.cod_localizacao ?? "Sem local" })));
      } catch (err) { setErro("Erro ao carregar listas."); }
    }
    buscarOpcoes();
  }, []);

  const pesquisarOrdem = async () => {
    if (!buscaOrdem) return;
    setLoading(true);
    try {
      const data = await ordemMovimentacaoAPI.buscarPorNumero(buscaOrdem);
      setOrdemData({
        data_emissao: data.data_emissao ? data.data_emissao.slice(0, 16) : '',
        empresa: data.empresa || '',
        cnpj: data.cnpj || '',
        numero_ordem: data.numero_ordem || '',
        status: data.status || 'PROCESSADO',
        valor_total: data.valor_total || ''
      });
      setIsCriandoOrdem(false);
    } catch (err) { setErro("Ordem não encontrada."); }
    finally { setLoading(false); }
  };

  async function salvar() {
    if (!calcadoId || !posicaoEstoqueId || !quantidade || !ordemData.numero_ordem) {
      setErro('Preencha os campos obrigatórios.');
      return;
    }
    
    setLoading(true);
    setErro('');

    try {
      const payload = {
        calcadoId: Number(calcadoId),
        posicaoEstoqueId: Number(posicaoEstoqueId),
        quantidade: Number(quantidade),
        motivo: motivo || "",
        ordemMovimentacao: {
          ...ordemData,
          data_emissao: ordemData.data_emissao ? new Date(ordemData.data_emissao).toISOString() : new Date().toISOString(),
          tipo: tipo,
          valor_total: ordemData.valor_total ? Number(ordemData.valor_total).toFixed(2) : "0.00"
        }
      };

      const resposta = await estoqueAPI.mover(payload) as MovimentacaoResposta;

      const emitirNotificacao = (msg: string, isAlert: boolean = false) => {
        window.dispatchEvent(new CustomEvent('nova-notificacao', {
          detail: {
            id: Math.random().toString(36).substr(2, 9),
            mensagem: msg,
            data: new Date().toISOString(),
            tipo: isAlert ? 'ALERTA' : 'SUCESSO'
          }
        }));
      };

      emitirNotificacao(`Movimentacao ${resposta.movimentacao.tipo} realizada.`);
      if (resposta.alertaEstoqueMin) emitirNotificacao(`Estoque baixo em ${posicaoEstoqueId}`, true);
      
      onSalvar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao movimentar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box modal-largo">
        <div className="modal-header"><h2>Movimentar Estoque</h2></div>
        {erro && <div className="msg-erro" style={{ margin: '10px' }}>{erro}</div>}
        <div className="modal-content">
          <div className="secao-modal">
            <div className="subtitulo-modal">Dados do Item</div>
            <div className="campo">
              <label>Tipo *</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimento)}>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            <div className="campo">
              <label>Calçado *</label>
              <select value={calcadoId} onChange={(e) => setCalcadoId(e.target.value)}>
                <option value="">Selecione</option>
                {opcoesCalcados.map(c => <option key={c.id} value={c.id}>{c.modelo}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Posição *</label>
              <select value={posicaoEstoqueId} onChange={(e) => setPosicaoId(e.target.value)}>
                <option value="">Selecione</option>
                {opcoesPosicoes.map(p => <option key={p.id} value={p.id}>{p.cod_localizacao}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Quantidade *</label>
              <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </div>
            <div className="campo"><label>Motivo</label><input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
          </div>
          <div className="secao-modal direita">
            <div className="subtitulo-modal">Ordem <button className="btn-primary" onClick={() => setIsCriandoOrdem(true)}>+ Nova</button></div>
            <div className="campo" style={{ display: 'flex', gap: '5px' }}>
              <input type="text" placeholder="Nº Ordem" value={buscaOrdem} onChange={(e) => setBuscaOrdem(e.target.value)} />
              <button className="btn-secondary" onClick={pesquisarOrdem}><Search size={16}/></button>
            </div>
            <hr style={{ margin: '15px 0', opacity: 0.2 }} />
            <div className="campo"><label>Número</label><input disabled={!isCriandoOrdem} value={ordemData.numero_ordem} onChange={(e) => setOrdemData({...ordemData, numero_ordem: e.target.value})} /></div>
            <div className="campo"><label>Empresa</label><input disabled={!isCriandoOrdem} value={ordemData.empresa} onChange={(e) => setOrdemData({...ordemData, empresa: e.target.value})} /></div>
            <div className="campo"><label>CNPJ</label><input disabled={!isCriandoOrdem} value={ordemData.cnpj} onChange={(e) => setOrdemData({...ordemData, cnpj: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="campo"><label>Data</label><input type="datetime-local" disabled={!isCriandoOrdem} value={ordemData.data_emissao} onChange={(e) => setOrdemData({...ordemData, data_emissao: e.target.value})} /></div>
              <div className="campo"><label>Valor</label><input type="number" disabled={!isCriandoOrdem} value={ordemData.valor_total} onChange={(e) => setOrdemData({...ordemData, valor_total: e.target.value})} /></div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div className="modal-botoes">
            <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
            <button className="btn-primary" onClick={salvar} disabled={loading}>{loading ? 'Processando...' : 'Confirmar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}