import { prisma } from "@/app/lib/prisma";
import { ApiError } from "../lib/apiError";

type BuscarCalcadosParams = {
  id?: string;
  codigo_barras?: string;
  modelo?: string;
  marca?: string;
  numeracao?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  material?: string;
  genero?: string;
  categoria?: string;
  status?: string;
  precoMin?: string;
  precoMax?: string;

  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
};

type bodyCalcados = {
  codigo_barras: string;
  modelo: string;
  marca: string;
  descricao: string;
  numeracao: number;
  cor_primaria: string;
  cor_secundaria: string;
  material: string;
  genero: string;
  categoria: string;
  preco_venda: number; 
  peso: number;
  dimensao: string;
  status: 'ATIVO' | 'INATIVO';
}

export async function buscarCalcados(params: BuscarCalcadosParams) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const skip = (page - 1) * limit;

  const where = {
    ...(params.id && {
      id: Number(params.id),
    }),

    ...(params.codigo_barras && {
      codigo_barras: params.codigo_barras,
    }),

    ...(params.modelo && {
      modelo: {
        contains: params.modelo,
        mode: "insensitive" as const,
      },
    }),

    ...(params.marca && {
      marca: {
        contains: params.marca,
        mode: "insensitive" as const,
      },
    }),

    ...(params.numeracao && {
      numeracao: Number(params.numeracao),
    }),

    ...(params.cor_primaria && {
      cor_primaria: {
        contains: params.cor_primaria,
        mode: "insensitive" as const,
      },
    }),

    ...(params.cor_secundaria && {
      cor_secundaria: {
        contains: params.cor_secundaria,
        mode: "insensitive" as const,
      },
    }),

    ...(params.material && {
      material: {
        contains: params.material,
        mode: "insensitive" as const,
      },
    }),

    ...(params.genero && {
      genero: params.genero,
    }),

    ...(params.categoria && {
      categoria: params.categoria,
    }),

    ...(params.status && {
      status: params.status,
    }),

    ...((params.precoMin || params.precoMax) && {
      preco_venda: {
        ...(params.precoMin && {
          gte: Number(params.precoMin),
        }),

        ...(params.precoMax && {
          lte: Number(params.precoMax),
        }),
      },
    }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.calcados.findMany({
      where,

      skip,

      take: limit,

      orderBy: params.sort
        ? {
            [params.sort]: params.order === "desc" ? "desc" : "asc",
          }
        : {
            id: "asc",
          },
    }),

    prisma.calcados.count({ where }),
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

export async function buscarCalcado(id: string) {

  const item = await prisma.calcados.findUnique({
      where: { id: Number(id) },
  });

  if(item === null) throw new ApiError("Item não encontrado", 404);

  return item;
}

export async function alterarCalcado(id: string, body: bodyCalcados) {

  await buscarCalcado(id);

  const atualizado = await prisma.calcados.update({
      where: { id: Number(id) },
      data: body,
  });

  return atualizado;
}


export async function deletarCalcado(id: string) {

  await buscarCalcado(id);

  await prisma.calcados.delete({
      where: { id: Number(id) },
    });

}
