import { NextResponse } from "next/server";
import { movimentarEstoque } from "@/app/services/estoque.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await movimentarEstoque(body);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 });
  }
}
