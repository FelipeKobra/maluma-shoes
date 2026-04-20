import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/posicao-estoque/{id}:
 *   get:
 *     summary: Buscar posição de estoque por ID
 *     tags:
 *       - PosicaoEstoque
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da posição de estoque
 *
 *     responses:
 *       200:
 *         description: Posição de estoque encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 cod_localizacao:
 *                   type: string
 *                   example: "A1-B2"
 *
 *                 quantidade_atual:
 *                   type: integer
 *                   example: 50
 *
 *                 quantidade_minimo:
 *                   type: integer
 *                   example: 10
 *
 *                 quantidade_maximo:
 *                   type: integer
 *                   example: 100
 *
 *                 ultimo_abastecimento:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: "2026-04-18T10:00:00Z"
 *
 *                 ultima_contagem:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-19T15:00:00Z"
 *
 *                 para_mostruario:
 *                   type: boolean
 *                   example: false
 *
 *       404:
 *         description: Posição de estoque não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const item = await prisma.posicaoEstoque.findUnique({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json(item);
}

/**
 * @swagger
 * /api/posicao-estoque/{id}:
 *   put:
 *     summary: Atualizar posição de estoque
 *     tags:
 *       - PosicaoEstoque
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da posição de estoque
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade_atual:
 *                 type: integer
 *                 example: 50
 *
 *               quantidade_minimo:
 *                 type: integer
 *                 example: 10
 *
 *               quantidade_maximo:
 *                 type: integer
 *                 example: 100
 *
 *               ultima_contagem:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-20T10:00:00Z"
 *
 *               para_mostruario:
 *                 type: boolean
 *                 example: false
 *
 *     responses:
 *       200:
 *         description: Posição de estoque atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 cod_localizacao:
 *                   type: string
 *                   example: "A1-B2"
 *
 *                 quantidade_atual:
 *                   type: integer
 *                   example: 50
 *
 *                 quantidade_minimo:
 *                   type: integer
 *                   example: 10
 *
 *                 quantidade_maximo:
 *                   type: integer
 *                   example: 100
 *
 *                 ultimo_abastecimento:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: "2026-04-18T10:00:00Z"
 *
 *                 ultima_contagem:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-20T10:00:00Z"
 *
 *                 para_mostruario:
 *                   type: boolean
 *                   example: false
 *
 *       400:
 *         description: Dados inválidos
 *
 *       404:
 *         description: Posição de estoque não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();

  const atualizado = await prisma.posicaoEstoque.update({
    where: { id: Number((await params).id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}

/**
 * @swagger
 * /api/posicao-estoque/{id}:
 *   delete:
 *     summary: Deletar uma posição de estoque
 *     tags:
 *       - PosicaoEstoque
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da posição de estoque
 *
 *     responses:
 *       200:
 *         description: Posição de estoque deletada com sucesso
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
 *         description: Posição de estoque não encontrada
 *
 *       409:
 *         description: Não é possível deletar pois existem movimentações vinculadas
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await prisma.posicaoEstoque.delete({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
