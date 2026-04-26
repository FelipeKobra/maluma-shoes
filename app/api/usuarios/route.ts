import { NextRequest, NextResponse } from "next/server";
import { alterarUsuario, criarUsuario } from "@/app/services/usuario.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    const usuario = await criarUsuario(body);

    return NextResponse.json(usuario);
  } catch (error) {
      return handleApiError(error);
    } 
}

export async function GET(req: Request) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);
    
    const data = await prisma.usuario.findMany();

    const dadosFormatados = data.map((d) => {

    return {
      "id": d.id,
      "nome": d.nome,
      "email": d.email,
      "role": d.role,
      "createdAt": d.createdAt
    };
  });

    return NextResponse.json(dadosFormatados);
  } catch (error) {
    return handleApiError(error);
  } 
}

