'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI } from '@/lib/api';
import type { Calcado, Genero } from '@/types';
import { Pencil, Trash2, Loader2, AlertCircle, PackageSearch } from 'lucide-react';

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
    try {
      // Executa a deleção passando o id esperado
      await calcadosAPI.deletar(id);
      // Recarrega a listagem após a confirmação do sucesso
      await carregarCalcados();
    } catch (err: unknown) {
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
            /* Wrapper de tabela com scroll horizontal para mobile */
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

// ---- Modal Refatorado para Grid Responsivo ----
interface ModalCalcadoProps {
  editandoId: number | null;
  onFechar: () => void;
  onSalvar: () => void;
}

const FORM_VAZIO: Partial<Calcado> = {
  codigo_barras: '', modelo: '', marca: '', descricao: '', numeracao: undefined,
  cor_primaria: '', cor_secundaria: '', material: '', genero: 'MASCULINO' as Genero,
  categoria: '', preco_venda: undefined, peso: undefined, dimensao: '', status: 'ATIVO',
};

function ModalCalcado({ editandoId, onFechar, onSalvar }: ModalCalcadoProps) {
  const [form, setForm] = useState<Partial<Calcado>>(FORM_VAZIO);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editandoId) {
      calcadosAPI.buscarPorId(editandoId).then(setForm).catch(() => {
        setErro('Erro ao carregar dados.');
      });
    }
  }, [editandoId]);

  function setcampo<K extends keyof Calcado>(campo: K, valor: Calcado[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar() {
    setErro('');
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      );

      if (!payload.modelo || !payload.marca || !payload.preco_venda) {
        throw new Error('Modelo, Marca e Preço são obrigatórios.');
      }

      if (editandoId) {
        await calcadosAPI.atualizar(editandoId, payload as Partial<Calcado>);
      } else {
        await calcadosAPI.criar(payload as Partial<Calcado>);
      }
      onSalvar();
    } catch (err: unknown) {
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
              value={form.numeracao ?? ''} 
              onChange={(e) => setcampo('numeracao', e.target.value === '' ? undefined : Number(e.target.value))} 
            />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Cor Primária</label>
            <input className="w-full border rounded p-2" type="text" value={form.cor_primaria || ''} onChange={(e) => setcampo('cor_primaria', e.target.value)} />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Gênero</label>
            <select className="w-full border rounded p-2" value={form.genero || 'MASCULINO'} onChange={(e) => setcampo('genero', e.target.value as Calcado['genero'])}>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="UNISSEX">Unissex</option>
              <option value="INFANTIL">Infantil</option>
            </select>
          </div>
          <div className="campo"><label className="block text-sm font-medium">Preço de Venda (R$)</label>
            <input 
              className="w-full border rounded p-2" 
              type="number" 
              step="0.01" 
              value={form.preco_venda ?? ''} 
              onChange={(e) => setcampo('preco_venda', e.target.value === '' ? undefined : Number(e.target.value))} 
            />
          </div>
          <div className="campo"><label className="block text-sm font-medium">Status</label>
            <select className="w-full border rounded p-2" value={form.status || 'ATIVO'} onChange={(e) => setcampo('status', e.target.value as Calcado['status'])}>
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