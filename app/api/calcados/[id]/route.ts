import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/calcados/{id}:
 *   get:
 *     summary: Buscar calçado por ID
 *     tags:
 *       - Calcados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do calçado
 *     responses:
 *       200:
 *         description: Calçado encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 modelo:
 *                   type: string
 *                 marca:
 *                   type: string
 *                 numeracao:
 *                   type: integer
 *                 preco:
 *                   type: number
 *       404:
 *         description: Calçado não encontrado
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const item = await prisma.calcados.findUnique({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json(item);
}

/**
 * @swagger
 * /api/calcados/{id}:
 *   put:
 *     summary: Atualizar um calçado por ID
 *     tags:
 *       - Calcados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do calçado
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_barras:
 *                 type: string
 *                 example: "1234567890123"
 *
 *               modelo:
 *                 type: string
 *                 example: "Air Max"
 *
 *               marca:
 *                 type: string
 *                 example: "Nike"
 *
 *               descricao:
 *                 type: string
 *                 example: "Tênis"
 *
 *               numeracao:
 *                 type: integer
 *                 example: 45
 *
 *               cor_primaria:
 *                 type: string
 *                 example: "Preto"
 *
 *               cor_secundaria:
 *                 type: string
 *                 example: "Branco"
 *
 *               material:
 *                 type: string
 *                 example: "Couro"
 *
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Unisex]
 *                 example: "Masculino"
 *
 *               categoria:
 *                 type: string
 *                 example: "Esportivo"
 *
 *               preco_venda:
 *                 type: number
 *                 format: float
 *                 example: 499.9
 *
 *               peso:
 *                 type: number
 *                 format: float
 *                 example: 0.8
 *
 *               dimensao:
 *                 type: string
 *                 example: "30x20x10"
 *
 *               status:
 *                 type: string
 *                 enum: [ATIVO, INATIVO]
 *                 example: "ATIVO"
 *
 *     responses:
 *       200:
 *         description: Calçado atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Calçado não encontrado
 *       500:
 *         description: Erro interno no servidor
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();

  const atualizado = await prisma.calcados.update({
    where: { id: Number((await params).id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}

/**
 * @swagger
 * /api/calcados/{id}:
 *   delete:
 *     summary: Deletar um calçado por ID
 *     tags:
 *       - Calcados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do calçado
 *
 *     responses:
 *       200:
 *         description: Calçado deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deletado com sucesso
 *
 *       404:
 *         description: Calçado não encontrado
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await prisma.calcados.delete({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
