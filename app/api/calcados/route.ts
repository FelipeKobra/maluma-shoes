import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";

export async function GET(req: Request) {
  const user = await verifyToken(req) as Usuario; 
  authorize(user.role, ["OPERADOR", "ADMIN"]);

  const data = await prisma.calcados.findMany();
  return NextResponse.json(data);
}

export async function POST(req: Request) {

  const user = await verifyToken(req) as Usuario; 
  authorize(user.role, ["OPERADOR", "ADMIN"]);

  const body = await req.json();

  const novo = await prisma.calcados.create({
    data: body,
  });

  return NextResponse.json(novo);
}
