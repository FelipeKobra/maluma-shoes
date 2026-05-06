import { NextResponse } from "next/server";
import { movimentarEstoque } from "@/app/services/estoque.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { buscarOrdemMovimentacao, criarOrdemMovimentacao } from "@/app/services/ordemMovimentacao.service";
import { criarItemMovimentacao } from "@/app/services/itemMovimentacao.service";
import { buscarCalcado } from "@/app/services/calcados.service";
import { ApiError } from "@/app/lib/apiError";
import { prisma } from "@/app/lib/prisma";


export async function POST(req: Request) {
  try {
    let ordemMovimentacao = null;
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);
    
    const body = await req.json();

    const calcado = await buscarCalcado(body.calcadoId);

    const usuarioValidado = await prisma.usuario.findUnique({
          where: { id: Number(user.id) },
      });
    
    if(usuarioValidado === null) throw new ApiError("Erro ao validar usuario", 500);

    if (body.ordemMovimentacaoId) {
      ordemMovimentacao = await buscarOrdemMovimentacao(body.ordemMovimentacaoId);
    } else if (body.ordemMovimentacao) {
      ordemMovimentacao = await criarOrdemMovimentacao(body.ordemMovimentacao);
    } else {
      throw new ApiError("É necessário informar uma Ordem existente ou dados para criar uma nova.", 400);
    }

    const bodyItemMov = {
      preco_unitario: Number(calcado.preco_venda),
      quantidade: body.quantidade,
      calcadosId: calcado.id,
      ordemMovimentacaoId: ordemMovimentacao.id
    }
    const itensMovimentacao = await criarItemMovimentacao(bodyItemMov);

    const bodyMov = {
      itensMovimentacaoId: itensMovimentacao.id,
      posicaoEstoqueId: body.posicaoEstoqueId,
      quantidade: body.quantidade,
      tipo: ordemMovimentacao.tipo as "ENTRADA" | "SAIDA",
      motivo: body.motivo,
      responsavel: usuarioValidado.nome
    }

    const result = await movimentarEstoque(bodyMov);

    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
    } 
}
