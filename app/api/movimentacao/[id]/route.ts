import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/movimentacao/{id}:
 *   get:
 *     summary: Buscar movimentação por ID
 *     tags:
 *       - Movimentacoes
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da movimentação
 *
 *     responses:
 *       200:
 *         description: Movimentação encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 data_hora:
 *                   type: string
 *                   format: date-time
 *
 *                 tipo:
 *                   type: string
 *                   example: AJUSTE
 *
 *                 motivo:
 *                   type: string
 *                   example: Inventário físico realizado
 *
 *                 saldo_anterior:
 *                   type: integer
 *                   example: 5
 *
 *                 saldo_posterior:
 *                   type: integer
 *                   example: 10
 *
 *                 responsavel:
 *                   type: string
 *                   example: Gabriel Santos
 *
 *                 itensMovimentacaoId:
 *                   type: integer
 *                   example: 1
 *
 *                 posicaoEstoqueId:
 *                   type: integer
 *                   example: 2
 *
 *       404:
 *         description: Movimentação não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const item = await prisma.movimentacao.findUnique({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json(item);
}

/**
 * @swagger
 * /api/movimentacao/{id}:
 *   put:
 *     summary: Atualizar movimentação
 *     tags:
 *       - Movimentacoes
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da movimentação
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: AJUSTE
 *
 *               motivo:
 *                 type: string
 *                 example: Correção manual de estoque
 *
 *               saldo_anterior:
 *                 type: integer
 *                 example: 5
 *
 *               saldo_posterior:
 *                 type: integer
 *                 example: 10
 *
 *               responsavel:
 *                 type: string
 *                 example: Gabriel Santos
 *
 *               itensMovimentacaoId:
 *                 type: integer
 *                 example: 1
 *
 *               posicaoEstoqueId:
 *                 type: integer
 *                 example: 2
 *
 *     responses:
 *       200:
 *         description: Movimentação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *
 *                 data_hora:
 *                   type: string
 *                   format: date-time
 *
 *                 tipo:
 *                   type: string
 *
 *                 motivo:
 *                   type: string
 *
 *                 saldo_anterior:
 *                   type: integer
 *
 *                 saldo_posterior:
 *                   type: integer
 *
 *                 responsavel:
 *                   type: string
 *
 *                 itensMovimentacaoId:
 *                   type: integer
 *
 *                 posicaoEstoqueId:
 *                   type: integer
 *
 *       400:
 *         description: Dados inválidos
 *
 *       404:
 *         description: Movimentação não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();

  const atualizado = await prisma.movimentacao.update({
    where: { id: Number((await params).id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}


/**
 * @swagger
 * /api/movimentacao/{id}:
 *   delete:
 *     summary: Deletar uma movimentação
 *     tags:
 *       - Movimentacoes
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da movimentação
 *
 *     responses:
 *       200:
 *         description: Movimentação deletada com sucesso
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
 *         description: Movimentação não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await prisma.movimentacao.delete({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
