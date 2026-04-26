import { ApiError } from "../lib/apiError";
import { prisma } from "../lib/prisma";

type bodyOrdMov = {
  data_emissao: string;
  empresa: string;
  cnpj: string;
  numero_ordem: string;
  tipo: "ENTRADA" | "SAIDA";
  status: string;
  valor_total: string;
}

export async function buscarOrdemMovimentacao(id: string) {

  const item = await prisma.ordemMovimentacao.findUnique({
      where: { id: Number(id) },
  });

    if (item == null) {
        throw new ApiError("Ordem de movimentação não encontrada.", 404);
    }

  return item;
}


export async function criarOrdemMovimentacao(body: bodyOrdMov) {
   
    const item = await prisma.ordemMovimentacao.create({
        data: body,
    });

    return item;
}

