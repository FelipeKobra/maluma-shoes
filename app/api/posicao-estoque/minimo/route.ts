import { baixoEstoque } from "@/app/services/estoque.service";
import { NextResponse } from "next/server";


export async function GET() {
  const data = baixoEstoque;
  return NextResponse.json(data);
}
