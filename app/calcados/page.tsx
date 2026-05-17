'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI } from '@/lib/api';
import type { Calcado } from '@/types';
import { Pencil, Trash2, Loader2, AlertCircle, PackageSearch } from 'lucide-react';
import { Decimal } from '@prisma/client/runtime/client';

// Extensão estrita dos tipos aceitos pelo formulário baseado no payload do Swagger
type GeneroFormulario = 'Masculino' | 'Feminino' | 'Unissex' | 'Infantil';
type StatusFormulario = 'ATIVO' | 'INATIVO';

interface CalcadoFormState extends Omit<Partial<Calcado>, 'genero' | 'status'> {
  genero: GeneroFormulario;
  status: StatusFormulario;
  codigo_barras?: string;
  modelo?: string;
  marca?: string;
  descricao?: string;
  numeracao?: number;
  cor_primaria?: string;
  cor_secundaria?: string;
  material?: string;
  categoria?: string;
  preco_venda?: Decimal;
  peso?: number;
  dimensao?: string;
}

export default function CalcadosPage() {
  const [calcados, setCalcados] = useState<Calcado[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    carregarCalcados();
  }, []);

  async function carregarCalcados() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await calcadosAPI.listar();
      setCalcados(Array.isArray(lista) ? lista : []);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setCarregando(false);
    }
  }

  async function deletarCalcado(id: number) {
    if (!confirm('Tem certeza que deseja excluir este calçado?')) return;
    
    // LOG: Início da tentativa de exclusão
    console.log(`[Deletar Calçado] Tentando excluir calçado com ID: ${id}`);
    
    try {
      await calcadosAPI.deletar(id);
      
      // LOG: Sucesso na exclusão
      console.log(`[Deletar Calçado] Calçado com ID: ${id} deletado com sucesso.`);
      
      await carregarCalcados();
    } catch (err: unknown) {
      // LOG: Falha na exclusão
      console.error(`[Deletar Calçado] Erro ao tentar deletar o calçado com ID: ${id}. Detalhes:`, err);
      
      alert('Erro ao excluir: ' + (err instanceof Error ? err.message : 'Erro'));
    }
  }

  const calcadosFiltrados = calcados.filter((c) => {
    const f = filtro.toLowerCase();
    return (
      (c.modelo || '').toLowerCase().includes(f) ||
      (c.marca || '').toLowerCase().includes(f) ||
      (c.categoria || '').toLowerCase().includes(f) ||
      (c.codigo_barras || '').toLowerCase().includes(f)
    );
  });

  return (
    <div className="layout flex flex-col md:flex-row">
      <Sidebar />
      <main className="main flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        {/* Header Responsivo */}
        <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="page-title text-2xl font-bold">Calçados</h1>
          <button className="btn-primary w-full sm:w-auto" onClick={() => { setEditandoId(null); setModalAberto(true); }}>
            + Novo Calçado
          </button>
        </div>

        <div className="card mb-4">
          <div className="filtros-row w-full">
            <input
              type="text"
              className="input-busca w-full"
              placeholder="Buscar por nome, marca ou modelo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          {carregando ? (
            <div className="loading-text flex items-center justify-center p-8 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Carregando...</span>
            </div>
          ) : erro ? (
            <div className="msg-erro flex items-center gap-2 p-4 text-red-600">
              <AlertCircle size={18} /> {erro}
            </div>
          ) : calcadosFiltrados.length === 0 ? (
            <div className="texto-vazio flex flex-col items-center gap-2 p-8 text-gray-500">
              <PackageSearch size={40} /> 
              <span>Nenhum calçado encontrado.</span>
            </div>
          ) : (
            <div className="tabela-wrapper overflow-x-auto w-full">
              <table className="min-w-[800px] w-full border-collapse">
                <thead>
                  <tr>
                    <th>ID</th><th>Modelo</th><th>Marca</th><th>Numeração</th>
                    <th>Cor</th><th>Categoria</th><th>Preço Venda</th><th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {calcadosFiltrados.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.modelo || '—'}</td>
                      <td>{c.marca || '—'}</td>
                      <td>{c.numeracao || '—'}</td>
                      <td>{c.cor_primaria || '—'}{c.cor_secundaria ? ` / ${c.cor_secundaria}` : ''}</td>
                      <td>{c.categoria || '—'}</td>
                      <td>{c.preco_venda != null ? `R$ ${Number(c.preco_venda).toFixed(2)}` : '—'}</td>
                      <td>
                        <span className={`badge ${c.status === 'ATIVO' ? 'badge-entrada' : 'badge-saida'}`}>
                          {c.status || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="acoes flex gap-2">
                          <button
                            className="btn-edit flex items-center gap-1 px-2 py-1"
                            onClick={() => { setEditandoId(c.id); setModalAberto(true); }}
                          >
                            <Pencil size={14} />
                            <span className="hidden lg:inline">Editar</span>
                          </button>
                          <button
                            className="btn-danger flex items-center gap-1 px-2 py-1"
                            onClick={() => deletarCalcado(c.id)}
                          >
                            <Trash2 size={14} />
                            <span className="hidden lg:inline">Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modalAberto && (
        <ModalCalcado
          editandoId={editandoId}
          onFechar={() => setModalAberto(false)}
          onSalvar={() => { setModalAberto(false); carregarCalcados(); }}
        />
      )}
    </div>
  );
}

// ---- Modal com Tipagem Estrita e Mecanismo de Logs ----
interface ModalCalcadoProps {
  editandoId: number | null;
  onFechar: () => void;
  onSalvar: () => void;
}

const FORM_VAZIO: CalcadoFormState = {
  codigo_barras: '', modelo: '', marca: '', descricao: '', numeracao: 0,
  cor_primaria: '', cor_secundaria: '', material: '', genero: 'Masculino',
  categoria: '', preco_venda: undefined, peso: 0, dimensao: '', status: 'ATIVO',
};

function ModalCalcado({ editandoId, onFechar, onSalvar }: ModalCalcadoProps) {
  const [form, setForm] = useState<CalcadoFormState>(FORM_VAZIO);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editandoId) {
      // LOG: Buscando dados para edição
      console.log(`[Editar Calçado] Carregando dados do calçado ID: ${editandoId}`);
      
      calcadosAPI.buscarPorId(editandoId).then((dados) => {
        let generoFormatado: GeneroFormulario = 'Masculino';
        if (dados.genero) {
          const gen = dados.genero.toLowerCase();
          generoFormatado = (gen.charAt(0).toUpperCase() + gen.slice(1)) as GeneroFormulario;
        }

        setForm({
          ...dados,
          genero: generoFormatado,
          status: (dados.status as StatusFormulario) || 'ATIVO',
        });
        
        // LOG: Sucesso ao carregar os dados no formulário
        console.log(`[Editar Calçado] Dados do calçado ID: ${editandoId} carregados com sucesso:`, dados);
      }).catch((err) => {
        // LOG: Falha ao carregar os dados do ID informado
        console.error(`[Editar Calçado] Erro ao carregar os dados do calçado ID: ${editandoId}. Detalhes:`, err);
        setErro('Erro ao carregar dados.');
      });
    }
  }, [editandoId]);

  function setcampo<K extends keyof CalcadoFormState>(campo: K, valor: CalcadoFormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar() {
    setErro('');
    setLoading(true);
    
    const contextoLog = editandoId ? '[Editar Calçado - Salvar]' : '[Adicionar Calçado - Salvar]';
    
    try {
      // CORREÇÃO CRUCIAL: Remove do payload tudo o que for undefined, null OU string vazia ("")
      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      // LOG: Verifique no console do seu navegador se as chaves vazias sumiram do objeto!
      console.log(`${contextoLog} Gerando payload limpo para envio:`, payload);

      if (!payload.modelo || !payload.marca || !payload.preco_venda) {
        throw new Error('Modelo, Marca e Preço são obrigatórios.');
      }

      if (editandoId) {
        console.log(`${contextoLog} Enviando requisição PUT para ID: ${editandoId}`);
        await calcadosAPI.atualizar(editandoId, payload as Partial<Calcado>);
        console.log(`${contextoLog} Calçado ID: ${editandoId} updated com sucesso no backend.`);
      } else {
        console.log(`${contextoLog} Enviando requisição POST para criação.`);
        await calcadosAPI.criar(payload as Partial<Calcado>);
        console.log(`${contextoLog} Novo calçado adicionado com sucesso no backend.`);
      }
      
      onSalvar();
    } catch (err: unknown) {
      console.error(`${contextoLog} Falha na operação. Detalhes técnicos do erro:`, err);
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="modal-box bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">{editandoId ? 'Editar Calçado' : 'Novo Calçado'}</h2>
        {erro && <div className="msg-erro mb-4 p-2 bg-red-100 text-red-700 rounded">{erro}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="campo"><label className="block text-sm font-medium">Código de Barras</label>
            <input className="w-full border rounded p-2" type="text" value={form.codigo_barras || ''} onChange={(e) => setcampo('codigo_barras', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Modelo</label>
            <input className="w-full border rounded p-2" type="text" value={form.modelo || ''} onChange={(e) => setcampo('modelo', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Marca</label>
            <input className="w-full border rounded p-2" type="text" value={form.marca || ''} onChange={(e) => setcampo('marca', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Numeração</label>
            <input 
              className="w-full border rounded p-2" 
              type="number" 
              min="14"
              max="50"
              value={form.numeracao ?? ''} 
              onChange={(e) => setcampo('numeracao', e.target.value === '' ? undefined : Number(e.target.value))} 
            />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Cor Primária</label>
            <input className="w-full border rounded p-2" type="text" value={form.cor_primaria || ''} onChange={(e) => setcampo('cor_primaria', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Cor Secundária</label>
            <input className="w-full border rounded p-2" type="text" value={form.cor_secundaria || ''} onChange={(e) => setcampo('cor_secundaria', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Material</label>
            <input className="w-full border rounded p-2" type="text" value={form.material || ''} onChange={(e) => setcampo('material', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Categoria</label>
            <input className="w-full border rounded p-2" type="text" value={form.categoria || ''} onChange={(e) => setcampo('categoria', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Dimensão</label>
            <input className="w-full border rounded p-2" type="text" value={form.dimensao || ''} placeholder="Ex: 30x20x10" onChange={(e) => setcampo('dimensao', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Gênero</label>
            <select className="w-full border rounded p-2" value={form.genero} onChange={(e) => setcampo('genero', e.target.value as GeneroFormulario)}>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Unissex">Unissex</option>
              <option value="Infantil">Infantil</option>
            </select>
          </div>
         <div className="campo">
          <label className="block text-sm font-medium">Preço de Venda (R$)</label>
          <input 
            className="w-full border rounded p-2" 
            type="number" 
            step="0.01"
            min="0.00" 
            value={form.preco_venda instanceof Decimal ? form.preco_venda.toString() : (form.preco_venda ?? '')}
            onChange={(e) => {
              const valor = e.target.value;
              setcampo(
                'preco_venda', 
                valor === '' ? undefined : new Decimal(valor) as unknown as CalcadoFormState['preco_venda']
              );
            }} 
          />
        </div>
          <div className="campo"><label className="block text-sm font-medium">Status</label>
            <select className="w-full border rounded p-2" value={form.status} onChange={(e) => setcampo('status', e.target.value as StatusFormulario)}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div className="campo md:col-span-2"><label className="block text-sm font-medium">Descrição</label>
            <input className="w-full border rounded p-2" type="text" value={form.descricao || ''} onChange={(e) => setcampo('descricao', e.target.value)} />
          </div>
        </div>

        <div className="modal-botoes flex flex-col-reverse sm:flex-row justify-end gap-3 border-t pt-4">
          <button className="btn-secondary w-full sm:w-auto" onClick={onFechar}>Cancelar</button>
          <button className="btn-primary w-full sm:w-auto" onClick={salvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}