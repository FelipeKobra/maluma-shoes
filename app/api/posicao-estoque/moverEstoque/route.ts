import { NextResponse } from "next/server";
import { movimentarEstoque } from "@/app/services/estoque.service";

/**
 * @swagger
 * /api/posicao-estoque/moverEstoque:
 *   post:
 *     summary: Realizar movimentação de estoque (entrada ou saída)
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
 *               - posicaoEstoqueId
 *               - itensMovimentacaoId
 *               - quantidade
 *               - tipo
 *               - motivo
 *               - responsavel
 *             properties:
 *               posicaoEstoqueId:
 *                 type: integer
 *                 example: 1
 *
 *               itensMovimentacaoId:
 *                 type: integer
 *                 example: 10
 *
 *               quantidade:
 *                 type: integer
 *                 example: 5
 *
 *               tipo:
 *                 type: string
 *                 enum: [ENTRADA, SAIDA]
 *                 example: ENTRADA
 *
 *               motivo:
 *                 type: string
 *                 example: Recebimento de mercadoria
 *
 *               responsavel:
 *                 type: string
 *                 example: "Gabriel Santos"
 *
 *     responses:
 *       200:
 *         description: Movimentação realizada com sucesso
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
 *                   example: "2026-04-20T12:00:00Z"
 *
 *                 tipo:
 *                   type: string
 *                   example: "ENTRADA"
 *
 *                 motivo:
 *                   type: string
 *                   example: "Recebimento de mercadoria"
 *
 *                 saldo_anterior:
 *                   type: integer
 *                   example: 10
 *
 *                 saldo_posterior:
 *                   type: integer
 *                   example: 15
 *
 *                 responsavel:
 *                   type: string
 *                   example: "Gabriel Santos"
 *
 *                 itensMovimentacaoId:
 *                   type: integer
 *                   example: 10
 *
 *                 posicaoEstoqueId:
 *                   type: integer
 *                   example: 1
 *
 *       400:
 *         description: Erro de validação ou regra de negócio
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await movimentarEstoque(body);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 400 });
  }
}
