// ============================================================
// TIPOS TYPESCRIPT — Maluma Shoes
// Aqui definimos a "forma" dos dados que vêm do backend.
// TypeScript usa isso pra te avisar se você errar um campo.
// ============================================================

import { Decimal } from "@prisma/client/runtime/client";

export type Genero = 'MASCULINO' | 'FEMININO' | 'UNISSEX' | 'INFANTIL';
export type StatusCalcado = 'ATIVO' | 'INATIVO';
export type TipoMovimento = 'ENTRADA' | 'SAIDA';
export type RoleUsuario = 'ADMIN' | 'USER';

export interface Calcado {
  id: number;
  codigo_barras?: string;
  modelo?: string;
  marca?: string;
  descricao?: string;
  numeracao?: number;
  cor_primaria?: string;
  cor_secundaria?: string;
  material?: string;
  genero?: Genero;
  categoria?: string;
  preco_venda?: Decimal;
  peso?: number;
  dimensao?: string;
  status?: StatusCalcado;
}

/*export interface PosicaoEstoque {
  id: number;
  calcadosId?: number;
  calcadoId?: number;
  localizacao?: string;
  posicao?: string;
  saldo?: number;
  quantidade?: number;
  estoqueMinimo?: number;
  minimo?: number;
  calcado?: { nome?: string };
}*/

export interface AlertaEstoqueMin {
  quantidade_minima: number;
  tipo: string;
  ultimo_abastescimento: string;
}

export interface AlertaEstoqueMax {
  quantidade_atual: number;
  quantidade_maxima: number;
  tipo: string;
}

export interface MovimentacaoResposta {
  movimentacao: MovimentacaoResponse;
  alertaEstoqueMin?: AlertaEstoqueMin;
  alertaEstoqueMax?: AlertaEstoqueMax;
}

export interface CriarPosicaoPayload {
  cod_localizacao: string;
  quantidade_atual: number;
  quantidade_minimo: number;
  quantidade_maximo: number;
  ultima_contagem: string;
  para_mostruario: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
}

export interface PosicaoEstoque {
  id: number;
  cod_localizacao?: string;
  quantidade_atual?: number;
  quantidade_minimo?: number;
  quantidade_maximo?: number;
  ultimo_abastecimento?: string;
  ultima_contagem?: string;
  para_mostruario?: boolean;
  modelo?: string;
  marca?: string;
}

export interface Movimentacao {
  id: number;
  tipo?: string;
  responsavel?: string;
  saldo_anterior?: number;
  saldo_posterior?: number;
  motivo?: string;
  data_hora?: string;
  itensMovimentacao?: itensMovimentacao;
  posicaoEstoque?: PosicaoEstoque;
}

export interface MovimentacaoResponse {
  id: number;
  tipo?: string;
  responsavel?: string;
  saldo_anterior?: number;
  saldo_posterior?: number;
  motivo?: string;
  data_hora?: string;
  itensMovimentacao?: number;
  posicaoEstoque?: number;
}

export interface Alerta {
  nomeProduto?: string;
  nome?: string;
  calcado?: { nome?: string };
  quantidadeAtual?: number;
  saldo?: number;
  estoqueMinimo?: number;
  minimo?: number;
}

export interface Usuario {
  id: number;
  nome?: string;
  email?: string;
  role?: RoleUsuario;
  createdAt?: string;
}

export interface MovimentoPayload {
  calcadoId: number;
  posicaoEstoqueId: number;
  quantidade: number;
  motivo?: string;
  ordemMovimentacao: { tipo: TipoMovimento };
}

export interface OrdemMovimentacao {
  id?: number;
  data_emissao?: string;
  empresa?: string;
  cnpj?: string;
  numero_ordem?: string;
  tipo?: string;
  status?: string;
  valor_total?: string;
}

export interface itensMovimentacao {
  id?: number;
  preco_unitario?: string;
  quantidade?: number;
  subtotal?: string;
  calcados?: Calcado;
}