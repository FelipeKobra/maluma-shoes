import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { buscarOrdemMovimentacaoPorNumero } from "@/app/services/ordemMovimentacao.service";
import { ApiError } from "@/app/lib/apiError";

export async function GET(req: Request) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const data = await prisma.ordemMovimentacao.findMany();
    return NextResponse.json(data);
  } catch (error) {
      return handleApiError(error);
    } 
}


export async function POST(req: Request) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const body = await req.json();

    const {numero_ordem} = body;

    const existente = await buscarOrdemMovimentacaoPorNumero(numero_ordem);

    if(existente) throw new ApiError("Ordem de movimentação já cadastrada", 400);

    const novo = await prisma.ordemMovimentacao.create({
      data: body,
    });

    return NextResponse.json(novo);
  } catch (error) {
      return handleApiError(error);
    } 
}
