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
    if(qtdMaxima < saldoAnterior + data.quantidade) {
      const qtdExcedida = (saldoAnterior + data.quantidade) - qtdMaxima
      alertaEstoqueMax = {
        quantidade_maxima: qtdMaxima,
        tipo: "Estoque excedido em" + qtdExcedida + " pares",
      }
    }
    saldoPosterior += data.quantidade;
  }

  if (data.tipo === "SAIDA") {
    if (saldoAnterior < data.quantidade) {
      throw new ApiError("Estoque insuficiente", 400);
    }
    saldoPosterior -= data.quantidade;

    if(saldoPosterior < qtdMinima) {
       alertaEstoqueMin = {
        quantidade_minima: qtdMinima,
        tipo: "Baixo estoque",
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

  return alertaEstoqueMin ? {movimentacao, alertaEstoqueMin} : movimentacao;
}


export const baixoEstoque = await prisma.posicaoEstoque.findMany({
  where: {
    quantidade_atual: {
      lte: prisma.posicaoEstoque.fields.quantidade_minimo,
    },
  },
});


export async function gerarRelatorioAbaixoEstoque() {

  const baixoEstoque = await prisma.posicaoEstoque.findMany({
    where: {
      quantidade_atual: {
        lt: prisma.posicaoEstoque.fields.quantidade_minimo,
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

  if(baixoEstoque.length === 0) throw new ApiError("Nenhuma calcado abaixo do estoque mínimo", 404);

  const dadosFormatados = baixoEstoque.flatMap((pos) => {
    
    return pos.movimentacoes.map((mov) => {
      
    
      const item = mov.itensMovimentacao;

      return {
        modelo: item?.calcados?.modelo || "-",
        localizacao: pos.cod_localizacao || "-",
        qtd_atual: pos.quantidade_atual || 0,
        qtd_minima: pos.quantidade_minimo || 0,
        qtd_maxima: pos.quantidade_maximo || 0,
        ultimo_abastecimento: pos.ultimo_abastecimento 
          ? new Date(pos.ultimo_abastecimento).toLocaleDateString('pt-BR') 
          : "N/A",
        ultima_contagem: pos.ultima_contagem 
          ? new Date(pos.ultima_contagem).toLocaleDateString('pt-BR') 
          : "-",
        mostruario: pos.para_mostruario ? "Sim" : "Não"
      };
    });
  });

  const fields = [{label: 'Modelo', value: 'data_hora' },
    {label: 'Localizacao', value: 'cod_localizacao' },
    {label: 'Qtd. Atual', value: 'quantidade_atual' }, 
    {label: 'Qtd. Minima', value: 'quantidade_minima' }, 
    {label: 'Qtd. Maxima', value: 'quantidade_maxima' }, 
    {label: 'Ultimo Abastecimento', value: 'ultimo_abastecimento' }, 
    {label: 'Ultima Contagem', value: 'ultima_contagem' },
    {label: 'Mostruario', value: 'mostruario' }];

  const opts = { fields };

  const parser = new Parser(opts);

  return parser.parse(dadosFormatados);
}
