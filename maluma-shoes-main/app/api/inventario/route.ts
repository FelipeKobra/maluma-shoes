import { NextRequest, NextResponse } from "next/server";
import { realizarInventario } from "@/app/services/inventario.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    const result = await realizarInventario(body);

    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
  } 
}
