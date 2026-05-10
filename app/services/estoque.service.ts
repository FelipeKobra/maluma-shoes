import { prisma } from "@/app/lib/prisma";
import { ApiError } from "../lib/apiError";
import { Parser } from "json2csv";

type MovimentacaoInput = {
  posicaoEstoqueId: number;
  itensMovimentacaoId: number;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  motivo: string;
  responsavel: string;
};

export async function movimentarEstoque(data: MovimentacaoInput) {
  let alertaEstoqueMin;
  let alertaEstoqueMax;

  const estoque = await prisma.posicaoEstoque.findUnique({
    where: {
      id: data.posicaoEstoqueId,
    },
  });

  if (!estoque) {
    throw new ApiError("Posição-Estoque não encontrado", 404);
  }

  const qtdMinima = estoque.quantidade_minimo;
  const saldoAnterior = estoque.quantidade_atual;
  const qtdMaxima = estoque.quantidade_maximo;

  let saldoPosterior = saldoAnterior;

  if (data.tipo === "ENTRADA") {
    saldoPosterior += data.quantidade;
   
    if(saldoPosterior > qtdMaxima) {
      const qtdExcedida = saldoPosterior - qtdMaxima
      alertaEstoqueMax = {
        quantidade_atual: saldoPosterior,
        quantidade_maxima: qtdMaxima,
        tipo: "Estoque excedido em " + qtdExcedida + " pares em " + estoque.cod_localizacao,
      }
    }
    
  }

  if (data.tipo === "SAIDA") {
    if (saldoAnterior < data.quantidade) {
      throw new ApiError("Estoque insuficiente", 400);
    }
    saldoPosterior -= data.quantidade;

    if(saldoPosterior < qtdMinima) {
       alertaEstoqueMin = {
        quantidade_minima: qtdMinima,
        tipo: "Baixo estoque em " + estoque.cod_localizacao,
        ultimo_abastescimento: estoque.ultimo_abastecimento
      }
    }
  }

  const movimentacao = await prisma.movimentacao.create({
    data: {
      data_hora: new Date(),
      tipo: data.tipo,
      motivo: data.motivo,
      saldo_anterior: saldoAnterior,
      saldo_posterior: saldoPosterior,
      responsavel: data.responsavel,
      itensMovimentacaoId: data.itensMovimentacaoId,
      posicaoEstoqueId: data.posicaoEstoqueId,
    },
  });

  await prisma.posicaoEstoque.update({
    where: {
      id: data.posicaoEstoqueId,
    },
    data: {
      quantidade_atual: saldoPosterior,
      ultimo_abastecimento: data.tipo === "ENTRADA" ? new Date() : undefined,
    },
  });

  return alertaEstoqueMin ? {movimentacao, alertaEstoqueMin} : alertaEstoqueMax ? {movimentacao, alertaEstoqueMax} : movimentacao;
}


export const baixoEstoque = await prisma.posicaoEstoque.findMany({
  where: {
    quantidade_atual: {
      lte: prisma.posicaoEstoque.fields.quantidade_minimo,
    },
  },
  include: {
      movimentacoes: {
        include: {
          itensMovimentacao: {
            include: {
              calcados: true, 
            },
          },
        },
      },
    },
});



export async function gerarRelatorioAbaixoEstoque() {
  // 1. Sua consulta (ou mock)
  const baixoEstoqueRel = baixoEstoque; 

  if (baixoEstoqueRel.length === 0) {
    throw new ApiError("Nenhum calçado abaixo do estoque mínimo", 404);
  }

  // 2. Formatação dos dados (Garantindo que a linha apareça mesmo sem movimentação)
  const dadosFormatados = baixoEstoqueRel.map((pos) => {
    // Busca o modelo dentro do encadeamento do Prisma
    // Se itensMovimentacao for array, pega o primeiro, senão trata como objeto
    const mov = pos.movimentacoes?.[0];
    const item = mov?.itensMovimentacao;
    const modeloCalcado = Array.isArray(item) 
      ? item[0]?.calcados?.modelo 
      : item?.calcados?.modelo;

    return {
      modelo: modeloCalcado || "Sem Nome",
      localizacao: pos.cod_localizacao || "-",
      qtd_atual: pos.quantidade_atual ?? 0,
      qtd_minima: pos.quantidade_minimo ?? 0,
      qtd_maxima: pos.quantidade_maximo ?? 0,
      ultimo_abastecimento: pos.ultimo_abastecimento 
        ? new Date(pos.ultimo_abastecimento).toLocaleDateString('pt-BR') 
        : "N/A",
      ultima_contagem: pos.ultima_contagem 
        ? new Date(pos.ultima_contagem).toLocaleDateString('pt-BR') 
        : "-",
      mostruario: pos.para_mostruario ? "Sim" : "Nao"
    };
  });

  // 3. Configuração do Parser (Nomes dos valores devem bater com as chaves acima)
  const fields = [
    { label: 'Modelo', value: 'modelo' },
    { label: 'Localizacao', value: 'localizacao' },
    { label: 'Qtd. Atual', value: 'qtd_atual' },
    { label: 'Qtd. Minima', value: 'qtd_minima' },
    { label: 'Qtd. Maxima', value: 'qtd_maxima' },
    { label: 'Último Abastecimento', value: 'ultimo_abastecimento' },
    { label: 'Última Contagem', value: 'ultima_contagem' },
    { label: 'Mostruário', value: 'mostruario' }
  ];

  const parser = new Parser({ fields, delimiter: ';' }); // Delimiter ';' ajuda o Excel BR
  const csv = parser.parse(dadosFormatados);

  // 4. A MÁGICA PARA O PORTUGUÊS: Adicionar o BOM (Byte Order Mark)
  // Isso força o Excel e outros leitores a reconhecerem acentos corretamente em UTF-8
  const BOM = '\uFEFF';
  return BOM + csv;
}
