import { handleApiError } from "@/app/lib/handler-erros";
import { register } from "@/app/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const usuario = await register(body.nome, body.email, body.senha);

    return NextResponse.json(usuario);
  } catch (error) {
        return handleApiError(error);
  } 
}
