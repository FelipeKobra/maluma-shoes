import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { buscarOrdemMovimentacaoPorNumero } from "@/app/services/ordemMovimentacao.service";
import { ApiError } from "@/app/lib/apiError";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ numero_ordem: string }> },
) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const existente = await buscarOrdemMovimentacaoPorNumero((await params).numero_ordem);

    if(!existente) throw new ApiError("Ordem de movimentação não encontrada", 404);

    return NextResponse.json(existente);
  } catch (error) {
      return handleApiError(error);
    } 
}



