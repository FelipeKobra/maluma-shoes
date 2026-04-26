import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { ApiError } from "../lib/apiError";

export async function criarUsuario(data: {
  nome: string;
  email: string;
  senha: string;
  role: "ADMIN" | "OPERADOR" | "GESTOR";
}) {
  const hash = await bcrypt.hash(data.senha, 10);

  return prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      senha: hash,
      role: data.role,
    },
  });
}

export async function alterarUsuario(id: string, data: {
  nome: string;
  email: string;
  senha: string;
  role: "ADMIN" | "OPERADOR";
}) {
  const hash = await bcrypt.hash(data.senha, 10);

  const user = await prisma.usuario.findUnique({
      where: { id: Number(id) },
  });

  if(user === null) throw new ApiError("Usuario não encontrado", 404);

  const atualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nome: data.nome,
        email: data.email,
        senha: hash,
        role: data.role,
    },
  });

  return atualizado;
}
