import { prisma } from "@/app/lib/prisma";

type InventarioInput = {
  posicaoEstoqueId: number;
  quantidadeFisica: number;
  itensMovimentacaoId: number;
  responsavel: string;
};

export async function realizarInventario(data: InventarioInput) {
  return await prisma.$transaction(async (tx) => {
    const estoque = await tx.posicaoEstoque.findUnique({
      where: {
        id: data.posicaoEstoqueId,
      },
    });

    if (!estoque) {
      throw new Error("Posição de estoque não encontrada");
    }

    const quantidadeSistema = estoque.quantidade_atual;

    const divergencia = data.quantidadeFisica - quantidadeSistema;

    await tx.posicaoEstoque.update({
      where: {
        id: data.posicaoEstoqueId,
      },
      data: {
        quantidade_atual: data.quantidadeFisica,
        ultima_contagem: new Date(),
      },
    });

    const movimentacao = await tx.movimentacao.create({
      data: {
        data_hora: new Date(),

        tipo: "AJUSTE",

        motivo: `Inventário físico realizado. Divergência de ${divergencia}`,

        saldo_anterior: quantidadeSistema,

        saldo_posterior: data.quantidadeFisica,

        responsavel: data.responsavel,

        itensMovimentacaoId: data.itensMovimentacaoId,

        posicaoEstoqueId: data.posicaoEstoqueId,
      },
    });

    return {
      movimentacao,
      divergencia,
      quantidadeSistema,
      quantidadeFisica: data.quantidadeFisica,
    };
  });
}
