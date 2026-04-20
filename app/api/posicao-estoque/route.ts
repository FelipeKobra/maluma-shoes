import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/posicao-estoque:
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
 * /api/posicao-estoque:
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
 *               - cod_localizacao
 *               - quantidade_atual
 *             properties:
 *               cod_localizacao:
 *                 type: string
 *                 example: "A1-B2"
 *
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
 *       201:
 *         description: Posição de estoque criada com sucesso
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
 *                   example: "2026-04-20T10:00:00Z"
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
