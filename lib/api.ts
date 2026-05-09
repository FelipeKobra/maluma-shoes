// ============================================================
// API.TS — Camada de comunicação com o backend
//
// Diferenças do api.js original:
// - Funções tipadas: parâmetros e retornos têm tipos definidos
// - `window` não existe no servidor do Next.js (SSR), então
//   localStorage e window.location são chamados só no cliente
// ============================================================

import type { Calcado, PosicaoEstoque, Movimentacao, Alerta, Usuario, MovimentoPayload } from '@/types';

const API = 'https://maluma-shoes.vercel.app';


function getToken(): string | null {
  // typeof window === 'undefined' verifica se estamos no servidor (Next.js SSR)
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options: RequestInit & { _csv?: boolean } = {}): Promise<T> {
  const token = getToken();

  console.log("PATH: " + path);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API}${path}`, { ...options, headers });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Não autorizado');
  }

  // Para CSV, retornamos a Response bruta
  if (options._csv) return response as unknown as T;

  const text = await response.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    const msg = (data as { message?: string })?.message || `Erro ${response.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// ---- APIs específicas ----

export const calcadosAPI = {
  listar: () => apiFetch<Calcado[]>('/api/calcados'),
  buscarPorId: (id: number) => apiFetch<Calcado>(`/api/calcados/${id}`),
  criar: (dados: Partial<Calcado>) =>
    apiFetch<Calcado>('/api/calcados', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id: number, dados: Partial<Calcado>) =>
    apiFetch<Calcado>(`/api/calcados/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  deletar: (id: number) =>
    apiFetch<void>(`/api/calcados/${id}`, { method: 'DELETE' }),
};

export const estoqueAPI = {
  listar: () => apiFetch<PosicaoEstoque[]>('/api/posicao-estoque'),
  minimo: () => apiFetch<PosicaoEstoque[]>('/api/posicao-estoque/minimo'),
  mover: (dados: MovimentoPayload) =>
    apiFetch<void>('/api/posicao-estoque/moverEstoque', { method: 'POST', body: JSON.stringify(dados) }),
};

export const movimentacoesAPI = {
  historico: () => apiFetch<Movimentacao[]>('/api/movimentacao/historico'),
  listar: () => apiFetch<Movimentacao[]>('/api/movimentacao'),
};

export const alertasAPI = {
  estoqueMinimo: () => apiFetch<Alerta[]>('/api/alerta/estoque-minimo'),
};

export const usuariosAPI = {
  listar: () => apiFetch<Usuario[]>('/api/usuarios'),
  criar: (dados: { nome: string; email: string; senha: string }) =>
    apiFetch<Usuario>('/api/usuarios', { method: 'POST', body: JSON.stringify(dados) }),
  atualizar: (id: number, dados: { nome: string; email: string }) =>
    apiFetch<Usuario>(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
};

export const relatoriosAPI = {
  baixar: async (tipo: string): Promise<void> => {
    const response = await apiFetch<Response>(`/api/relatorio/${tipo}`, { _csv: true });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${tipo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
