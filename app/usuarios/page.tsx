'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { usuariosAPI } from '@/lib/api';
import type { Usuario } from '@/types';
import { Pencil, UserPlus, Loader2 } from 'lucide-react';

type UserRole = 'ADMIN' | 'OPERADOR';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<{ id: number; nome: string; email: string; role: UserRole } | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    console.log('[UsuariosPage] Iniciando carregamento da lista de usuários...');
    setCarregando(true);
    setErro('');
    try {
      const lista = await usuariosAPI.listar();
      console.log('[UsuariosPage] Usuários carregados com sucesso:', lista);
      setUsuarios(Array.isArray(lista) ? lista : []);
    } catch (err: unknown) {
      console.error('[UsuariosPage] Erro ao carregar usuários:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="layout flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="main flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="page-title text-2xl font-bold">Usuários</h1>
          <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2" onClick={() => { setEditando(null); setModalAberto(true); }}>
            <UserPlus size={18} /> Novo Usuário
          </button>
        </div>

        <div className="card overflow-hidden">
          {carregando ? (
            <div className="loading-text flex items-center justify-center p-12 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Carregando...</span>
            </div>
          ) : erro ? (
            <p className="msg-erro p-4 text-red-500">{erro}</p>
          ) : (
            <div className="tabela-wrapper overflow-x-auto w-full border rounded-lg">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr><th>ID</th><th>Nome</th><th>Email</th><th>Role</th><th>Criado em</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.nome || '—'}</td>
                      <td>{u.email || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-entrada' : 'badge-saida'}`}>
                          {u.role || '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>
                        <div className="acoes">
                          <button
                            className="btn-edit flex items-center gap-1 px-3 py-1"
                            onClick={() => {
                              setEditando({ 
                                id: u.id, 
                                nome: u.nome || '', 
                                email: u.email || '', 
                                role: (u.role as UserRole) || 'OPERADOR' 
                              });
                              setModalAberto(true);
                            }}
                          >
                            <Pencil size={14} /> Editar
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
        <ModalUsuario
          editando={editando}
          onFechar={() => setModalAberto(false)}
          onSalvar={() => { setModalAberto(false); carregarUsuarios(); }}
        />
      )}
    </div>
  );
}

// ---- Modal Atualizado e Responsivo ----
interface ModalUsuarioProps {
  editando: { id: number; nome: string; email: string; role: UserRole } | null;
  onFechar: () => void;
  onSalvar: () => void;
}

function ModalUsuario({ editando, onFechar, onSalvar }: ModalUsuarioProps) {
  const [nome, setNome]   = useState(editando?.nome || '');
  const [email, setEmail] = useState(editando?.email || '');
  const [role, setRole]   = useState<UserRole>(editando?.role || 'OPERADOR');
  const [senha, setSenha] = useState('');
  const [erro, setErro]   = useState('');
  const [loading, setLoading] = useState(false);

  // Validação em tempo de execução para feedback visual instantâneo nos estilos Tailwind
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValido = email === '' || emailRegex.test(email);

  async function salvar() {
    setErro('');

    if (!emailRegex.test(email)) {
      console.warn('[ModalUsuario] Validação falhou: Formato de e-mail inválido digitado:', email);
      setErro('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    console.log('[ModalUsuario] Iniciando processo de salvar usuário...', {
      modo: editando ? 'EDIÇÃO' : 'CRIAÇÃO',
      dados: { nome, email, role, id: editando?.id }
    });
    
    setLoading(true);
    try {
      if (editando) {
        await usuariosAPI.atualizar(editando.id, { nome, email, role });
        console.log(`[ModalUsuario] Usuário ID ${editando.id} atualizado com sucesso.`);
      } else {
        await usuariosAPI.criar({ nome, email, senha, role });
        console.log('[ModalUsuario] Novo usuário criado com sucesso.');
      }
      onSalvar();
    } catch (err: unknown) {
      console.error('[ModalUsuario] Erro ao salvar dados do usuário:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="modal-box bg-white w-full max-w-md rounded-lg p-6 shadow-xl overflow-y-auto max-h-[95vh]">
        <h2 className="text-xl font-bold mb-4">{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        {erro && <div className="msg-erro mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{erro}</div>}
        
        <div className="grid grid-cols-1 gap-4">
          <div className="campo">
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input className="w-full border rounded p-2" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="campo">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              className={`w-full border rounded p-2 transition-colors ${!isEmailValido ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none' : ''}`} 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@exemplo.com" 
            />
            {!isEmailValido && (
              <span className="text-xs text-red-500 mt-1 block">Formato de e-mail inválido</span>
            )}
          </div>

          <div className="campo">
            <label className="block text-sm font-medium mb-1">Perfil de Acesso (Role)</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border rounded p-2 bg-white"
            >
              <option value="OPERADOR">OPERADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {!editando && (
            <div className="campo">
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input className="w-full border rounded p-2" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
            </div>
          )}
        </div>

        <div className="modal-botoes flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-4 border-t">
          <button className="btn-secondary w-full sm:w-auto px-6 py-2" onClick={onFechar}>Cancelar</button>
          <button 
            className="btn-primary w-full sm:w-auto px-6 py-2" 
            onClick={salvar} 
            disabled={loading || !isEmailValido || email === ''}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}