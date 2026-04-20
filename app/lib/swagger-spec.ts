import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Maluma Shoes API",
      version: "1.0.0",
      description: "Documentação Maluma Shoes ",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }], 
    servers: [
      {
        url: "https://maluma-shoes.vercel.app",
        description: "Produção",
      },
      {
        url: "http://localhost:3000",
        description: "Desenvolvimento",
      },
    ],
    paths: {
      "/api/alerta/estoque-minimo": {
        get: {
          security: [{ bearerAuth: [] }],
          summary: "Listar alertas de estoque mínimo",
          tags: ["Alertas"],
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1 },
              description: "Página atual",
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10 },
              description: "Quantidade de itens por página",
            },
          ],
          responses: {
            200: {
              description: "Lista de alertas retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            cod_localizacao: {
                              type: "string",
                              example: "A1-B2",
                            },
                            quantidade_atual: {
                              type: "integer",
                              example: 2,
                            },
                            quantidade_minimo: {
                              type: "integer",
                              example: 5,
                            },
                            quantidade_maximo: {
                              type: "integer",
                              example: 20,
                            },
                            ultimo_abastecimento: {
                              type: "string",
                              format: "date-time",
                              nullable: true,
                            },
                            ultima_contagem: {
                              type: "string",
                              format: "date-time",
                            },
                            para_mostruario: {
                              type: "boolean",
                              example: false,
                            },
                            movimentacoes: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer" },
                                  data_hora: {
                                    type: "string",
                                    format: "date-time",
                                  },
                                  tipo: { type: "string" },
                                  motivo: { type: "string" },
                                  saldo_anterior: { type: "integer" },
                                  saldo_posterior: { type: "integer" },
                                  responsavel: { type: "string" },
                                  itensMovimentacaoId: {
                                    type: "integer",
                                  },
                                  posicaoEstoqueId: {
                                    type: "integer",
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      meta: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          totalPages: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Erro interno no servidor",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Realizar login do usuário",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "senha"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "usuario@email.com",
                    },
                    senha: {
                      type: "string",
                      format: "password",
                      example: "123456",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login realizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        example: "jwt.token.aqui",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Credenciais inválidas",
            },
            500: {
              description: "Erro interno no servidor",
            },
          },
        },
      },
      "/api/auth/register": {
        post: {
          summary: "Registrar um novo usuário",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nome", "email", "senha"],
                  properties: {
                    nome: {
                      type: "string",
                      example: "Usuario da Silva",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      example: "usuario@email.com",
                    },
                    senha: {
                      type: "string",
                      format: "password",
                      example: "123456",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Usuário registrado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                      },
                      nome: {
                        type: "string",
                        example: "Gabriel Santos",
                      },
                      email: {
                        type: "string",
                        example: "usuario@email.com",
                      },
                      role: {
                        type: "string",
                        example: "USER",
                      },
                      senha: {
                        type: "string",
                        example: "$2b$10$hashbcrypt...",
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-20T12:00:00Z",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos ou usuário já existe",
            },
            500: {
              description: "Erro interno no servidor",
            },
          },
        },
      },
      "/api/calcados/{id}": {
        get: {
          summary: "Buscar calçado por ID",
          tags: ["Calcados"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer",
              },
              description: "ID do calçado",
            },
          ],
          responses: {
            200: {
              description: "Calçado encontrado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                      },
                      status: {
                        type: "string",
                        example: "ATIVO",
                      },
                      codigo_barras: {
                        type: "string",
                        example: "7891234567890",
                      },
                      modelo: {
                        type: "string",
                        example: "Air Max",
                      },
                      marca: {
                        type: "string",
                        example: "Nike",
                      },
                      descricao: {
                        type: "string",
                        example: "Tênis esportivo confortável",
                      },
                      numeracao: {
                        type: "integer",
                        example: 42,
                      },
                      cor_primaria: {
                        type: "string",
                        example: "Preto",
                      },
                      cor_secundaria: {
                        type: "string",
                        example: "Branco",
                      },
                      material: {
                        type: "string",
                        example: "Couro",
                      },
                      genero: {
                        type: "string",
                        example: "Masculino",
                      },
                      categoria: {
                        type: "string",
                        example: "Esportivo",
                      },
                      preco_venda: {
                        type: "number",
                        format: "float",
                        example: 299.9,
                      },
                      peso: {
                        type: "number",
                        format: "float",
                        example: 0.8,
                      },
                      dimensao: {
                        type: "string",
                        example: "30x20x10 cm",
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: "Calçado não encontrado",
            },
            500: {
              description: "Erro interno no servidor",
            },
          },
        },
      put: {
        summary: "Atualizar um calçado por ID",
        tags: ["Calcados"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer"
            },
            description: "ID do calçado"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  codigo_barras: { type: "string", example: "1234567890123" },
                  modelo: { type: "string", example: "Air Max" },
                  marca: { type: "string", example: "Nike" },
                  descricao: { type: "string", example: "Tênis" },
                  numeracao: { type: "integer", example: 45 },
                  cor_primaria: { type: "string", example: "Preto" },
                  cor_secundaria: { type: "string", example: "Branco" },
                  material: { type: "string", example: "Couro" },
                  genero: { 
                    type: "string", 
                    enum: ["Masculino", "Feminino", "Unisex"], 
                    example: "Masculino" 
                  },
                  categoria: { type: "string", example: "Esportivo" },
                  preco_venda: { type: "number", format: "float", example: 499.9 },
                  peso: { type: "number", format: "float", example: 0.8 },
                  dimensao: { type: "string", example: "30x20x10" },
                  status: { 
                    type: "string", 
                    enum: ["ATIVO", "INATIVO"], 
                    example: "ATIVO" 
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Calçado atualizado com sucesso" },
          400: { description: "Dados inválidos" },
          404: { description: "Calçado não encontrado" },
          500: { description: "Erro interno no servidor" }
        }
      },
      delete: {
        summary: "Deletar um calçado por ID",
        tags: ["Calcados"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer"
            },
            description: "ID do calçado"
          }
        ],
        responses: {
          200: {
            description: "Calçado deletado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Deletado com sucesso"
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Calçado não encontrado"
          },
          500: {
            description: "Erro interno no servidor"
          }
        }
      },
    },
    "/api/calcados/withFilter": {
      get: {
        summary: "Listar calçados com filtros, paginação e ordenação",
        tags: ["Calcados"],
        parameters: [
          { in: "query", name: "id", schema: { type: "integer" }, description: "ID do calçado" },
          { in: "query", name: "codigo_barras", schema: { type: "string" }, description: "Código de barras" },
          { in: "query", name: "modelo", schema: { type: "string" } },
          { in: "query", name: "marca", schema: { type: "string" } },
          { in: "query", name: "numeracao", schema: { type: "integer" } },
          { in: "query", name: "cor_primaria", schema: { type: "string" } },
          { in: "query", name: "cor_secundaria", schema: { type: "string" } },
          { in: "query", name: "material", schema: { type: "string" } },
          { 
            in: "query", 
            name: "genero", 
            schema: { 
              type: "string", 
              enum: ["Masculino", "Feminino", "Unisex"] 
            } 
          },
          { in: "query", name: "categoria", schema: { type: "string" } },
          { 
            in: "query", 
            name: "status", 
            schema: { 
              type: "string", 
              enum: ["ATIVO", "INATIVO"] 
            } 
          },
          { in: "query", name: "precoMin", schema: { type: "number", format: "float" }, description: "Preço mínimo" },
          { in: "query", name: "precoMax", schema: { type: "number", format: "float" }, description: "Preço máximo" },
          { in: "query", name: "page", schema: { type: "integer", default: 1 }, description: "Página atual" },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 }, description: "Quantidade por página" },
          { in: "query", name: "sort", schema: { type: "string", example: "preco_venda" }, description: "Campo para ordenação" },
          { 
            in: "query", 
            name: "order", 
            schema: { 
              type: "string", 
              enum: ["asc", "desc"], 
              default: "asc" 
            }, 
            description: "Direção da ordenação" 
          }
        ],
        responses: {
          200: {
            description: "Lista de calçados filtrada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          status: { type: "string", example: "ATIVO" },
                          codigo_barras: { type: "string", example: "7891234567890" },
                          modelo: { type: "string", example: "Air Max" },
                          marca: { type: "string", example: "Nike" },
                          descricao: { type: "string", example: "Tênis esportivo confortável" },
                          numeracao: { type: "integer", example: 42 },
                          cor_primaria: { type: "string", example: "Preto" },
                          cor_secundaria: { type: "string", example: "Branco" },
                          material: { type: "string", example: "Couro" },
                          genero: { type: "string", example: "Masculino" },
                          categoria: { type: "string", example: "Esportivo" },
                          preco_venda: { type: "number", format: "float", example: 299.90 },
                          peso: { type: "number", format: "float", example: 0.8 },
                          dimensao: { type: "string", example: "30x20x10 cm" }
                        }
                      }
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer", example: 100 },
                        page: { type: { type: "integer" }, example: 1 },
                        limit: { type: { type: "integer" }, example: 10 },
                        totalPages: { type: { type: "integer" }, example: 10 }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Erro interno no servidor"
          }
        }
      }
    },
    "/api/calcados": {
        get: {
          summary: "Listar todos os calçados",
          tags: ["Calcados"],
          responses: {
            200: {
              description: "Lista de calçados retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        codigo_barras: { type: "string", example: "1234567890123" },
                        modelo: { type: "string", example: "Air Max" },
                        marca: { type: "string", example: "Nike" },
                        descricao: { type: "string", example: "Tênis esportivo" },
                        numeracao: { type: "integer", example: 42 },
                        cor_primaria: { type: "string", example: "Preto" },
                        cor_secundaria: { type: "string", example: "Branco" },
                        material: { type: "string", example: "Couro" },
                        genero: { type: "string", example: "Masculino" },
                        categoria: { type: "string", example: "Esportivo" },
                        preco_venda: { type: "number", format: "float", example: 499.9 },
                        peso: { type: "number", format: "float", example: 0.8 },
                        dimensao: { type: "string", example: "30x20x10" },
                        status: { type: "string", example: "ATIVO" }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        post: {
          summary: "Criar um novo calçado",
          tags: ["Calcados"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["modelo", "marca", "preco_venda"],
                  properties: {
                    codigo_barras: { type: "string", example: "1234567890123" },
                    modelo: { type: "string", example: "Air Max" },
                    marca: { type: "string", example: "Nike" },
                    descricao: { type: "string", example: "Tênis esportivo" },
                    numeracao: { type: "integer", example: 42 },
                    cor_primaria: { type: "string", example: "Preto" },
                    cor_secundaria: { type: "string", example: "Branco" },
                    material: { type: "string", example: "Couro" },
                    genero: { 
                      type: "string", 
                      enum: ["Masculino", "Feminino", "Unisex"], 
                      example: "Masculino" 
                    },
                    categoria: { type: "string", example: "Esportivo" },
                    preco_venda: { type: "number", format: "float", example: 499.9 },
                    peso: { type: "number", format: "float", example: 0.8 },
                    dimensao: { type: "string", example: "30x20x10" },
                    status: { 
                      type: "string", 
                      enum: ["ATIVO", "INATIVO"], 
                      example: "ATIVO" 
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Calçado criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      status: { type: "string", example: "ATIVO" },
                      codigo_barras: { type: "string", example: "1234567890123" },
                      modelo: { type: "string", example: "Air Max" },
                      marca: { type: "string", example: "Nike" },
                      descricao: { type: "string", example: "Tênis esportivo" },
                      numeracao: { type: "integer", example: 42 },
                      cor_primaria: { type: "string", example: "Preto" },
                      cor_secundaria: { type: "string", example: "Branco" },
                      material: { type: "string", example: "Couro" },
                      genero: { type: "string", example: "Masculino" },
                      categoria: { type: "string", example: "Esportivo" },
                      preco_venda: { type: "number", format: "float", example: 499.9 },
                      peso: { type: "number", format: "float", example: 0.8 },
                      dimensao: { type: "string", example: "30x20x10" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
      "/api/inventario": {
        post: {
          summary: "Realizar inventário de estoque (ajuste de saldo)",
          tags: ["Inventario"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InventarioInput" }
              }
            }
          },
          responses: {
            200: {
              description: "Inventário realizado com sucesso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InventarioResponse" }
                }
              }
            },
            400: {
              description: "Erro de validação ou regra de negócio",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string", example: "Posição de estoque não encontrada" }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
      "/api/itens-movimentacao/{id}": {
        get: {
          summary: "Buscar item de movimentação por ID",
          tags: ["ItensMovimentacao"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID do item de movimentação"
            }
          ],
          responses: {
            200: {
              description: "Item encontrado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      preco_unitario: {
                        type: "number",
                        format: "float",
                        example: 99.90
                      },
                      quantidade: {
                        type: "integer",
                        example: 5
                      },
                      subtotal: {
                        type: "number",
                        format: "float",
                        example: 499.50
                      },
                      calcadosId: {
                        type: "integer",
                        example: 10
                      },
                      ordemMovimentacaoId: {
                        type: "integer",
                        example: 20
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Item não encontrado"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        put: {
          summary: "Atualizar item de movimentação",
          tags: ["ItensMovimentacao"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID do item de movimentação"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    preco_unitario: {
                      type: "number",
                      format: "float",
                      example: 99.90
                    },
                    quantidade: {
                      type: "integer",
                      example: 2
                    },
                    subtotal: {
                      type: "number",
                      format: "float",
                      example: 199.80
                    },
                    calcadosId: {
                      type: "integer",
                      example: 1
                    },
                    ordemMovimentacaoId: {
                      type: "integer",
                      example: 10
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Item atualizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      preco_unitario: { type: "number" },
                      quantidade: { type: "integer" },
                      subtotal: { type: "number" },
                      calcadosId: { type: "integer" },
                      ordemMovimentacaoId: { type: "integer" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            404: {
              description: "Item não encontrado"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        delete: {
          summary: "Deletar item de movimentação por ID",
          tags: ["ItensMovimentacao"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID do item de movimentação"
            }
          ],
          responses: {
            200: {
              description: "Item deletado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Deletado com sucesso"
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Item não encontrado"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
      },
      "/api/itens-movimentacao": {
        get: {
          summary: "Listar todos os itens de movimentação",
          tags: ["ItensMovimentacao"],
          responses: {
            200: {
              description: "Lista de itens de movimentação retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1
                        },
                        preco_unitario: {
                          type: "number",
                          format: "float",
                          example: 99.90
                        },
                        quantidade: {
                          type: "integer",
                          example: 2
                        },
                        subtotal: {
                          type: "number",
                          format: "float",
                          example: 199.80
                        },
                        calcadosId: {
                          type: "integer",
                          example: 1
                        },
                        ordemMovimentacaoId: {
                          type: "integer",
                          example: 10
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        post: {
          summary: "Criar um novo item de movimentação",
          tags: ["ItensMovimentacao"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["preco_unitario", "quantidade", "calcadosId", "ordemMovimentacaoId"],
                  properties: {
                    preco_unitario: {
                      type: "number",
                      format: "float",
                      example: 99.90
                    },
                    quantidade: {
                      type: "integer",
                      example: 2
                    },
                    calcadosId: {
                      type: "integer",
                      example: 1
                    },
                    ordemMovimentacaoId: {
                      type: "integer",
                      example: 10
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Item criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      preco_unitario: {
                        type: "number",
                        example: 99.90
                      },
                      quantidade: {
                        type: "integer",
                        example: 2
                      },
                      subtotal: {
                        type: "number",
                        example: 199.80
                      },
                      calcadosId: {
                        type: "integer",
                        example: 1
                      },
                      ordemMovimentacaoId: {
                        type: "integer",
                        example: 10
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
      "/api/movimentacao/{id}": {
        get: {
          summary: "Buscar movimentação por ID",
          tags: ["Movimentacoes"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da movimentação"
            }
          ],
          responses: {
            200: {
              description: "Movimentação encontrada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      data_hora: {
                        type: "string",
                        format: "date-time"
                      },
                      tipo: {
                        type: "string",
                        example: "AJUSTE"
                      },
                      motivo: {
                        type: "string",
                        example: "Inventário físico realizado"
                      },
                      saldo_anterior: {
                        type: "integer",
                        example: 5
                      },
                      saldo_posterior: {
                        type: "integer",
                        example: 10
                      },
                      responsavel: {
                        type: "string",
                        example: "Gabriel Santos"
                      },
                      itensMovimentacaoId: {
                        type: "integer",
                        example: 1
                      },
                      posicaoEstoqueId: {
                        type: "integer",
                        example: 2
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Movimentação não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        put: {
          summary: "Atualizar movimentação",
          tags: ["Movimentacoes"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da movimentação"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tipo: {
                      type: "string",
                      example: "AJUSTE"
                    },
                    motivo: {
                      type: "string",
                      example: "Correção manual de estoque"
                    },
                    saldo_anterior: {
                      type: "integer",
                      example: 5
                    },
                    saldo_posterior: {
                      type: "integer",
                      example: 10
                    },
                    responsavel: {
                      type: "string",
                      example: "Gabriel Santos"
                    },
                    itensMovimentacaoId: {
                      type: "integer",
                      example: 1
                    },
                    posicaoEstoqueId: {
                      type: "integer",
                      example: 2
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Movimentação atualizada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      data_hora: { type: "string", format: "date-time" },
                      tipo: { type: "string" },
                      motivo: { type: "string" },
                      saldo_anterior: { type: "integer" },
                      saldo_posterior: { type: "integer" },
                      responsavel: { type: "string" },
                      itensMovimentacaoId: { type: "integer" },
                      posicaoEstoqueId: { type: "integer" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            404: {
              description: "Movimentação não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        delete: {
          summary: "Deletar uma movimentação",
          tags: ["Movimentacoes"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da movimentação"
            }
          ],
          responses: {
            200: {
              description: "Movimentação deletada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Deletado com sucesso"
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Movimentação não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
      },
      "/api/movimentacao/historico": {
        get: {
          summary: "Listar histórico de movimentações com filtros",
          tags: ["Movimentacoes"],
          parameters: [
            {
              in: "query",
              name: "tipo",
              schema: { type: "string", example: "AJUSTE" },
              description: "Tipo da movimentação (ex: ENTRADA, SAIDA, AJUSTE)"
            },
            {
              in: "query",
              name: "responsavel",
              schema: { type: "string", example: "Gabriel" }
            },
            {
              in: "query",
              name: "motivo",
              schema: { type: "string", example: "Inventário" }
            },
            {
              in: "query",
              name: "dataInicio",
              schema: { type: "string", format: "date-time", example: "2025-01-01T00:00:00Z" }
            },
            {
              in: "query",
              name: "dataFim",
              schema: { type: "string", format: "date-time", example: "2025-12-31T23:59:59Z" }
            },
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1 }
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10 }
            }
          ],
          responses: {
            200: {
              description: "Histórico de movimentações retornado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            data_hora: { type: "string", format: "date-time", example: "2026-04-20T12:00:00Z" },
                            tipo: { type: "string", example: "AJUSTE" },
                            motivo: { type: "string", example: "Inventário físico" },
                            saldo_anterior: { type: "integer", example: 10 },
                            saldo_posterior: { type: "integer", example: 8 },
                            responsavel: { type: "string", example: "Gabriel" },
                            itensMovimentacaoId: { type: "integer", example: 5 },
                            posicaoEstoqueId: { type: "integer", example: 3 },
                            itensMovimentacao: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 5 },
                                preco_unitario: { type: "number", format: "float", example: 99.90 },
                                quantidade: { type: "integer", example: 2 },
                                subtotal: { type: "number", format: "float", example: 199.80 },
                                calcadosId: { type: "integer", example: 10 },
                                ordemMovimentacaoId: { type: "integer", example: 1 }
                              }
                            },
                            posicaoEstoque: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 3 },
                                cod_localizacao: { type: "string", example: "A1-B2" },
                                quantidade_atual: { type: "integer", example: 8 },
                                quantidade_minimo: { type: "integer", example: 5 },
                                quantidade_maximo: { type: "integer", example: 20 },
                                ultimo_abastecimento: { type: "string", format: "date-time", nullable: true, example: "2026-04-18T10:00:00Z" },
                                ultima_contagem: { type: "string", format: "date-time", example: "2026-04-19T15:00:00Z" },
                                para_mostruario: { type: "boolean", example: false }
                              }
                            }
                          }
                        }
                      },
                      meta: {
                        type: "object",
                        properties: {
                          total: { type: "integer", example: 100 },
                          page: { type: "integer", example: 1 },
                          limit: { type: "integer", example: 10 },
                          totalPages: { type: "integer", example: 10 }
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string", example: "An unknown error occurred" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/movimentacao": {
        get: {
          summary: "Listar todas as movimentações",
          tags: ["Movimentacoes"],
          responses: {
            200: {
              description: "Lista de movimentações retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1
                        },
                        data_hora: {
                          type: "string",
                          format: "date-time",
                          example: "2025-01-01T10:00:00Z"
                        },
                        tipo: {
                          type: "string",
                          example: "AJUSTE"
                        },
                        motivo: {
                          type: "string",
                          example: "Inventário físico realizado realizado"
                        },
                        saldo_anterior: {
                          type: "integer",
                          example: 5
                        },
                        saldo_posterior: {
                          type: "integer",
                          example: 10
                        },
                        responsavel: {
                          type: "string",
                          example: "Gabriel Santos"
                        },
                        itensMovimentacaoId: {
                          type: "integer",
                          example: 1
                        },
                        posicaoEstoqueId: {
                          type: "integer",
                          example: 2
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        post: {
          summary: "Criar uma nova movimentação de estoque",
          tags: ["Movimentacoes"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "tipo",
                    "motivo",
                    "saldo_anterior",
                    "saldo_posterior",
                    "responsavel",
                    "itensMovimentacaoId",
                    "posicaoEstoqueId"
                  ],
                  properties: {
                    tipo: {
                      type: "string",
                      example: "AJUSTE"
                    },
                    motivo: {
                      type: "string",
                      example: "Inventário físico realizado"
                    },
                    saldo_anterior: {
                      type: "integer",
                      example: 5
                    },
                    saldo_posterior: {
                      type: "integer",
                      example: 10
                    },
                    responsavel: {
                      type: "string",
                      example: "Gabriel Santos"
                    },
                    itensMovimentacaoId: {
                      type: "integer",
                      example: 1
                    },
                    posicaoEstoqueId: {
                      type: "integer",
                      example: 2
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Movimentação criada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      data_hora: { type: "string", format: "date-time" },
                      tipo: { type: "string" },
                      motivo: { type: "string" },
                      saldo_anterior: { type: "integer" },
                      saldo_posterior: { type: "integer" },
                      responsavel: { type: "string" },
                      itensMovimentacaoId: { type: "integer" },
                      posicaoEstoqueId: { type: "integer" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
      "/api/ordem-movimentacao/{id}": {
        get: {
          summary: "Buscar ordem de movimentação por ID",
          tags: ["OrdensMovimentacao"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da ordem de movimentação"
            }
          ],
          responses: {
            200: {
              description: "Ordem encontrada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      data_emissao: {
                        type: "string",
                        format: "date-time",
                        example: "2025-01-01T10:00:00Z"
                      },
                      empresa: {
                        type: "string",
                        example: "Maluma Shoes LTDA"
                      },
                      cnpj: {
                        type: "string",
                        example: "12345678000199"
                      },
                      numero_ordem: {
                        type: "string",
                        example: "ORD-001"
                      },
                      tipo: {
                        type: "string",
                        example: "ENTRADA"
                      },
                      status: {
                        type: "string",
                        example: "FINALIZADA"
                      },
                      valor_total: {
                        type: "number",
                        example: 999.90
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Ordem não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        put: {
          summary: "Atualizar ordem de movimentação",
          tags: ["OrdensMovimentacao"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da ordem de movimentação"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data_emissao: {
                      type: "string",
                      format: "date-time",
                      example: "2025-01-01T10:00:00Z"
                    },
                    empresa: {
                      type: "string",
                      example: "Maluma Shoes LTDA"
                    },
                    cnpj: {
                      type: "string",
                      example: "12345678000199"
                    },
                    numero_ordem: {
                      type: "string",
                      example: "ORD-001"
                    },
                    tipo: {
                      type: "string",
                      example: "ENTRADA"
                    },
                    status: {
                      type: "string",
                      example: "FINALIZADA"
                    },
                    valor_total: {
                      type: "number",
                      format: "float",
                      example: 999.90
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Ordem atualizada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      data_emissao: { type: "string", format: "date-time" },
                      empresa: { type: "string" },
                      cnpj: { type: "string" },
                      numero_ordem: { type: "string" },
                      tipo: { type: "string" },
                      status: { type: "string" },
                      valor_total: { type: "number" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            404: {
              description: "Ordem não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        delete: {
          summary: "Deletar uma ordem de movimentação",
          tags: ["OrdensMovimentacao"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da ordem de movimentação"
            }
          ],
          responses: {
            200: {
              description: "Ordem deletada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Deletado com sucesso"
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Ordem não encontrada"
            },
            409: {
              description: "Não é possível deletar a ordem pois existem itens vinculados"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
      },
      "/api/ordem-movimentacao": {
        get: {
          summary: "Listar todas as ordens de movimentação",
          tags: ["OrdensMovimentacao"],
          responses: {
            200: {
              description: "Lista de ordens retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1
                        },
                        data_emissao: {
                          type: "string",
                          format: "date-time",
                          example: "2025-01-01T10:00:00Z"
                        },
                        empresa: {
                          type: "string",
                          example: "Maluma Shoes LTDA"
                        },
                        cnpj: {
                          type: "string",
                          example: "12345678000199"
                        },
                        numero_ordem: {
                          type: "string",
                          example: "ORD-001"
                        },
                        tipo: {
                          type: "string",
                          example: "ENTRADA"
                        },
                        status: {
                          type: "string",
                          example: "FINALIZADA"
                        },
                        valor_total: {
                          type: "number",
                          example: 999.90
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        post: {
          summary: "Criar uma nova ordem de movimentação",
          tags: ["OrdensMovimentacao"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data_emissao", "empresa", "cnpj", "numero_ordem", "tipo", "status"],
                  properties: {
                    data_emissao: {
                      type: "string",
                      format: "date-time",
                      example: "2025-01-01T10:00:00Z"
                    },
                    empresa: {
                      type: "string",
                      example: "Maluma Shoes LTDA"
                    },
                    cnpj: {
                      type: "string",
                      example: "12345678000199"
                    },
                    numero_ordem: {
                      type: "string",
                      example: "ORD-001"
                    },
                    tipo: {
                      type: "string",
                      example: "ENTRADA"
                    },
                    status: {
                      type: "string",
                      example: "PENDENTE"
                    },
                    valor_total: {
                      type: "number",
                      format: "float",
                      example: 999.90
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Ordem criada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      data_emissao: { type: "string", format: "date-time" },
                      empresa: { type: "string" },
                      cnpj: { type: "string" },
                      numero_ordem: { type: "string" },
                      tipo: { type: "string" },
                      status: { type: "string" },
                      valor_total: { type: "number" }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
      },
      "/api/posicao-estoque/{id}": {
        get: {
          summary: "Buscar posição de estoque por ID",
          tags: ["PosicaoEstoque"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da posição de estoque"
            }
          ],
          responses: {
            200: {
              description: "Posição de estoque encontrada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      cod_localizacao: {
                        type: "string",
                        example: "A1-B2"
                      },
                      quantidade_atual: {
                        type: "integer",
                        example: 50
                      },
                      quantidade_minimo: {
                        type: "integer",
                        example: 10
                      },
                      quantidade_maximo: {
                        type: "integer",
                        example: 100
                      },
                      ultimo_abastecimento: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-04-18T10:00:00Z"
                      },
                      ultima_contagem: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-19T15:00:00Z"
                      },
                      para_mostruario: {
                        type: "boolean",
                        example: false
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Posição de estoque não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        put: {
          summary: "Atualizar posição de estoque",
          tags: ["PosicaoEstoque"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da posição de estoque"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    quantidade_atual: {
                      type: "integer",
                      example: 50
                    },
                    quantidade_minimo: {
                      type: "integer",
                      example: 10
                    },
                    quantidade_maximo: {
                      type: "integer",
                      example: 100
                    },
                    ultima_contagem: {
                      type: "string",
                      format: "date-time",
                      example: "2026-04-20T10:00:00Z"
                    },
                    para_mostruario: {
                      type: "boolean",
                      example: false
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Posição de estoque atualizada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      cod_localizacao: {
                        type: "string",
                        example: "A1-B2"
                      },
                      quantidade_atual: {
                        type: "integer",
                        example: 50
                      },
                      quantidade_minimo: {
                        type: "integer",
                        example: 10
                      },
                      quantidade_maximo: {
                        type: "integer",
                        example: 100
                      },
                      ultimo_abastecimento: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-04-18T10:00:00Z"
                      },
                      ultima_contagem: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-20T10:00:00Z"
                      },
                      para_mostruario: {
                        type: "boolean",
                        example: false
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            404: {
              description: "Posição de estoque não encontrada"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        delete: {
          summary: "Deletar uma posição de estoque",
          tags: ["PosicaoEstoque"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "integer"
              },
              description: "ID da posição de estoque"
            }
          ],
          responses: {
            200: {
              description: "Posição de estoque deletada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Deletado com sucesso"
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: "Posição de estoque não encontrada"
            },
            409: {
              description: "Não é possível deletar pois existem movimentações vinculadas"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
      },
      "/api/posicao-estoque/minimo": {
        get: {
          summary: "Listar itens com baixo estoque",
          tags: ["PosicaoEstoque"],
          responses: {
            200: {
              description: "Lista de itens com estoque abaixo do mínimo",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1
                        },
                        cod_localizacao: {
                          type: "string",
                          example: "A1-B2"
                        },
                        quantidade_atual: {
                          type: "integer",
                          example: 3
                        },
                        quantidade_minimo: {
                          type: "integer",
                          example: 10
                        },
                        quantidade_maximo: {
                          type: "integer",
                          example: 50
                        },
                        ultimo_abastecimento: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                          example: "2026-04-18T10:00:00Z"
                        },
                        ultima_contagem: {
                          type: "string",
                          format: "date-time",
                          example: "2026-04-19T15:00:00Z"
                        },
                        para_mostruario: {
                          type: "boolean",
                          example: false
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
      "/api/posicao-estoque/moverEstoque": {
        post: {
          summary: "Realizar movimentação de estoque (entrada ou saída)",
          tags: ["PosicaoEstoque"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "posicaoEstoqueId",
                    "itensMovimentacaoId",
                    "quantidade",
                    "tipo",
                    "motivo",
                    "responsavel"
                  ],
                  properties: {
                    posicaoEstoqueId: {
                      type: "integer",
                      example: 1
                    },
                    itensMovimentacaoId: {
                      type: "integer",
                      example: 10
                    },
                    quantidade: {
                      type: "integer",
                      example: 5
                    },
                    tipo: {
                      type: "string",
                      enum: ["ENTRADA", "SAIDA"],
                      example: "ENTRADA"
                    },
                    motivo: {
                      type: "string",
                      example: "Recebimento de mercadoria"
                    },
                    responsavel: {
                      type: "string",
                      example: "Gabriel Santos"
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Movimentação realizada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      data_hora: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-20T12:00:00Z"
                      },
                      tipo: {
                        type: "string",
                        example: "ENTRADA"
                      },
                      motivo: {
                        type: "string",
                        example: "Recebimento de mercadoria"
                      },
                      saldo_anterior: {
                        type: "integer",
                        example: 10
                      },
                      saldo_posterior: {
                        type: "integer",
                        example: 15
                      },
                      responsavel: {
                        type: "string",
                        example: "Gabriel Santos"
                      },
                      itensMovimentacaoId: {
                        type: "integer",
                        example: 10
                      },
                      posicaoEstoqueId: {
                        type: "integer",
                        example: 1
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Erro de validação ou regra de negócio"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
      "/api/posicao-estoque": {
        get: {
          summary: "Listar todas as posições de estoque",
          tags: ["PosicaoEstoque"],
          responses: {
            200: {
              description: "Lista de posições de estoque retornada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1
                        },
                        quantidade_atual: {
                          type: "integer",
                          example: 50
                        },
                        quantidade_minima: {
                          type: "integer",
                          example: 10
                        },
                        ultima_contagem: {
                          type: "string",
                          format: "date-time",
                          example: "2025-01-01T10:00:00Z"
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
        post: {
          summary: "Criar uma nova posição de estoque",
          tags: ["PosicaoEstoque"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["cod_localizacao", "quantidade_atual"],
                  properties: {
                    cod_localizacao: {
                      type: "string",
                      example: "A1-B2"
                    },
                    quantidade_atual: {
                      type: "integer",
                      example: 50
                    },
                    quantidade_minimo: {
                      type: "integer",
                      example: 10
                    },
                    quantidade_maximo: {
                      type: "integer",
                      example: 100
                    },
                    ultima_contagem: {
                      type: "string",
                      format: "date-time",
                      example: "2026-04-20T10:00:00Z"
                    },
                    para_mostruario: {
                      type: "boolean",
                      example: false
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Posição de estoque criada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      cod_localizacao: {
                        type: "string",
                        example: "A1-B2"
                      },
                      quantidade_atual: {
                        type: "integer",
                        example: 50
                      },
                      quantidade_minimo: {
                        type: "integer",
                        example: 10
                      },
                      quantidade_maximo: {
                        type: "integer",
                        example: 100
                      },
                      ultimo_abastecimento: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-04-20T10:00:00Z"
                      },
                      ultima_contagem: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-20T10:00:00Z"
                      },
                      para_mostruario: {
                        type: "boolean",
                        example: false
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        },
      },
      "/api/usuarios": {
        post: {
          summary: "Criar um novo usuário",
          tags: ["Usuarios"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nome", "email", "senha", "role"],
                  properties: {
                    nome: {
                      type: "string",
                      example: "Gabriel Santos"
                    },
                    email: {
                      type: "string",
                      format: "email",
                      example: "gabriel@email.com"
                    },
                    senha: {
                      type: "string",
                      format: "password",
                      example: "123456"
                    },
                    role: {
                      type: "string",
                      enum: ["ADMIN", "OPERADOR", "GESTOR"],
                      example: "OPERADOR"
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Usuário criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1
                      },
                      nome: {
                        type: "string",
                        example: "Gabriel Santos"
                      },
                      email: {
                        type: "string",
                        example: "gabriel@email.com"
                      },
                      senha: {
                        type: "string",
                        example: "fjksd3feoo35lsmafno2n4mfo2hgfhfgh44dfg32"
                      },
                      role: {
                        type: "string",
                        example: "OPERADOR"
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-20T12:00:00Z"
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Dados inválidos ou erro de validação"
            },
            500: {
              description: "Erro interno no servidor"
            }
          }
        }
      },
    },
  },

  apis: [],
};

const spec = swaggerJsdoc(options);

export default spec;