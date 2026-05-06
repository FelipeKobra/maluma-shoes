import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { alterarCalcado, buscarCalcado, deletarCalcado } from "@/app/services/calcados.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyToken(req) as Usuario;

    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const item = await buscarCalcado((await params).id);

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  } 
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyToken(req) as Usuario; 

    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    const atualizado = await alterarCalcado((await params).id, body);

    return NextResponse.json(atualizado);
  } catch (error) {
      return handleApiError(error);
    } 
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyToken(req) as Usuario; 

    authorize(user.role, ["ADMIN"]);

    await deletarCalcado((await params).id);

    return NextResponse.json({ message: "Deletado com sucesso", statuscode: 200 });
  } catch (error) {
    return handleApiError(error);
  } 
}
