import { prisma } from "@/app/lib/prisma";

type MovimentacaoInput = {
  posicaoEstoqueId: number;
  itensMovimentacaoId: number;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  motivo: string;
  responsavel: string;
};

export async function movimentarEstoque(data: MovimentacaoInput) {
  const estoque = await prisma.posicaoEstoque.findUnique({
    where: {
      id: data.posicaoEstoqueId,
    },
  });

  if (!estoque) {
    throw new Error("Estoque não encontrado");
  }

  const saldoAnterior = estoque.quantidade_atual;

  let saldoPosterior = saldoAnterior;

  if (data.tipo === "ENTRADA") {
    saldoPosterior += data.quantidade;
  }

  if (data.tipo === "SAIDA") {
    if (saldoAnterior < data.quantidade) {
      throw new Error("Estoque insuficiente");
    }

    saldoPosterior -= data.quantidade;
  }

  const movimentacao = await prisma.movimentacao.create({
    data: {
      data_hora: new Date(),
      tipo: data.tipo,
      motivo: data.motivo,
      saldo_anterior: saldoAnterior,
      saldo_posterior: saldoPosterior,
      responsavel: data.responsavel,
      itensMovimentacaoId: data.itensMovimentacaoId,
      posicaoEstoqueId: data.posicaoEstoqueId,
    },
  });

  await prisma.posicaoEstoque.update({
    where: {
      id: data.posicaoEstoqueId,
    },
    data: {
      quantidade_atual: saldoPosterior,
      ultimo_abastecimento: data.tipo === "ENTRADA" ? new Date() : undefined,
    },
  });

  return movimentacao;
}

export const baixoEstoque = await prisma.posicaoEstoque.findMany({
  where: {
    quantidade_atual: {
      lte: prisma.posicaoEstoque.fields.quantidade_minimo,
    },
  },
});
