import { NextRequest, NextResponse } from "next/server";
import { realizarInventario } from "@/app/services/inventario.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { prisma } from "@/app/lib/prisma";
import { ApiError } from "@/app/lib/apiError";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    const usuarioValidado = await prisma.usuario.findUnique({
              where: { id: Number(user.id) },
          });
        
    if(usuarioValidado === null) throw new ApiError("Erro ao validar usuario", 500);

    const dados = {
      ...body,
      usuarioValidado,
    }

    const result = await realizarInventario(dados);

    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
  } 
}
