import { baixoEstoque } from "@/app/services/estoque.service";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/posicao-estoque/minimo:
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
 *                   id:
 *                     type: integer
 *                     example: 1
 *
 *                   cod_localizacao:
 *                     type: string
 *                     example: "A1-B2"
 *
 *                   quantidade_atual:
 *                     type: integer
 *                     example: 3
 *
 *                   quantidade_minimo:
 *                     type: integer
 *                     example: 10
 *
 *                   quantidade_maximo:
 *                     type: integer
 *                     example: 50
 *
 *                   ultimo_abastecimento:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: "2026-04-18T10:00:00Z"
 *
 *                   ultima_contagem:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-04-19T15:00:00Z"
 *
 *                   para_mostruario:
 *                     type: boolean
 *                     example: false
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = baixoEstoque;
  return NextResponse.json(data);
}
