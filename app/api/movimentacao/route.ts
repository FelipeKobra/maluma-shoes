import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.movimentacao.findMany();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.movimentacao.create({
    data: body,
  });

  return NextResponse.json(novo);
}
