import { prisma } from "@/app/lib/prisma";

type BuscarAlertasParams = {
  page?: string;
  limit?: string;
};

export async function buscarAlertasEstoqueMinimo(params: BuscarAlertasParams) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const skip = (page - 1) * limit;

  const where = {
    quantidade_atual: {
      lte: prisma.posicaoEstoque.fields.quantidade_minimo,
    },
  };

  const [data, total] = await prisma.$transaction([
    prisma.posicaoEstoque.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        quantidade_atual: "asc",
      },

      include: {
        movimentacoes: true,
      },
    }),

    prisma.posicaoEstoque.count({
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
