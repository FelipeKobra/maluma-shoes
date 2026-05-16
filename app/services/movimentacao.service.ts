import { prisma } from "@/app/lib/prisma";
import { ApiError } from "../lib/apiError";
import { Parser } from 'json2csv';
import { Decimal } from "@prisma/client/runtime/client";



export interface CalcadoRelatorio {
  id: number;
  modelo: string;
  codigo_barras?: string;
  marca?: string;
  descricao?: string;
  numeracao?: number;
  cor_primaria?: string;
  cor_secundaria?: string;
  material?: string;
  genero?: string;
  categoria?: string;
  preco_venda?: Decimal | number;
  peso?: number;
  dimensao?: string;
  status?: string;
}

export interface ItemMovimentacaoRelatorio {
  id: number;
  quantidade: number;
  preco_unitario?: Decimal | number;
  subtotal?: Decimal | number;
  calcadosId: number;
  ordemMovimentacaoId: number;
  calcados: CalcadoRelatorio;
}

export interface PosicaoEstoqueRelatorio {
  id: number;
  cod_localizacao: string;
  quantidade_atual: number;
  ultima_contagem: Date | string;
  // Substituído o 'any' por uma assinatura de índice estrita para os demais campos opcionais do Prisma
  [key: string]: string | number | boolean | Date | Decimal | null | undefined;
}

export interface MovimentacaoDB {
  id: number;
  data_hora: Date | string;
  tipo: 'ENTRADA' | 'SAIDA' | string;
  responsavel?: string | null;
  saldo_anterior?: number | null;
  saldo_posterior?: number | null;
  motivo?: string | null;
  posicaoEstoque: PosicaoEstoqueRelatorio | null;
  itensMovimentacao: ItemMovimentacaoRelatorio[] | ItemMovimentacaoRelatorio;
}

export interface MetaRelatorio {
  total?: number;
  pagina_atual?: number;
  total_paginas?: number;
  [key: string]: unknown; // Uso de 'unknown' em vez de 'any' para propriedades dinâmicas desconhecidas
}

// Interface principal para o parâmetro da função
export interface EntradaRelatorioMovimentacao {
  data: MovimentacaoDB[];
  meta?: MetaRelatorio;
}

type BuscarHistoricoParams = {
  tipo?: string;
  responsavel?: string;
  motivo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: string;
  limit?: string;
};

type bodyMovimentacao = {
  id: number;
  data_hora: Date;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'; 
  motivo: string;
  saldo_anterior: number;
  saldo_posterior: number;
  responsavel: string;
  itensMovimentacaoId: number;
  posicaoEstoqueId: number;
};

type relatorioParams = {
  dataInicio?: string;
  dataFim?: string;
  tipo?: string; 
}

export async function gerarRelatorioMovimentacao(dadosMovimentacao: EntradaRelatorioMovimentacao): Promise<string> {
  
  const dadosFormatados = dadosMovimentacao.data.map((mov) => {
    const primeiroItem = Array.isArray(mov.itensMovimentacao) 
      ? mov.itensMovimentacao[0] 
      : mov.itensMovimentacao;

    return {
      data_hora: new Date(mov.data_hora).toLocaleString('pt-BR'),
      tipo: mov.tipo,
      responsavel: mov.responsavel || "-",
      modelo: primeiroItem?.calcados?.modelo || "-",
      quantidade: primeiroItem?.quantidade || 0,
      cod_localizacao: mov.posicaoEstoque?.cod_localizacao || "-",
      saldo_anterior: mov.saldo_anterior ?? 0,
      saldo_posterior: mov.saldo_posterior ?? 0,
      motivo: mov.motivo || "-",
    };
  });

  const fields = [
    { label: 'Data-Hora', value: 'data_hora' },
    { label: 'Tipo', value: 'tipo' },
    { label: 'Responsavel', value: 'responsavel' }, 
    { label: 'Modelo', value: 'modelo' }, 
    { label: 'Quantidade', value: 'quantidade' }, 
    { label: 'Posicao-Estoque', value: 'cod_localizacao' }, 
    { label: 'Saldo Anterior', value: 'saldo_anterior' },
    { label: 'Saldo Posterior', value: 'saldo_posterior' },
    { label: 'Motivo', value: 'motivo' }
  ];

  const parser = new Parser({ fields, delimiter: ';' });
  const csv = parser.parse(dadosFormatados);

  const BOM = '\uFEFF';
  return BOM + csv;
}

export async function buscarHistoricoMovimentacoes(
  params: BuscarHistoricoParams
) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const skip = (page - 1) * limit;

  const where = {
    ...(params.tipo && {
      tipo: params.tipo,
    }),

    ...(params.responsavel && {
      responsavel: {
        contains: params.responsavel,
        mode: "insensitive" as const,
      },
    }),

    ...(params.motivo && {
      motivo: {
        contains: params.motivo,
        mode: "insensitive" as const,
      },
    }),

    ...((params.dataInicio || params.dataFim) && {
      data_hora: {
        ...(params.dataInicio && {
          gte: new Date(params.dataInicio),
        }),

        ...(params.dataFim && {
          lte: new Date(params.dataFim),
        }),
      },
    }),
  };

 const [data, total] = await prisma.$transaction([
  prisma.movimentacao.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      data_hora: "desc",
    },
    include: {
      posicaoEstoque: true,
      // Transformamos itensMovimentacao em um objeto para permitir o aninhamento
      itensMovimentacao: {
        include: {
          calcados: true, // Agora o Prisma traz o calçado vinculado ao item
        },
      },
    },
  }),

  prisma.movimentacao.count({
    where,
  }),
]);

if (total === 0) throw new ApiError("Nenhuma movimentação encontrada", 404);

  return {
    data,

    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function buscarMovimentacao(id: string) {

  const movimentacao = await prisma.movimentacao.findUnique({
    where: { id: Number(id) },
  });

  if(movimentacao === null) throw new ApiError("Movimentacao não encontrada", 404);

  return movimentacao;
}


export async function alterarMovimentacao(id: string, body: bodyMovimentacao) {

  await buscarMovimentacao(id);

  const movimentacao = await prisma.movimentacao.update({
    where: { id: Number(id) },
    data: body,
  });
  
  return movimentacao;
}


export async function deletarMovimentacao(id: string) {

  await buscarMovimentacao(id);

  await prisma.movimentacao.delete({
    where: { id: Number(id) },
  });
}