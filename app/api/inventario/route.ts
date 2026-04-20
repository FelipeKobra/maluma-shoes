import { NextRequest, NextResponse } from "next/server";
import { realizarInventario } from "@/app/services/inventario.service";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await realizarInventario(body);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }
  }
}
