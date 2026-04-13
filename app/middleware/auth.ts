import jwt from "jsonwebtoken";

export function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Token ausente");
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }

  return jwt.verify(token, secret);
}
