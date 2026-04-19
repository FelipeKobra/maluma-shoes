import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/posicoes-estoque:
 *   get:
 *     summary: Listar todas as posições de estoque
 *     tags:
 *       - PosicaoEstoque
 *
 *     responses:
 *       200:
 *         description: Lista de posições de estoque retornada com sucesso
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
 *                   quantidade_atual:
 *                     type: integer
 *                     example: 50
 *
 *                   quantidade_minima:
 *                     type: integer
 *                     example: 10
 *
 *                   ultima_contagem:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-01-01T10:00:00Z
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = await prisma.posicaoEstoque.findMany();
  return NextResponse.json(data);
}

/**
 * @swagger
 * /api/posicoes-estoque:
 *   post:
 *     summary: Criar uma nova posição de estoque
 *     tags:
 *       - PosicaoEstoque
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade_atual
 *             properties:
 *               quantidade_atual:
 *                 type: integer
 *                 example: 50
 *
 *               quantidade_minima:
 *                 type: integer
 *                 example: 10
 *
 *               ultima_contagem:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-01T10:00:00Z
 *
 *     responses:
 *       201:
 *         description: Posição de estoque criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *
 *                 quantidade_atual:
 *                   type: integer
 *
 *                 quantidade_minima:
 *                   type: integer
 *
 *                 ultima_contagem:
 *                   type: string
 *                   format: date-time
 *
 *       400:
 *         description: Dados inválidos
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.posicaoEstoque.create({
    data: body,
  });

  return NextResponse.json(novo);
}
