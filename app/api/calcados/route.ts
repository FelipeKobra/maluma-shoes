import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/calcados:
 *   get:
 *     summary: Listar todos os calçados
 *     tags:
 *       - Calcados
 *
 *     responses:
 *       200:
 *         description: Lista de calçados retornada com sucesso
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
 *                   codigo_barras:
 *                     type: string
 *                     example: "1234567890123"
 *
 *                   modelo:
 *                     type: string
 *                     example: "Air Max"
 *
 *                   marca:
 *                     type: string
 *                     example: "Nike"
 *
 *                   descricao:
 *                     type: string
 *                     example: "Tênis esportivo"
 *
 *                   numeracao:
 *                     type: integer
 *                     example: 42
 *
 *                   cor_primaria:
 *                     type: string
 *                     example: "Preto"
 *
 *                   cor_secundaria:
 *                     type: string
 *                     example: "Branco"
 *
 *                   material:
 *                     type: string
 *                     example: "Couro"
 *
 *                   genero:
 *                     type: string
 *                     example: "Masculino"
 *
 *                   categoria:
 *                     type: string
 *                     example: "Esportivo"
 *
 *                   preco_venda:
 *                     type: number
 *                     format: float
 *                     example: 499.9
 *
 *                   peso:
 *                     type: number
 *                     format: float
 *                     example: 0.8
 *
 *                   dimensao:
 *                     type: string
 *                     example: "30x20x10"
 *
 *                   status:
 *                     type: string
 *                     example: "ATIVO"
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function GET() {
  const data = await prisma.calcados.findMany();
  return NextResponse.json(data);
}


/**
 * @swagger
 * /api/calcados:
 *   post:
 *     summary: Criar um novo calçado
 *     tags:
 *       - Calcados
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelo
 *               - marca
 *               - preco_venda
 *             properties:
 *               codigo_barras:
 *                 type: string
 *                 example: "1234567890123"
 *
 *               modelo:
 *                 type: string
 *                 example: "Air Max"
 *
 *               marca:
 *                 type: string
 *                 example: "Nike"
 *
 *               descricao:
 *                 type: string
 *                 example: "Tênis esportivo"
 *
 *               numeracao:
 *                 type: integer
 *                 example: 42
 *
 *               cor_primaria:
 *                 type: string
 *                 example: "Preto"
 *
 *               cor_secundaria:
 *                 type: string
 *                 example: "Branco"
 *
 *               material:
 *                 type: string
 *                 example: "Couro"
 *
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Unisex]
 *                 example: "Masculino"
 *
 *               categoria:
 *                 type: string
 *                 example: "Esportivo"
 *
 *               preco_venda:
 *                 type: number
 *                 format: float
 *                 example: 499.9
 *
 *               peso:
 *                 type: number
 *                 format: float
 *                 example: 0.8
 *
 *               dimensao:
 *                 type: string
 *                 example: "30x20x10"
 *
 *               status:
 *                 type: string
 *                 enum: [ATIVO, INATIVO]
 *                 example: "ATIVO"
 *
 *     responses:
 *       201:
 *         description: Calçado criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 modelo:
 *                   type: string
 *                   example: "Air Max"
 *
 *                 marca:
 *                   type: string
 *                   example: "Nike"
 *
 *                 preco_venda:
 *                   type: number
 *                   example: 499.9
 *
 *       400:
 *         description: Dados inválidos
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: Request) {
  const body = await req.json();

  const novo = await prisma.calcados.create({
    data: body,
  });

  return NextResponse.json(novo);
}
