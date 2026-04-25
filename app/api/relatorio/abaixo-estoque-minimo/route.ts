import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { gerarRelatorioAbaixoEstoque } from "@/app/services/estoque.service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["ADMIN"]);

    const relCsv = await gerarRelatorioAbaixoEstoque();

    return new NextResponse(relCsv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=relatorio_abaixo_estoque.csv',
        },
    });
  } catch (error) {
        return handleApiError(error);
    } 
}