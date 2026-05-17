import { NextResponse } from "next/server";
import { movimentarEstoque } from "@/app/services/estoque.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { buscarOrdemMovimentacao, buscarOrdemMovimentacaoPorNumero, criarOrdemMovimentacao } from "@/app/services/ordemMovimentacao.service";
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

    console.log("BUSCANDO CALCADO...");

    const calcado = await buscarCalcado(body.calcadoId);

    console.log("VALIDANDO USUARIO...");

    const usuarioValidado = await prisma.usuario.findUnique({
          where: { id: Number(user.id) },
      });
    
    if(usuarioValidado === null) throw new ApiError("Erro ao validar usuario", 500);

    console.log("CHECANDO ORDEM NA REQUISICAO...");

    if (!body.ordemMovimentacao) {
      throw new ApiError("É necessário informar uma ordem de movimentação", 400);
    }

    console.log("BUSCANDO SE ORDEM JA FOI CADASTRADA...");

    if (!body.ordemMovimentacao.numero_ordem) {
      throw new ApiError("É necessário preencher o numero da ordem de movimentação", 400);
    }

    console.log("CRIANDO ORDEM MOVIMENTACAO...");

    ordemMovimentacao = await criarOrdemMovimentacao(body.ordemMovimentacao);

    const bodyItemMov = {
      preco_unitario: Number(calcado.preco_venda),
      quantidade: body.quantidade,
      calcadosId: calcado.id,
      ordemMovimentacaoId: ordemMovimentacao.id
    }

    console.log("CRIANDO ITEM DE MOVIMENTACAO...");

    const itensMovimentacao = await criarItemMovimentacao(bodyItemMov);

    console.log("MONTANDO BODY PARA MOVIMENTAR...");

    const bodyMov = {
      itensMovimentacaoId: itensMovimentacao.id,
      posicaoEstoqueId: body.posicaoEstoqueId,
      quantidade: body.quantidade,
      tipo: ordemMovimentacao.tipo as "ENTRADA" | "SAIDA",
      motivo: body.motivo === "" ? (ordemMovimentacao.tipo === "ENTRADA" ? "ABASTECIMENTO" : "VENDA") : body.motivo,
      responsavel: usuarioValidado.nome
    }

    console.log("MOVIMENTANDO ESTOQUE...");

    const result = await movimentarEstoque(bodyMov);

    console.log("RETORNANDO RESPOSTA...");

    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
    } 
}
