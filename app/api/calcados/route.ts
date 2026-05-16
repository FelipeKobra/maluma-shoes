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
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    // O Prisma aceita strings numéricas para campos Decimal e faz a conversão automática
    if (body.preco_venda !== undefined && body.preco_venda !== null) {
      body.preco_venda = String(body.preco_venda);
    }

    // Garante que o peso seja limpo se enviado de forma inválida
    if (body.peso === '' || body.peso === undefined) {
      delete body.peso;
    } else if (body.peso !== null) {
      body.peso = Number(body.peso);
    }

    const novo = await prisma.calcados.create({
      data: body,
    });

    return NextResponse.json(novo);
  } catch (error) {
    console.log("ERRO: " + error);
    return handleApiError(error);
  } 
}
