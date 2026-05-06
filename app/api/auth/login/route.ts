import { NextRequest, NextResponse } from "next/server";
import { login } from "@/app/services/auth.service";
import { handleApiError } from "@/app/lib/handler-erros";

export async function POST(req: NextRequest) {
  try{
    const body = await req.json();

    const result = await login(body.email, body.senha);

    return NextResponse.json(result);
  } catch (error) {
        return handleApiError(error);
  } 
}
