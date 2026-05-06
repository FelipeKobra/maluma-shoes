import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { gerarRelatorioMovimentacao } from "@/app/services/movimentacao.service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const searchParams = req.nextUrl.searchParams;

    const relCsv = await gerarRelatorioMovimentacao({
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      tipo: searchParams.get("tipo") || undefined,
    });

    return new NextResponse(relCsv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=relatorio_movimentacoes.csv',
        },
    });
  } catch (error) {
        return handleApiError(error);
    } 
}