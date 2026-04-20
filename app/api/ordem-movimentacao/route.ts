import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
  const data = await prisma.ordemMovimentacao.findMany();
  return NextResponse.json(data);
}


export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.ordemMovimentacao.create({
    data: body,
  });

  return NextResponse.json(novo);
}
