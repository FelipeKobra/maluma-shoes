import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../lib/apiError";

export async function login(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new ApiError("Email ou Senha inválido", 401);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new ApiError("Email ou Senha inválido", 401);
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      role: usuario.role,
      email: usuario.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "8h",
    },
  );

  return { token };
}

export async function register(nome: string, email: string, senha: string) {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuarioExistente) {
    throw new ApiError("Email ja registrado", 401);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  return prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      role: "OPERADOR",
    },
  });
}
