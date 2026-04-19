import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/itens-movimentacao:
 *   get:
 *     summary: Listar todos os itens de movimentação
 *     tags:
 *       - ItensMovimentacao
 *
 *     responses:
 *       200:
 *         description: Lista de itens de movimentação retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *
 *                   preco_unitario:
 *                     type: number
 *                     format: float
 *                     example: 99.90
 *
 *                   quantidade:
 *                     type: integer
 *                     example: 2
 *
 *                   subtotal:
 *                     type: number
 *                     format: float
 *                     example: 199.80
 *
 *                   calcadosId:
 *                     type: integer
 *                     example: 1
 *
 *                   ordemMovimentacaoId:
 *                     type: integer
 *                     example: 10
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = await prisma.itensMovimentacao.findMany();
  return NextResponse.json(data);
}


/**
 * @swagger
 * /api/itens-movimentacao:
 *   post:
 *     summary: Criar um novo item de movimentação
 *     tags:
 *       - ItensMovimentacao
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preco_unitario
 *               - quantidade
 *               - calcadosId
 *               - ordemMovimentacaoId
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
 *               calcadosId:
 *                 type: integer
 *                 example: 1
 *
 *               ordemMovimentacaoId:
 *                 type: integer
 *                 example: 10
 *
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 preco_unitario:
 *                   type: number
 *                   example: 99.90
 *
 *                 quantidade:
 *                   type: integer
 *                   example: 2
 *
 *                 subtotal:
 *                   type: number
 *                   example: 199.80
 *
 *                 calcadosId:
 *                   type: integer
 *                   example: 1
 *
 *                 ordemMovimentacaoId:
 *                   type: integer
 *                   example: 10
 *
 *       400:
 *         description: Dados inválidos
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.itensMovimentacao.create({
    data: body,
  });

  return NextResponse.json(novo);
}
