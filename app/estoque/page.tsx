'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI, estoqueAPI, movimentacoesAPI, alertasAPI, ordemMovimentacaoAPI } from '@/lib/api';

import {
  Archive,
  CheckCircle2,
  AlertCircle,
  Plus,
  ClipboardCheck,
  Trash2
} from 'lucide-react';
import type { PosicaoEstoque, TipoMovimento, MovimentoPayload, MovimentacaoResposta, OrdemMovimentacao } from '@/types';

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
    console.log('[EstoquePage] Iniciando carregamento de dados do estoque...');
    setCarregando(true);
    try {
      const [listaEstoque] = await Promise.all([
        estoqueAPI.listar(),
        estoqueAPI.minimo(),
      ]);
      console.log('[EstoquePage] Dados carregados com sucesso:', listaEstoque);
      setEstoque(Array.isArray(listaEstoque) ? listaEstoque : []);
    } catch (err) {
      console.error('[EstoquePage] Erro ao carregar dados do estoque:', err);
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
// COMPONENTE: ModalInventario
// ==========================================
function ModalInventario({ posicao, onFechar, onSalvar }: { posicao: PosicaoEstoque, onFechar: () => void, onSalvar: () => void }) {
  const [qtdFisica, setQtdFisica] = useState<string>(posicao.quantidade_atual?.toString() || '0');
  const [motivo, setMotivo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSalvarAjuste() {
    const valorNumerico = Number(qtdFisica);

    if (isNaN(valorNumerico) || valorNumerico < 0) {
      setErro('A quantidade física deve ser um número maior ou igual a zero.');
      return;
    }

    console.log('[ModalInventario] Iniciando salvamento de ajuste...', { posicaoEstoqueId: posicao.id, quantidadeFisica: valorNumerico, motivo });
    setLoading(true);
    setErro('');

    try {
      await estoqueAPI.realizarInventario({
        posicaoEstoqueId: posicao.id,
        quantidadeFisica: valorNumerico,
        motivo: motivo || undefined
      });

      console.log('[ModalInventario] Ajuste de inventário realizado com sucesso.');

      window.dispatchEvent(new CustomEvent('nova-notificacao', {
        detail: {
          id: Math.random().toString(36).substr(2, 9),
          mensagem: `Inventário realizado na posição ${posicao.cod_localizacao}`,
          data: new Date().toISOString(),
          tipo: 'SUCESSO'
        }
      }));

      onSalvar();
    } catch (err: unknown) {
      console.error('[ModalInventario] Erro ao realizar ajuste de inventário:', err);
      setErro(err instanceof Error ? err.message : 'Erro interno no servidor (500). Verifique os campos.');
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

          <div className="campo" style={{ marginBottom: '16px' }}>
            <label>Quantidade Física (Contada em mãos) *</label>
            <input 
              type="number" 
              min="0"
              value={qtdFisica} 
              onChange={(e) => setQtdFisica(e.target.value)}
              placeholder="Ex: 15"
              autoFocus
            />
          </div>

          <div className="campo">
            <label>Motivo do Ajuste</label>
            <input 
              type="text" 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Quebra de lote, erro de entrada no sistema"
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
    
    const payload = {
      cod_localizacao: formData.cod_localizacao,
      quantidade_atual: Number(formData.quantidade_atual) || 0,
      quantidade_minimo: Number(formData.quantidade_minimo) || 0,
      quantidade_maximo: Number(formData.quantidade_maximo) || 0,
      para_mostruario: formData.para_mostruario,
      ultima_contagem: new Date().toISOString()
    };

    console.log('[ModalCriarPosicao] Iniciando criação de nova posição...', payload);
    setLoading(true);
    try {
      await estoqueAPI.criar(payload);
      console.log('[ModalCriarPosicao] Nova posição de estoque criada com sucesso.');
      onSalvar();
    } catch (err: unknown) {
      console.error('[ModalCriarPosicao] Erro ao criar nova posição:', err);
      setErro(err instanceof Error ? err.message : 'Erro interno no servidor (500). Verifique os campos.');
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
interface ItemIncluso {
  idInterno: string;
  calcadoId: number;
  calcadoModelo: string;
  posicaoEstoqueId: number;
  posicaoCodigo: string;
  quantidade: number;
}

function ModalMovimento({ onFechar, onSalvar }: { onFechar: () => void; onSalvar: () => void }) {
  const [opcoesCalcados, setOpcoesCalcados] = useState<{ id: number, modelo: string }[]>([]);
  const [opcoesPosicoes, setOpcoesPosicoes] = useState<{ id: number, cod_localizacao: string }[]>([]);
  
  const [tipo, setTipo] = useState<TipoMovimento>('ENTRADA');
  const [ordemData, setOrdemData] = useState({
    data_emissao: '', empresa: '', cnpj: '', numero_ordem: '', status: 'PROCESSADO', valor_total: ''
  });

  const [habilitarMotivo, setHabilitarMotivo] = useState(false);
  const [motivoGeral, setMotivoGeral] = useState('');

  const [calcadoId, setCalcadoId] = useState('');
  const [posicaoEstoqueId, setPosId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const [itensInclusos, setItensInclusos] = useState<ItemIncluso[]>([]);

  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function buscarOpcoes() {
      console.log('[ModalMovimento] Carregando opções de calçados e posições para o formulário...');
      try {
        const [dataCalcados, dataPosicoes] = await Promise.all([
          calcadosAPI.listar(),
          estoqueAPI.listar()
        ]);
        console.log('[ModalMovimento] Opções carregadas do banco com sucesso.');
        setOpcoesCalcados(dataCalcados.map(c => ({ id: c.id, modelo: c.modelo ?? "Sem modelo" })));
        setOpcoesPosicoes(dataPosicoes.map(p => ({ id: p.id, cod_localizacao: p.cod_localizacao ?? "Sem local" })));
      } catch (err: unknown) { 
        console.error('[ModalMovimento] Erro ao buscar opções do formulário:', err);
        setErro("Erro ao carregar listas."); 
      }
    }
    buscarOpcoes();
  }, []);

  const adicionarItemLista = () => {
    if (!calcadoId || !posicaoEstoqueId || !quantidade) {
      setErro('Preencha todos os campos do item antes de adicionar.');
      return;
    }

    const qtdNum = Number(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      setErro('A quantidade deve ser um número maior do que zero.');
      return;
    }

    const calcadoObj = opcoesCalcados.find(c => c.id === Number(calcadoId));
    const posicaoObj = opcoesPosicoes.find(p => p.id === Number(posicaoEstoqueId));

    const novoItem: ItemIncluso = {
      idInterno: Math.random().toString(36).substring(2, 9),
      calcadoId: Number(calcadoId),
      calcadoModelo: calcadoObj?.modelo || 'Desconhecido',
      posicaoEstoqueId: Number(posicaoEstoqueId),
      posicaoCodigo: posicaoObj?.cod_localizacao || 'Desconhecido',
      quantidade: qtdNum
    };

    console.log('[ModalMovimento] Adicionando item à lista temporária:', novoItem);
    setItensInclusos([...itensInclusos, novoItem]);
    setCalcadoId('');
    setPosId('');
    setQuantidade('');
    setErro('');
  };

  const removerItemLista = (idInterno: string) => {
    console.log(`[ModalMovimento] Removendo item da lista temporária. ID: ${idInterno}`);
    setItensInclusos(itensInclusos.filter(item => item.idInterno !== idInterno));
  };

  async function salvar() {
    if (itensInclusos.length === 0) {
      setErro('Adicione pelo menos um item à lista para movimentar.');
      return;
    }

    if (!ordemData.numero_ordem) {
      setErro('Preencha o número da Ordem de Movimentação.');
      return;
    }
    
    setLoading(true);
    setErro('');

    console.log(`[ModalMovimento] Iniciando o envio sequencial de ${itensInclusos.length} itens para o backend...`);

    let ordemCriadaRetornada: OrdemMovimentacao | null = null;

    try {
      for (let i = 0; i < itensInclusos.length; i++) {
        const item = itensInclusos[i];
        
        const ordemPayload: OrdemMovimentacao = {
          data_emissao: ordemData.data_emissao ? new Date(ordemData.data_emissao).toISOString() : new Date().toISOString(),
          empresa: ordemData.empresa,
          cnpj: ordemData.cnpj,
          status: "FINALIZADO",
          valor_total: ordemData.valor_total ? String(Number(ordemData.valor_total)) : "0.00",
          tipo: tipo,
          id: ordemCriadaRetornada ? Number(ordemCriadaRetornada.id) : undefined,
          numero_ordem: ordemCriadaRetornada ? undefined : ordemData.numero_ordem
        };

        const payload: MovimentoPayload = {
          calcadoId: item.calcadoId,
          posicaoEstoqueId: item.posicaoEstoqueId,
          quantidade: item.quantidade,
          motivo: habilitarMotivo ? motivoGeral : "",
          ordemMovimentacao: ordemPayload
        };

        console.log(`[ModalMovimento] Enviando item [${i + 1}/${itensInclusos.length}]`, payload);
        const resposta = await estoqueAPI.mover(payload) as MovimentacaoResposta;
        console.log(`[ModalMovimento] Resposta recebida para o item [${i + 1}/${itensInclusos.length}]:`, resposta);

        // Captura de forma segura a ordem se ela vier envelopada ou na raiz
        if (i === 0 && resposta) {
          const resObj = resposta as unknown as Record<string, unknown>;
          const resMov = resposta.movimentacao as unknown as Record<string, unknown> | undefined;
          
          if (resMov?.ordemMovimentacao) {
            ordemCriadaRetornada = resMov.ordemMovimentacao as OrdemMovimentacao;
          } else if (resObj?.ordemMovimentacao) {
            ordemCriadaRetornada = resObj.ordemMovimentacao as OrdemMovimentacao;
          }
          console.log('[ModalMovimento] Ordem salva para reaproveitamento:', ordemCriadaRetornada);
        }

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

        // CORREÇÃO: Fallback seguro caso o backend mude a estrutura do objeto de resposta entre as requisições
        const tipoDetectado = resposta?.movimentacao?.tipo || (resposta as unknown as { tipo?: string })?.tipo || tipo;
        emitirNotificacao(`Movimentação de ${tipoDetectado} do item ${item.calcadoModelo} realizada.`);
        
        if (resposta?.alertaEstoqueMin) {
          console.warn(`[ModalMovimento] Alerta disparado: Estoque baixo na posição ID ${item.posicaoEstoqueId}`);
          emitirNotificacao(`Estoque baixo em ${item.posicaoCodigo}`, true);
        }
      }

      console.log('[ModalMovimento] Todos os itens foram movimentados com sucesso!');
      onSalvar();
    } catch (err: unknown) {
      console.error('[ModalMovimento] Erro durante o lote de requisições de movimentação:', err);
      setErro(err instanceof Error ? err.message : 'Erro interno ao processar um dos itens. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box modal-largo" style={{ width: '960px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ marginBottom: '20px' }}><h2 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px' }}>MOVIMENTAR ESTOQUE</h2></div>
        {erro && <div className="msg-erro" style={{ margin: '0 0 16px 0', padding: '12px', fontSize: '14px' }}>{erro}</div>}
        
        <div className="modal-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '32px', minHeight: 0 }}>
          
          {/* COLUNA DA ESQUERDA: Dados estruturais da Ordem e o Motivo Geral */}
          <div className="secao-modal" style={{ borderRight: '1px solid rgba(0,0,0,0.08)', paddingRight: '32px' }}>
            <div className="subtitulo-modal" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 'bold', color: '#db707a' }}>DADOS DA ORDEM</div>
            
            <div className="campo" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Tipo de Movimentação *</label>
              <select style={{ padding: '8px', fontSize: '14px' }} value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimento)}>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            
            <div className="campo" style={{ marginBottom: '14px' }}><label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Número da Ordem *</label><input style={{ padding: '8px', fontSize: '14px' }} value={ordemData.numero_ordem} onChange={(e) => setOrdemData({...ordemData, numero_ordem: e.target.value})} placeholder="Ex: NF-1234" /></div>
            <div className="campo" style={{ marginBottom: '14px' }}><label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Empresa / Fornecedor</label><input style={{ padding: '8px', fontSize: '14px' }} value={ordemData.empresa} onChange={(e) => setOrdemData({...ordemData, empresa: e.target.value})} placeholder="Razão Social" /></div>
            <div className="campo" style={{ marginBottom: '14px' }}><label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>CNPJ</label><input style={{ padding: '8px', fontSize: '14px' }} value={ordemData.cnpj} onChange={(e) => setOrdemData({...ordemData, cnpj: e.target.value})} placeholder="00.000.000/0001-00" /></div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="campo" style={{ marginBottom: 0 }}><label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Data Emissão</label><input type="datetime-local" style={{ padding: '8px', fontSize: '14px' }} value={ordemData.data_emissao} onChange={(e) => setOrdemData({...ordemData, data_emissao: e.target.value})} /></div>
              <div className="campo" style={{ marginBottom: 0 }}><label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Valor Total</label><input type="number" style={{ padding: '8px', fontSize: '14px' }} value={ordemData.valor_total} onChange={(e) => setOrdemData({...ordemData, valor_total: e.target.value})} placeholder="0,00" /></div>
            </div>

            {/* Inclusão do Trigger e do Campo de Motivo */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="checkbox" 
                  id="chk-motivo" 
                  checked={habilitarMotivo}
                  onChange={(e) => {
                    setHabilitarMotivo(e.target.checked);
                    if(!e.target.checked) setMotivoGeral('');
                  }}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="chk-motivo" style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: 0, cursor: 'pointer' }}>
                  Informar motivo para esta movimentação?
                </label>
              </div>
              <div className="campo" style={{ marginBottom: 0 }}>
                <input 
                  type="text" 
                  disabled={!habilitarMotivo}
                  value={motivoGeral}
                  onChange={(e) => setMotivoGeral(e.target.value)}
                  placeholder={habilitarMotivo ? "Ex: Devolução de cliente, acerto cadastral..." : "Ative a opção acima para digitar"}
                  style={{ padding: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: Adição de Itens (Superior) e Lista com Scroll Local Expandido (Inferior) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0 }}>
            
            {/* PARTE SUPERIOR: Inclusão rápida de novos itens */}
            <div className="secao-modal-superior" style={{ background: 'rgba(0,0,0,0.01)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="subtitulo-modal" style={{ color: '#db707a', marginBottom: '12px', fontSize: '15px', fontWeight: 'bold' }}>DADOS DO ITEM</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="campo" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Calçado *</label>
                  <select style={{ padding: '8px', fontSize: '14px' }} value={calcadoId} onChange={(e) => setCalcadoId(e.target.value)}>
                    <option value="">Selecione</option>
                    {opcoesCalcados.map(c => <option key={c.id} value={c.id}>{c.modelo}</option>)}
                  </select>
                </div>

                <div className="campo" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Posição *</label>
                  <select style={{ padding: '8px', fontSize: '14px' }} value={posicaoEstoqueId} onChange={(e) => setPosId(e.target.value)}>
                    <option value="">Selecione</option>
                    {opcoesPosicoes.map(p => <option key={p.id} value={p.id}>{p.cod_localizacao}</option>)}
                  </select>
                </div>
              </div>

              <div className="campo" style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Quantidade *</label>
                  <input type="number" min="1" style={{ padding: '8px', fontSize: '14px' }} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="Ex: 10" />
                </div>
                <button type="button" className="btn-primary" style={{ height: '39px', padding: '0 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#db707a' }} onClick={adicionarItemLista}>
                  <Plus size={16} /> Incluir
                </button>
              </div>
            </div>

            {/* PARTE INFERIOR: Lista com Scrollbar Isolada */}
            <div className="secao-modal-inferior" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="subtitulo-modal" style={{ marginBottom: '10px', fontSize: '15px', fontWeight: 'bold', color: '#db707a' }}>ITENS ADICIONADOS ({itensInclusos.length})</div>
              
              <div style={{ height: '280px', overflowY: 'auto', background: '#fff', border: '1px dashed #ddd', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {itensInclusos.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                    Nenhum item adicionado à lista.
                  </div>
                ) : (
                  itensInclusos.map((item) => (
                    <div 
                      key={item.idInterno} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfdfd', border: '1px solid #e9e9e9', padding: '12px 16px', borderRadius: '4px' }}
                    >
                      <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        <div><strong>Calçado:</strong> {item.calcadoModelo}</div>
                        <div style={{ color: '#555' }}>
                          <span style={{ marginRight: '20px' }}><strong>Posição:</strong> {item.posicaoCodigo}</span>
                          <span><strong>Qtd:</strong> {item.quantidade}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removerItemLista(item.idInterno)} 
                        style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '4px' }}
                        title="Remover Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
          <div className="modal-botoes" style={{ justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={onFechar} disabled={loading}>Cancelar</button>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#db707a' }} onClick={salvar} disabled={loading || itensInclusos.length === 0}>
              {loading ? 'Processando...' : `Confirmar Lote (${itensInclusos.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}