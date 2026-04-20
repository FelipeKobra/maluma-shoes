import { register } from "@/app/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags:
 *       - Auth
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Usuario da Silva"
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@email.com"
 *
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *
 *                 nome:
 *                   type: string
 *                   example: "Gabriel Santos"
 *
 *                 email:
 *                   type: string
 *                   example: "usuario@email.com"
 *
 *                 role:
 *                   type: string
 *                   example: "USER"
 *
 *                 senha:
 *                   type: string
 *                   example: "$2b$10$hashbcrypt..."
 *
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-20T12:00:00Z"
 *
 *       400:
 *         description: Dados inválidos ou usuário já existe
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const usuario = await register(body.nome, body.email, body.senha);

  return NextResponse.json(usuario);
}
