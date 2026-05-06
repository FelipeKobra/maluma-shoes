import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { alterarUsuario } from "@/app/services/usuario.service";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export async function PUT( req: Request,
  { params }: { params: Promise<{ id: string }> },) {
  try {
    const idParam = (await params).id;

    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const body = await req.json();

    const usuario = await alterarUsuario(idParam, body);

    return NextResponse.json(usuario);
  } catch (error) {
      return handleApiError(error);
    } 
}