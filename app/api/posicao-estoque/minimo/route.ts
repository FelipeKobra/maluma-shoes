import { baixoEstoque } from "@/app/services/estoque.service";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";
import { handleApiError } from "@/app/lib/handler-erros";

interface PosicaoBruta {
  id: number;
  cod_localizacao: string;
  quantidade_atual: number;
  quantidade_minimo: number;
  quantidade_maximo: number;
  ultimo_abastecimento: Date | string | null;
  ultima_contagem: Date | string;
  para_mostruario: boolean;
  movimentacoes: Array<{
    itensMovimentacao: {
      calcados: {
        modelo: string;
        marca: string;
      };
    };
  }>;
}

export async function GET(req: Request) {
  try {
    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    // Recebe o dado bruto (que contém o array completo de movimentações)
    const data = await baixoEstoque as unknown as PosicaoBruta[];

    const formattedData = data.map((item) => {
      // Extraímos os dados apenas da primeira movimentação [0]
      const primeiraMov = item.movimentacoes[0]?.itensMovimentacao;
      const calcado = primeiraMov?.calcados;
      
      return {
        id: item.id,
        cod_localizacao: item.cod_localizacao,
        quantidade_atual: item.quantidade_atual,
        quantidade_minimo: item.quantidade_minimo,
        quantidade_maximo: item.quantidade_maximo,
        ultimo_abastecimento: item.ultimo_abastecimento,
        ultima_contagem: item.ultima_contagem,
        para_mostruario: item.para_mostruario,
        // Atribui os valores ou "N/A" caso não exista movimentação
        modelo: calcado?.modelo ?? "N/A",
        marca: calcado?.marca ?? "N/A"
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    return handleApiError(error);
  } 
}
