import { NextRequest, NextResponse } from "next/server";
import { buscarCalcados } from "@/app/services/calcados.service";

/**
 * @swagger
 * /api/calcados/withFilter:
 *   get:
 *     summary: Listar calçados com filtros, paginação e ordenação
 *     tags:
 *       - Calcados
 *
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID do calçado
 *
 *       - in: query
 *         name: codigo_barras
 *         schema:
 *           type: string
 *         description: Código de barras 
 *
 *       - in: query
 *         name: modelo
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: numeracao
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: cor_primaria
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: cor_secundaria
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [Masculino, Feminino, Unisex]
 *
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, INATIVO]
 *
 *       - in: query
 *         name: precoMin
 *         schema:
 *           type: number
 *           format: float
 *         description: Preço mínimo
 *
 *       - in: query
 *         name: precoMax
 *         schema:
 *           type: number
 *           format: float
 *         description: Preço máximo
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
 *         description: Quantidade por página
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: preco_venda
 *         description: Campo para ordenação
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Direção da ordenação
 *
 *     responses:
 *       200:
 *         description: Lista de calçados filtrada com sucesso
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
 *                       modelo:
 *                         type: string
 *                       marca:
 *                         type: string
 *                       preco_venda:
 *                         type: number
 *
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const result = await buscarCalcados({
      id: searchParams.get("id") || undefined,
      codigo_barras: searchParams.get("codigo_barras") || undefined,
      modelo: searchParams.get("modelo") || undefined,
      marca: searchParams.get("marca") || undefined,
      numeracao: searchParams.get("numeracao") || undefined,
      cor_primaria: searchParams.get("cor_primaria") || undefined,
      cor_secundaria: searchParams.get("cor_secundaria") || undefined,
      material: searchParams.get("material") || undefined,
      genero: searchParams.get("genero") || undefined,
      categoria: searchParams.get("categoria") || undefined,
      status: searchParams.get("status") || undefined,
      precoMin: searchParams.get("precoMin") || undefined,
      precoMax: searchParams.get("precoMax") || undefined,

      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
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
