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
    throw new ApiError("JWT_SECRET não definido", 401);
  }

  return jwt.verify(token, secret);
}
