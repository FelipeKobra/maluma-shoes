import { NextRequest, NextResponse } from "next/server";
import { buscarHistoricoMovimentacoes } from "@/app/services/movimentacao.service";


/**
 * @swagger
 * /api/movimentacoes/historico:
 *   get:
 *     summary: Listar histórico de movimentações com filtros
 *     tags:
 *       - Movimentacoes
 *
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           example: AJUSTE
 *         description: "Tipo da movimentação (ex: ENTRADA, SAIDA, AJUSTE)"
 *
 *       - in: query
 *         name: responsavel
 *         schema:
 *           type: string
 *           example: Gabriel
 *         description: Nome do responsável
 *
 *       - in: query
 *         name: motivo
 *         schema:
 *           type: string
 *           example: Inventário
 *         description: Motivo da movimentação
 *
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-01-01T00:00:00Z
 *         description: Data inicial do filtro
 *
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-12-31T23:59:59Z
 *         description: Data final do filtro
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página atual
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *
 *     responses:
 *       200:
 *         description: Histórico de movimentações retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *
 *                       tipo:
 *                         type: string
 *                         example: AJUSTE
 *
 *                       motivo:
 *                         type: string
 *                         example: Inventário físico realizado
 *
 *                       saldo_anterior:
 *                         type: integer
 *
 *                       saldo_posterior:
 *                         type: integer
 *
 *                       responsavel:
 *                         type: string
 *
 *                       data_hora:
 *                         type: string
 *                         format: date-time
 *
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *
 *                     page:
 *                       type: integer
 *                       example: 1
 *
 *                     limit:
 *                       type: integer
 *                       example: 10
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const result = await buscarHistoricoMovimentacoes({
      tipo: searchParams.get("tipo") || undefined,
      responsavel: searchParams.get("responsavel") || undefined,
      motivo: searchParams.get("motivo") || undefined,
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
