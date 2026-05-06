import { prisma } from "../lib/prisma";

type bodyItemMov = {
  preco_unitario: number;
  quantidade: number;
  calcadosId: number;
  ordemMovimentacaoId: number;
}

export async function criarItemMovimentacao(body: bodyItemMov) {

    const subtotal = body.preco_unitario * body.quantidade;
   
    const item = await prisma.itensMovimentacao.create({
        data: {
            ...body,
            subtotal
        }
    });

    return item;
}