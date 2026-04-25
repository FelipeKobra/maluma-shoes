import { NextResponse } from "next/server";
import { movimentarEstoque } from "@/app/services/estoque.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";

export async function POST(req: Request) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);
    
    const body = await req.json();

    const result = await movimentarEstoque(body);

    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
    } 
}
