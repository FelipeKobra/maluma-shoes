'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { usuariosAPI } from '@/lib/api';
import type { Usuario } from '@/types';

// Definimos as roles possíveis para evitar erros de digitação
type UserRole = 'ADMIN' | 'OPERADOR';

export default function UsuariosPage() {
  const [usuarios, setUsuarios]       = useState<Usuario[]>([]);
  const [carregando, setCarregando]   = useState(true);
  const [erro, setErro]               = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  
  // Atualizamos o estado de "editando" para incluir a role
  const [editando, setEditando]       = useState<{ id: number; nome: string; email: string; role: UserRole } | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await usuariosAPI.listar();
      setUsuarios(Array.isArray(lista) ? lista : []);
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
          <h1 className="page-title">Usuários</h1>
          <button className="btn-primary" onClick={() => { setEditando(null); setModalAberto(true); }}>
            + Novo Usuário
          </button>
        </div>

        <div className="card">
          {carregando ? (
            <p className="loading-text">Carregando...</p>
          ) : erro ? (
            <p className="msg-erro">{erro}</p>
          ) : (
            <div className="tabela-wrapper">
              <table>
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
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>
                        <div className="acoes">
                          <button
                            className="btn-edit"
                            onClick={() => {
                              // Passamos a role para o estado de edição
                              setEditando({ 
                                id: u.id, 
                                nome: u.nome || '', 
                                email: u.email || '', 
                                role: (u.role as UserRole) || 'OPERADOR' 
                              });
                              setModalAberto(true);
                            }}
                          >
                            ✏️ Editar
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

// ---- Modal Atualizado ----
interface ModalUsuarioProps {
  editando: { id: number; nome: string; email: string; role: UserRole } | null;
  onFechar: () => void;
  onSalvar: () => void;
}

function ModalUsuario({ editando, onFechar, onSalvar }: ModalUsuarioProps) {
  const [nome, setNome]   = useState(editando?.nome || '');
  const [email, setEmail] = useState(editando?.email || '');
  const [role, setRole]   = useState<UserRole>(editando?.role || 'OPERADOR'); // Default: OPERADOR
  const [senha, setSenha] = useState('');
  const [erro, setErro]   = useState('');
  const [loading, setLoading] = useState(false);

  async function salvar() {
    setErro('');
    setLoading(true);
    try {
      if (editando) {
        await usuariosAPI.atualizar(editando.id, { nome, email, role });
      } else {
        await usuariosAPI.criar({ nome, email, senha, role });
      }
      onSalvar();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="modal-box">
        <h2>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        {erro && <div className="msg-erro">{erro}</div>}
        
        <div className="campo">
          <label>Nome</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </div>

        <div className="campo">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
        </div>

        {/* NOVO CAMPO: Role */}
        <div className="campo">
          <label>Perfil de Acesso (Role)</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="select-custom" // Certifique-se de ter esse estilo no CSS
          >
            <option value="OPERADOR">OPERADOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {!editando && (
          <div className="campo">
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
        )}

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