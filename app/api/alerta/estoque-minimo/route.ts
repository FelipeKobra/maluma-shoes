import { NextRequest, NextResponse } from "next/server";
import { buscarAlertasEstoqueMinimo } from "@/app/services/alerta.service";



/**
 * @swagger
 * /api/alerta/estoque-minimo:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Listar alertas de estoque mínimo
 *     tags:
 *       - Alertas
 *
 *     parameters:
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
 *         description: Lista de alertas retornada com sucesso
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
 *                       cod_localizacao:
 *                         type: string
 *                         example: "A1-B2"
 *
 *                       quantidade_atual:
 *                         type: integer
 *                         example: 2
 *
 *                       quantidade_minimo:
 *                         type: integer
 *                         example: 5
 *
 *                       quantidade_maximo:
 *                         type: integer
 *                         example: 20
 *
 *                       ultimo_abastecimento:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2026-04-20T10:00:00Z"
 *
 *                       ultima_contagem:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-04-19T15:30:00Z"
 *
 *                       para_mostruario:
 *                         type: boolean
 *                         example: false
 *
 *                       movimentacoes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 100
 *
 *                             data_hora:
 *                               type: string
 *                               format: date-time
 *                               example: "2026-04-20T12:00:00Z"
 *
 *                             tipo:
 *                               type: string
 *                               example: "ENTRADA"
 *
 *                             motivo:
 *                               type: string
 *                               example: "Reposição"
 *
 *                             saldo_anterior:
 *                               type: integer
 *                               example: 1
 *
 *                             saldo_posterior:
 *                               type: integer
 *                               example: 2
 *
 *                             responsavel:
 *                               type: string
 *                               example: "João Silva"
 *
 *                             itensMovimentacaoId:
 *                               type: integer
 *                               example: 10
 *
 *                             posicaoEstoqueId:
 *                               type: integer
 *                               example: 5
 *
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
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
 *                       example: 5
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const result = await buscarAlertasEstoqueMinimo({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }
    
  } 
}
