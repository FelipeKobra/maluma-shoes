import { NextRequest, NextResponse } from "next/server";
import { buscarAlertasEstoqueMinimo } from "@/app/services/alerta.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { prisma } from "@/app/lib/prisma";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { ApiError } from "../../../lib/apiError";



export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const searchParams = req.nextUrl.searchParams;

    const result = await buscarAlertasEstoqueMinimo({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
  } 
}
