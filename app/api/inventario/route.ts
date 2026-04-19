import { NextRequest, NextResponse } from "next/server";
import { realizarInventario } from "@/app/services/inventario.service";


/**
 * @swagger
 * components:
 *   schemas:
 *     InventarioInput:
 *       type: object
 *       required:
 *         - posicaoEstoqueId
 *         - quantidadeFisica
 *         - itensMovimentacaoId
 *         - responsavel
 *       properties:
 *         posicaoEstoqueId:
 *           type: integer
 *           example: 1
 *
 *         quantidadeFisica:
 *           type: integer
 *           example: 10
 *
 *         itensMovimentacaoId:
 *           type: integer
 *           example: 100
 *
 *         responsavel:
 *           type: string
 *           example: "Gabriel Santos"
 *
 *     Movimentacao:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *
 *         data_hora:
 *           type: string
 *           format: date-time
 *
 *         tipo:
 *           type: string
 *           example: "AJUSTE"
 *
 *         motivo:
 *           type: string
 *           example: "Inventário físico realizado. Divergência de 5"
 *
 *         saldo_anterior:
 *           type: integer
 *           example: 5
 *
 *         saldo_posterior:
 *           type: integer
 *           example: 10
 *
 *         responsavel:
 *           type: string
 *           example: "Gabriel Santos"
 *
 *         itensMovimentacaoId:
 *           type: integer
 *
 *         posicaoEstoqueId:
 *           type: integer
 *
 *     InventarioResponse:
 *       type: object
 *       properties:
 *         movimentacao:
 *           $ref: '#/components/schemas/Movimentacao'
 *
 *         divergencia:
 *           type: integer
 *           example: 5
 *
 *         quantidadeSistema:
 *           type: integer
 *           example: 5
 *
 *         quantidadeFisica:
 *           type: integer
 *           example: 10
 *
 * /api/inventario:
 *   post:
 *     summary: Realizar inventário de estoque (ajuste de saldo)
 *     tags:
 *       - Inventario
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioInput'
 *
 *     responses:
 *       200:
 *         description: Inventário realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventarioResponse'
 *
 *       400:
 *         description: Erro de validação ou regra de negócio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Posição de estoque não encontrada"
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await realizarInventario(body);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }
  }
}
