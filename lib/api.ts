// ============================================================
// API.TS — Camada de comunicação com o backend
//
// Diferenças do api.js original:
// - Funções tipadas: parâmetros e retornos têm tipos definidos
// - `window` não existe no servidor do Next.js (SSR), então
//   localStorage e window.location são chamados só no cliente
// ============================================================

import type { Calcado, CriarPosicaoPayload, MovimentacaoResposta,  PosicaoEstoque, Movimentacao, Alerta, Usuario, MovimentoPayload, OrdemMovimentacao, MovimentacaoResponse, PaginatedResponse } from '@/types';

const API = 'https://maluma-shoes.vercel.app';

export interface DeleteResposta {
  message: string;
  statuscode: number;
}

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

  // lib/api.ts (ou onde estiver seu apiFetch)

if (response.status === 401) {
  if (typeof window !== 'undefined') {
    // Limpa o localStorage
    localStorage.removeItem('token');
    
    // ADICIONE ISSO: Limpa o Cookie de autenticação
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
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
  
  // TIPADO CORRETAMENTE: Casado com o retorno estruturado do seu backend
  deletar: (id: number) =>
    apiFetch<DeleteResposta>(`/api/calcados/${id}`, { method: 'DELETE' }),
};

export const estoqueAPI = {
  listar: () => 
    apiFetch<PosicaoEstoque[]>('/api/posicao-estoque'),
    
  minimo: () => 
    apiFetch<PosicaoEstoque[]>('/api/posicao-estoque/minimo'),
    
  mover: (dados: MovimentoPayload) =>
    apiFetch<MovimentacaoResposta>('/api/posicao-estoque/moverEstoque', { 
      method: 'POST', 
      body: JSON.stringify(dados) 
    }),

  criar: (dados: CriarPosicaoPayload) =>
    apiFetch<PosicaoEstoque>('/api/posicao-estoque', { 
      method: 'POST', 
      body: JSON.stringify(dados) 
    }),

  // ADICIONE ESTA FUNÇÃO AQUI:
  realizarInventario: (dados: { posicaoEstoqueId: number; quantidadeFisica: number}) =>
    apiFetch<void>('/api/inventario', {
      method: 'POST',
      body: JSON.stringify(dados)
    }),
};

// Defina uma interface para os filtros para manter o TypeScript feliz
interface FiltrosHistorico {
  tipo?: string;
  responsavel?: string;
  motivo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: string | number;
  limit?: string | number;
}

export const movimentacoesAPI = {
  // Agora aceita um objeto opcional de filtros
  historico: (filtros?: FiltrosHistorico) => {
    const params = new URLSearchParams();
    
    if (filtros) {
      // Percorre o objeto e adiciona apenas o que não for undefined
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const query = params.toString();
    const path = `/api/movimentacao/historico${query ? `?${query}` : ''}`;
    
    return apiFetch<PaginatedResponse<Movimentacao> | Movimentacao[]>(path);
  },
  
  listar: () => apiFetch<Movimentacao[]>('/api/movimentacao'),
};

export const alertasAPI = {
  estoqueMinimo: () => apiFetch<Alerta[]>('/api/alerta/estoque-minimo'),
};

export const usuariosAPI = {
  listar: () => apiFetch<Usuario[]>('/api/usuarios'),
  
  criar: (dados: { nome: string; email: string; senha: string; role: string }) =>
    apiFetch<Usuario>('/api/usuarios', { method: 'POST', body: JSON.stringify(dados) }),
    
  atualizar: (id: number, dados: { nome: string; email: string; role: string }) =>
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

export const ordemMovimentacaoAPI = {
  buscarPorNumero: (numero_ordem: string) => apiFetch<OrdemMovimentacao>(`/api/ordem-movimentacao/numero/${numero_ordem}`),
}
