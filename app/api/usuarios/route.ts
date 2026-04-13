import { NextRequest, NextResponse } from "next/server";
import { criarUsuario } from "@/app/services/usuario.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const usuario = await criarUsuario(body);

    return NextResponse.json(usuario);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
