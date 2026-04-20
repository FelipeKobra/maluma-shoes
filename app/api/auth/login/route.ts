import { NextRequest, NextResponse } from "next/server";
import { login } from "@/app/services/auth.service";


export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await login(body.email, body.senha);

  return NextResponse.json(result);
}
