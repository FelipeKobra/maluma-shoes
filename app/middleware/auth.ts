import jwt from "jsonwebtoken";
import { ApiError } from "../lib/apiError";


export function verifyToken(req: Request)  {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new ApiError("Não autenticado", 401);
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }

  return jwt.verify(token, secret);
}
