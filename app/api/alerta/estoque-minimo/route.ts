import { NextRequest, NextResponse } from "next/server";
import { buscarAlertasEstoqueMinimo } from "@/app/services/alerta.service";




export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const result = await buscarAlertasEstoqueMinimo({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
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
