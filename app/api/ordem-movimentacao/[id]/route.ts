import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/ordem-movimentacao/{id}:
 *   get:
 *     summary: Buscar ordem de movimentação por ID
 *     tags:
 *       - OrdensMovimentacao
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ordem de movimentação
 *
 *     responses:
 *       200:
 *         description: Ordem encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 data_emissao:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-01T10:00:00Z
 *
 *                 empresa:
 *                   type: string
 *                   example: Maluma Shoes LTDA
 *
 *                 cnpj:
 *                   type: string
 *                   example: "12345678000199"
 *
 *                 numero_ordem:
 *                   type: string
 *                   example: ORD-001
 *
 *                 tipo:
 *                   type: string
 *                   example: ENTRADA
 *
 *                 status:
 *                   type: string
 *                   example: FINALIZADA
 *
 *                 valor_total:
 *                   type: number
 *                   example: 999.90
 *
 *       404:
 *         description: Ordem não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const item = await prisma.ordemMovimentacao.findUnique({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json(item);
}


/**
 * @swagger
 * /api/ordem-movimentacao/{id}:
 *   put:
 *     summary: Atualizar ordem de movimentação
 *     tags:
 *       - OrdensMovimentacao
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ordem de movimentação
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_emissao:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-01T10:00:00Z
 *
 *               empresa:
 *                 type: string
 *                 example: "Maluma Shoes LTDA"
 *
 *               cnpj:
 *                 type: string
 *                 example: "12345678000199"
 *
 *               numero_ordem:
 *                 type: string
 *                 example: "ORD-001"
 *
 *               tipo:
 *                 type: string
 *                 example: "ENTRADA"
 *
 *               status:
 *                 type: string
 *                 example: "FINALIZADA"
 *
 *               valor_total:
 *                 type: number
 *                 format: float
 *                 example: 999.90
 *
 *     responses:
 *       200:
 *         description: Ordem atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *
 *                 data_emissao:
 *                   type: string
 *                   format: date-time
 *
 *                 empresa:
 *                   type: string
 *
 *                 cnpj:
 *                   type: string
 *
 *                 numero_ordem:
 *                   type: string
 *
 *                 tipo:
 *                   type: string
 *
 *                 status:
 *                   type: string
 *
 *                 valor_total:
 *                   type: number
 *
 *       400:
 *         description: Dados inválidos
 *
 *       404:
 *         description: Ordem não encontrada
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();

  const atualizado = await prisma.ordemMovimentacao.update({
    where: { id: Number((await params).id) },
    data: body,
  });

  return NextResponse.json(atualizado);
}

/**
 * @swagger
 * /api/ordem-movimentacao/{id}:
 *   delete:
 *     summary: Deletar uma ordem de movimentação
 *     tags:
 *       - OrdensMovimentacao
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ordem de movimentação
 *
 *     responses:
 *       200:
 *         description: Ordem deletada com sucesso
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
 *         description: Ordem não encontrada
 *
 *       409:
 *         description: Não é possível deletar a ordem pois existem itens vinculados
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await prisma.ordemMovimentacao.delete({
    where: { id: Number((await params).id) },
  });

  return NextResponse.json({ message: "Deletado com sucesso" });
}
