import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const item = await prisma.movimentacao.findUnique({
    where: { id: Number(params.id) },
  });

  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();

  const atualizado = await prisma.movimentacao.update({
    where: { id: Number(params.id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  await prisma.movimentacao.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
