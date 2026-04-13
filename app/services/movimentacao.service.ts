import { prisma } from "@/app/lib/prisma";

type BuscarHistoricoParams = {
  tipo?: string;
  responsavel?: string;
  motivo?: string;
  dataInicio?: string;
  dataFim?: string;

  page?: string;
  limit?: string;
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