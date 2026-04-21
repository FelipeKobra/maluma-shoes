import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await verifyToken(req) as Usuario; 
  authorize(user.role, ["OPERADOR", "ADMIN"]);

  const item = await prisma.posicaoEstoque.findUnique({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json(item);
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await verifyToken(req) as Usuario; 
  authorize(user.role, ["ADMIN"]);

  const body = await req.json();

  const atualizado = await prisma.posicaoEstoque.update({
    where: { id: Number((await params).id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await verifyToken(req) as Usuario; 
  authorize(user.role, ["ADMIN"]);

  await prisma.posicaoEstoque.delete({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
