import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


/**
 * @swagger
 * /api/movimentacoes:
 *   get:
 *     summary: Listar todas as movimentações
 *     tags:
 *       - Movimentacoes
 *
 *     responses:
 *       200:
 *         description: Lista de movimentações retornada com sucesso
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
 *                   data_hora:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-01-01T10:00:00Z
 *
 *                   tipo:
 *                     type: string
 *                     example: AJUSTE
 *
 *                   motivo:
 *                     type: string
 *                     example: Inventário físico realizado
 *
 *                   saldo_anterior:
 *                     type: integer
 *                     example: 5
 *
 *                   saldo_posterior:
 *                     type: integer
 *                     example: 10
 *
 *                   responsavel:
 *                     type: string
 *                     example: Gabriel Santos
 *
 *                   itensMovimentacaoId:
 *                     type: integer
 *                     example: 1
 *
 *                   posicaoEstoqueId:
 *                     type: integer
 *                     example: 2
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = await prisma.movimentacao.findMany();
  return NextResponse.json(data);
}

/**
 * @swagger
 * /api/movimentacoes:
 *   post:
 *     summary: Criar uma nova movimentação de estoque
 *     tags:
 *       - Movimentacoes
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - motivo
 *               - saldo_anterior
 *               - saldo_posterior
 *               - responsavel
 *               - itensMovimentacaoId
 *               - posicaoEstoqueId
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: AJUSTE
 *
 *               motivo:
 *                 type: string
 *                 example: Inventário físico realizado
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
 *         description: Movimentação criada com sucesso
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
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.movimentacao.create({
    data: body,
  });

  return NextResponse.json(novo);
}
