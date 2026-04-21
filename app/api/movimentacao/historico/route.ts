import { NextRequest, NextResponse } from "next/server";
import { buscarHistoricoMovimentacoes } from "@/app/services/movimentacao.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const searchParams = req.nextUrl.searchParams;

    const result = await buscarHistoricoMovimentacoes({
      tipo: searchParams.get("tipo") || undefined,
      responsavel: searchParams.get("responsavel") || undefined,
      motivo: searchParams.get("motivo") || undefined,
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
