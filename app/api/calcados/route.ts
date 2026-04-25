import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";

export async function GET(req: Request) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const data = await prisma.calcados.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  } 
}

export async function POST(req: Request) {
try{
  const user = await verifyToken(req) as Usuario; 
  authorize(user.role, ["ADMIN"]);

  const body = await req.json();

  const novo = await prisma.calcados.create({
    data: body,
  });

  return NextResponse.json(novo);
} catch (error) {
    return handleApiError(error);
  } 
}
