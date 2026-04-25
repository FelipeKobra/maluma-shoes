import { prisma } from "@/app/lib/prisma";
import { ApiError } from "../lib/apiError";

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
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'; // Exemplo de Union Type para os tipos que você usa no GIP
  motivo: string;
  saldo_anterior: number;
  saldo_posterior: number;
  responsavel: string;
  itensMovimentacaoId: number;
  posicaoEstoqueId: number;
};

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