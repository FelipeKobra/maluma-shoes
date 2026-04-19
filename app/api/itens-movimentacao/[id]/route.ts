import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/itens-movimentacao/{id}:
 *   get:
 *     summary: Buscar item de movimentação por ID
 *     tags:
 *       - ItensMovimentacao
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item de movimentação
 *
 *     responses:
 *       200:
 *         description: Item encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 produto_id:
 *                   type: integer
 *                   example: 10
 *
 *                 quantidade:
 *                   type: integer
 *                   example: 5
 *
 *                 tipo:
 *                   type: string
 *                   example: "ENTRADA"
 *
 *                 data_hora:
 *                   type: string
 *                   format: date-time
 *
 *                 observacao:
 *                   type: string
 *                   example: "Entrada de estoque"
 *
 *       404:
 *         description: Item não encontrado
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const item = await prisma.itensMovimentacao.findUnique({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json(item);
}

/**
 * @swagger
 * /api/itens-movimentacao/{id}:
 *   put:
 *     summary: Atualizar item de movimentação
 *     tags:
 *       - ItensMovimentacao
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item de movimentação
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preco_unitario:
 *                 type: number
 *                 format: float
 *                 example: 99.90
 *
 *               quantidade:
 *                 type: integer
 *                 example: 2
 *
 *               subtotal:
 *                 type: number
 *                 format: float
 *                 example: 199.80
 *
 *               calcadosId:
 *                 type: integer
 *                 example: 1
 *
 *               ordemMovimentacaoId:
 *                 type: integer
 *                 example: 10
 *
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *
 *                 preco_unitario:
 *                   type: number
 *
 *                 quantidade:
 *                   type: integer
 *
 *                 subtotal:
 *                   type: number
 *
 *                 calcadosId:
 *                   type: integer
 *
 *                 ordemMovimentacaoId:
 *                   type: integer
 *
 *       400:
 *         description: Dados inválidos
 *
 *       404:
 *         description: Item não encontrado
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();

  const atualizado = await prisma.itensMovimentacao.update({
    where: { id: Number((await params).id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}

/**
 * @swagger
 * /api/itens-movimentacao/{id}:
 *   delete:
 *     summary: Deletar item de movimentação por ID
 *     tags:
 *       - ItensMovimentacao
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item de movimentação
 *
 *     responses:
 *       200:
 *         description: Item deletado com sucesso
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
 *         description: Item não encontrado
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await prisma.itensMovimentacao.delete({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
