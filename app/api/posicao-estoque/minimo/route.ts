import { baixoEstoque } from "@/app/services/estoque.service";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/estoque/baixo:
 *   get:
 *     summary: Listar itens com baixo estoque
 *     tags:
 *       - PosicaoEstoque
 *
 *     responses:
 *       200:
 *         description: Lista de itens com estoque abaixo do mínimo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   posicaoEstoqueId:
 *                     type: integer
 *                     example: 1
 *
 *                   produto:
 *                     type: string
 *                     example: "Tênis Nike Air Max"
 *
 *                   quantidade_atual:
 *                     type: integer
 *                     example: 3
 *
 *                   quantidade_minima:
 *                     type: integer
 *                     example: 10
 *
 *                   status:
 *                     type: string
 *                     example: BAIXO_ESTOQUE
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = baixoEstoque;
  return NextResponse.json(data);
}
