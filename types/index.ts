// ============================================================
// TIPOS TYPESCRIPT — Maluma Shoes
// Aqui definimos a "forma" dos dados que vêm do backend.
// TypeScript usa isso pra te avisar se você errar um campo.
// ============================================================

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
  preco_venda?: number;
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

export interface PosicaoEstoque {
  id: number;
  localizacao?: string;
  quantidadeAtual?: number;
  quantidadeMinima?: number;
  estoqueMinimoMaximo?: number;
  ultimoAbastecimento?: string;
  ultimaContagem?: string;
  paraMostruario?:boolean;
  modelo?: string;
  marca?: string;
}

export interface Movimentacao {
  id: number;
  tipo?: string;
  tipoMovimentacao?: string;
  calcado?: { nome?: string };
  nomeProduto?: string;
  nome?: string;
  quantidade?: number;
  saldo?: number;
  data?: string;
  createdAt?: string;
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
