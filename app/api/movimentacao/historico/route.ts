import { NextRequest, NextResponse } from "next/server";
import { buscarHistoricoMovimentacoes } from "@/app/services/movimentacao.service";


/**
 * @swagger
 * /api/movimentacao/historico:
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
 *
 *       - in: query
 *         name: motivo
 *         schema:
 *           type: string
 *           example: Inventário
 *
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-01-01T00:00:00Z
 *
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-12-31T23:59:59Z
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *                         example: 1
 *
 *                       data_hora:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-04-20T12:00:00Z"
 *
 *                       tipo:
 *                         type: string
 *                         example: "AJUSTE"
 *
 *                       motivo:
 *                         type: string
 *                         example: "Inventário físico"
 *
 *                       saldo_anterior:
 *                         type: integer
 *                         example: 10
 *
 *                       saldo_posterior:
 *                         type: integer
 *                         example: 8
 *
 *                       responsavel:
 *                         type: string
 *                         example: "Gabriel"
 *
 *                       itensMovimentacaoId:
 *                         type: integer
 *                         example: 5
 *
 *                       posicaoEstoqueId:
 *                         type: integer
 *                         example: 3
 *
 *                       itensMovimentacao:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *
 *                           preco_unitario:
 *                             type: number
 *                             format: float
 *                             example: 99.90
 *
 *                           quantidade:
 *                             type: integer
 *                             example: 2
 *
 *                           subtotal:
 *                             type: number
 *                             format: float
 *                             example: 199.80
 *
 *                           calcadosId:
 *                             type: integer
 *                             example: 10
 *
 *                           ordemMovimentacaoId:
 *                             type: integer
 *                             example: 1
 *
 *                       posicaoEstoque:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *
 *                           cod_localizacao:
 *                             type: string
 *                             example: "A1-B2"
 *
 *                           quantidade_atual:
 *                             type: integer
 *                             example: 8
 *
 *                           quantidade_minimo:
 *                             type: integer
 *                             example: 5
 *
 *                           quantidade_maximo:
 *                             type: integer
 *                             example: 20
 *
 *                           ultimo_abastecimento:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: "2026-04-18T10:00:00Z"
 *
 *                           ultima_contagem:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-04-19T15:00:00Z"
 *
 *                           para_mostruario:
 *                             type: boolean
 *                             example: false
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
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unknown error occurred"
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
