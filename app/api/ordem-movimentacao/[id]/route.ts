import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const item = await prisma.ordemMovimentacao.findUnique({
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
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const body = await req.json();

    const atualizado = await prisma.ordemMovimentacao.update({
      where: { id: Number((await params).id) },
      data: body,
    });

    return NextResponse.json(atualizado);
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
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    await prisma.ordemMovimentacao.delete({
      where: { id: Number((await params).id) },
    });

    return NextResponse.json({ message: "Deletado com sucesso" });
  } catch (error) {
      return handleApiError(error);
    } 
}
