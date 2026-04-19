import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/ordens-movimentacao:
 *   get:
 *     summary: Listar todas as ordens de movimentação
 *     tags:
 *       - OrdensMovimentacao
 *
 *     responses:
 *       200:
 *         description: Lista de ordens retornada com sucesso
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
 *                   data_emissao:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-01-01T10:00:00Z
 *
 *                   empresa:
 *                     type: string
 *                     example: Maluma Shoes LTDA
 *
 *                   cnpj:
 *                     type: string
 *                     example: "12345678000199"
 *
 *                   numero_ordem:
 *                     type: string
 *                     example: ORD-001
 *
 *                   tipo:
 *                     type: string
 *                     example: ENTRADA
 *
 *                   status:
 *                     type: string
 *                     example: FINALIZADA
 *
 *                   valor_total:
 *                     type: number
 *                     example: 999.90
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = await prisma.ordemMovimentacao.findMany();
  return NextResponse.json(data);
}

/**
 * @swagger
 * /api/ordens-movimentacao:
 *   post:
 *     summary: Criar uma nova ordem de movimentação
 *     tags:
 *       - OrdensMovimentacao
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data_emissao
 *               - empresa
 *               - cnpj
 *               - numero_ordem
 *               - tipo
 *               - status
 *             properties:
 *               data_emissao:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-01T10:00:00Z
 *
 *               empresa:
 *                 type: string
 *                 example: "Maluma Shoes LTDA"
 *
 *               cnpj:
 *                 type: string
 *                 example: "12345678000199"
 *
 *               numero_ordem:
 *                 type: string
 *                 example: "ORD-001"
 *
 *               tipo:
 *                 type: string
 *                 example: "ENTRADA"
 *
 *               status:
 *                 type: string
 *                 example: "PENDENTE"
 *
 *               valor_total:
 *                 type: number
 *                 format: float
 *                 example: 999.90
 *
 *     responses:
 *       201:
 *         description: Ordem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *
 *                 data_emissao:
 *                   type: string
 *                   format: date-time
 *
 *                 empresa:
 *                   type: string
 *
 *                 cnpj:
 *                   type: string
 *
 *                 numero_ordem:
 *                   type: string
 *
 *                 tipo:
 *                   type: string
 *
 *                 status:
 *                   type: string
 *
 *                 valor_total:
 *                   type: number
 *
 *       400:
 *         description: Dados inválidos
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.ordemMovimentacao.create({
    data: body,
  });

  return NextResponse.json(novo);
}
