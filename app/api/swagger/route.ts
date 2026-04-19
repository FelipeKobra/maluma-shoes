import { NextResponse } from "next/server";
import spec from "../../lib/swagger-spec";

export async function GET() {
  return NextResponse.json(spec);
}