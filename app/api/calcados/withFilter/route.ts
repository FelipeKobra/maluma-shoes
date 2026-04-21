import { NextRequest, NextResponse } from "next/server";
import { buscarCalcados } from "@/app/services/calcados.service";
import { verifyToken } from "@/app/middleware/auth";
import { authorize } from "@/app/middleware/role";
import { Usuario } from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {

    const user = await verifyToken(req) as Usuario; 
    authorize(user.role, ["OPERADOR", "ADMIN"]);

    const searchParams = req.nextUrl.searchParams;

    const result = await buscarCalcados({
      id: searchParams.get("id") || undefined,
      codigo_barras: searchParams.get("codigo_barras") || undefined,
      modelo: searchParams.get("modelo") || undefined,
      marca: searchParams.get("marca") || undefined,
      numeracao: searchParams.get("numeracao") || undefined,
      cor_primaria: searchParams.get("cor_primaria") || undefined,
      cor_secundaria: searchParams.get("cor_secundaria") || undefined,
      material: searchParams.get("material") || undefined,
      genero: searchParams.get("genero") || undefined,
      categoria: searchParams.get("categoria") || undefined,
      status: searchParams.get("status") || undefined,
      precoMin: searchParams.get("precoMin") || undefined,
      precoMax: searchParams.get("precoMax") || undefined,

      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }
  }
}
