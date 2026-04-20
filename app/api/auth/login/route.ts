import { NextRequest, NextResponse } from "next/server";
import { login } from "@/app/services/auth.service";


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realizar login do usuário
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
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@email.com
 *
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "jwt.token.aqui"
 *
 *       401:
 *         description: Credenciais inválidas
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await login(body.email, body.senha);

  return NextResponse.json(result);
}
