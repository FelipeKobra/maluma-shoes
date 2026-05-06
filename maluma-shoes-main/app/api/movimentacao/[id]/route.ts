import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { alterarMovimentacao, deletarMovimentacao } from "@/app/services/movimentacao.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const item = await prisma.movimentacao.findUnique({
      where: { id: Number((await params).id) },
    });

    return NextResponse.json(item);
  } catch (error) {
      return handleApiError(error);
    } 
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    const movimentacao = await alterarMovimentacao((await params).id, body);

    return NextResponse.json(movimentacao);
  } catch (error) {
      return handleApiError(error);
    } 
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    await deletarMovimentacao((await params).id)

    return NextResponse.json({ message: "Deletado com sucesso", statuscode: 200 });
  } catch (error) {
      return handleApiError(error);
    } 
}
