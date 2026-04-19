import { NextRequest, NextResponse } from "next/server";
import { buscarAlertasEstoqueMinimo } from "@/app/services/alerta.service";



/**
 * @swagger
 * /api/alertas/estoque-minimo:
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
 *                       produto:
 *                         type: string
 *                         example: "Air Max"
 *
 *                       estoque_atual:
 *                         type: integer
 *                         example: 2
 *
 *                       estoque_minimo:
 *                         type: integer
 *                         example: 5
 *
 *                       status:
 *                         type: string
 *                         example: "BAIXO"
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
