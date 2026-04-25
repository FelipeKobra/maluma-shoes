import { prisma } from "@/app/lib/prisma";
import { ApiError } from "../lib/apiError";
import { Parser } from 'json2csv';

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

export async function gerarRelatorioMovimentacao(
  params: relatorioParams
) {

   const where = {
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

    ...(params.tipo && {
      tipo: params.tipo,
    }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.movimentacao.findMany({
      where,

      orderBy: {
        data_hora: "desc",
      },

      include: {
        posicaoEstoque: {
          select: {
            cod_localizacao: true,
          }
        },
        itensMovimentacao: {
          select: {
            quantidade: true,
            calcadosId: true,
            calcados: {
              select: {
                modelo: true,
              }
            }
          }
        }
      },
    }),

    prisma.movimentacao.count({
      where,
    }),
  ]);

  if(total === 0 ) throw new ApiError("Nenhuma movimentação encontrada", 404);

  const dadosFormatados = data.map((mov) => {
  
    const item = mov.itensMovimentacao; 

    return {
      data_hora: mov.data_hora.toLocaleString('pt-BR'),
      tipo: mov.tipo,
      responsavel: mov.responsavel,
      modelo: item?.calcados?.modelo || "-",
      quantidade: item?.quantidade || 0,
      cod_localizacao: mov.posicaoEstoque?.cod_localizacao || "-",
      saldo_anterior: mov.saldo_anterior,
      saldo_posterior: mov.saldo_posterior,
      motivo: mov.motivo,
    };
  });

  const fields = [{label: 'Data-Hora', value: 'data_hora' },
    {label: 'Tipo', value: 'tipo' },
    {label: 'Responsavel', value: 'responsavel' }, 
    {label: 'Modelo', value: 'modelo' }, 
    {label: 'Quantidade', value: 'quantidade' }, 
    {label: 'Posicao-Estoque', value: 'cod_localizacao' }, 
    {label: 'Saldo-Anterior', value: 'saldo_anterior' },
    {label: 'Saldo-Posterior', value: 'saldo_posterior' },
    {label: 'Motivo', value: 'motivo' }];

  const opts = { fields };

  const parser = new Parser(opts);

  return parser.parse(dadosFormatados);
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
        itensMovimentacao: true,
      },
    }),

    prisma.movimentacao.count({
      where,
    }),
  ]);

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