import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new Error("Senha inválida");
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
    throw new Error("Email já cadastrado");
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
