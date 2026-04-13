import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

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