'use client';

// ============================================================
// CALCADOS/PAGE.TSX
//
// Equivalente a: calcados.html + calcados.js
//
// Conceito novo: Componentes separados dentro do arquivo
//   ModalCalcado é um componente filho que recebe props.
//   Isso substitui a manipulação direta do DOM (document.getElementById).
// ============================================================

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { calcadosAPI } from '@/lib/api';
import type { Calcado } from '@/types';

export default function CalcadosPage() {
  const [calcados, setCalcados]         = useState<Calcado[]>([]);
  const [filtro, setFiltro]             = useState('');
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]                 = useState('');
  const [modalAberto, setModalAberto]   = useState(false);
  // null = novo, number = editando
  const [editandoId, setEditandoId]     = useState<number | null>(null);

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
      await calcadosAPI.deletar(id);
      carregarCalcados();
    } catch (err: unknown) {
      alert('Erro ao excluir: ' + (err instanceof Error ? err.message : 'Erro'));
    }
  }

  // Filtragem feita no front — sem chamada extra ao backend
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
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Calçados</h1>
          <button className="btn-primary" onClick={() => { setEditandoId(null); setModalAberto(true); }}>
            + Novo Calçado
          </button>
        </div>

        <div className="card">
          <div className="filtros-row">
            <input
              type="text"
              className="input-busca"
              placeholder="Buscar por nome, marca ou modelo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : erro ? (
            <p className="msg-erro">{erro}</p>
          ) : calcadosFiltrados.length === 0 ? (
            <p className="texto-vazio">Nenhum calçado encontrado.</p>
          ) : (
            <div className="tabela-wrapper">
              <table>
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
                        <div className="acoes">
                          <button className="btn-edit" onClick={() => { setEditandoId(c.id); setModalAberto(true); }}>
                            ✏️ Editar
                          </button>
                          <button className="btn-danger" onClick={() => deletarCalcado(c.id)}>
                            🗑️ Excluir
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

      {/* Renderização condicional do modal */}
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

// ---- Modal como componente separado ----
interface ModalCalcadoProps {
  editandoId: number | null;
  onFechar: () => void;
  onSalvar: () => void;
}

// Estado inicial em branco para o formulário
const FORM_VAZIO: Partial<Calcado> = {
  codigo_barras: '', modelo: '', marca: '', descricao: '',
  numeracao: undefined, cor_primaria: '', cor_secundaria: '',
  material: '', genero: 'MASCULINO', categoria: '',
  preco_venda: undefined, peso: undefined, dimensao: '', status: 'ATIVO',
};

function ModalCalcado({ editandoId, onFechar, onSalvar }: ModalCalcadoProps) {
  const [form, setForm]     = useState<Partial<Calcado>>(FORM_VAZIO);
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  // Se estiver editando, busca os dados do calçado
  useEffect(() => {
    if (editandoId) {
      calcadosAPI.buscarPorId(editandoId).then(setForm).catch(() => {
        setErro('Erro ao carregar dados.');
      });
    }
  }, [editandoId]);

  // Função genérica para atualizar qualquer campo do form
  // keyof Calcado garante que só campos existentes são aceitos
  function setcampo<K extends keyof Calcado>(campo: K, valor: Calcado[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar() {
    setErro('');
    setLoading(true);
    try {
      if (editandoId) {
        await calcadosAPI.atualizar(editandoId, form);
      } else {
        await calcadosAPI.criar(form);
      }
      onSalvar();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    // Clique no fundo escuro fecha o modal
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="modal-box">
        <h2>{editandoId ? 'Editar Calçado' : 'Novo Calçado'}</h2>
        {erro && <div className="msg-erro">{erro}</div>}

        {/* Campos do formulário — value e onChange controlam o estado */}
        <div className="campo"><label>Código de Barras</label>
          <input type="text" value={form.codigo_barras || ''} onChange={(e) => setcampo('codigo_barras', e.target.value)} placeholder="Ex: 7891234567890" />
        </div>
        <div className="campo"><label>Modelo</label>
          <input type="text" value={form.modelo || ''} onChange={(e) => setcampo('modelo', e.target.value)} placeholder="Ex: Air Max" />
        </div>
        <div className="campo"><label>Marca</label>
          <input type="text" value={form.marca || ''} onChange={(e) => setcampo('marca', e.target.value)} placeholder="Ex: Nike" />
        </div>
        <div className="campo"><label>Descrição</label>
          <input type="text" value={form.descricao || ''} onChange={(e) => setcampo('descricao', e.target.value)} placeholder="Ex: Tênis esportivo leve" />
        </div>
        <div className="campo"><label>Numeração</label>
          <input type="number" value={form.numeracao ?? ''} onChange={(e) => setcampo('numeracao', Number(e.target.value))} placeholder="Ex: 42" />
        </div>
        <div className="campo"><label>Cor Primária</label>
          <input type="text" value={form.cor_primaria || ''} onChange={(e) => setcampo('cor_primaria', e.target.value)} placeholder="Ex: Preto" />
        </div>
        <div className="campo"><label>Cor Secundária</label>
          <input type="text" value={form.cor_secundaria || ''} onChange={(e) => setcampo('cor_secundaria', e.target.value)} placeholder="Ex: Branco" />
        </div>
        <div className="campo"><label>Material</label>
          <input type="text" value={form.material || ''} onChange={(e) => setcampo('material', e.target.value)} placeholder="Ex: Couro" />
        </div>
        <div className="campo"><label>Gênero</label>
          <select value={form.genero || 'MASCULINO'} onChange={(e) => setcampo('genero', e.target.value as Calcado['genero'])}>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="UNISSEX">Unissex</option>
            <option value="INFANTIL">Infantil</option>
          </select>
        </div>
        <div className="campo"><label>Categoria</label>
          <input type="text" value={form.categoria || ''} onChange={(e) => setcampo('categoria', e.target.value)} placeholder="Ex: Esportivo" />
        </div>
        <div className="campo"><label>Preço de Venda (R$)</label>
          <input type="number" step="0.01" value={form.preco_venda ?? ''} onChange={(e) => setcampo('preco_venda', Number(e.target.value))} placeholder="Ex: 299.90" />
        </div>
        <div className="campo"><label>Peso (kg)</label>
          <input type="number" step="0.01" value={form.peso ?? ''} onChange={(e) => setcampo('peso', Number(e.target.value))} placeholder="Ex: 0.5" />
        </div>
        <div className="campo"><label>Dimensão</label>
          <input type="text" value={form.dimensao || ''} onChange={(e) => setcampo('dimensao', e.target.value)} placeholder="Ex: 30x20x15cm" />
        </div>
        <div className="campo"><label>Status</label>
          <select value={form.status || 'ATIVO'} onChange={(e) => setcampo('status', e.target.value as Calcado['status'])}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        <div className="modal-botoes">
          <button className="btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="btn-primary" onClick={salvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
