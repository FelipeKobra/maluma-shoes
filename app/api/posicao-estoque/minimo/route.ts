import { baixoEstoque } from "@/app/services/estoque.service";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";

export async function GET(req: Request) {
  try{
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const data = baixoEstoque;
    return NextResponse.json(data);
  } catch (error) {
      return handleApiError(error);
    } 
}
