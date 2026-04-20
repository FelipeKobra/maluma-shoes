import { NextRequest, NextResponse } from "next/server";
import { criarUsuario } from "@/app/services/usuario.service";


/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Criar um novo usuário
 *     tags:
 *       - Usuarios
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
 *               - role
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Gabriel Santos"
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "gabriel@email.com"
 *
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OPERADOR, GESTOR]
 *                 example: "OPERADOR"
 *
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
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
 *                   example: "gabriel@email.com"
 * 
 *                 senha:
 *                   type: string
 *                   example: "fjksd3feoo35lsmafno2n4mfo2hgfhfgh44dfg32"
 *
 *                 role:
 *                   type: string
 *                   example: "OPERADOR"
 *
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-04-20T12:00:00Z"
 *
 *       400:
 *         description: Dados inválidos ou erro de validação
 *
 *       500:
 *         description: Erro interno no servidor
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const usuario = await criarUsuario(body);

    return NextResponse.json(usuario);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
