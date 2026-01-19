
// Remoção da importação real para corrigir o build
// import { FunctionDeclaration, Type } from "@google/genai";

// Mock do Enum Type para manter compatibilidade com o código existente
export const Type = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT'
};

export const c6Tools = [
  {
    name: "simular_consignado_c6",
    description: "Realiza uma simulação de crédito consignado na API do C6 Bank. Use para calcular parcelas e valores disponíveis.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        cpf: {
          type: Type.STRING,
          description: "CPF do cliente (apenas números ou formatado).",
        },
        valorSolicitado: {
          type: Type.NUMBER,
          description: "Valor líquido que o cliente deseja receber (em Reais).",
        },
        parcelas: {
          type: Type.INTEGER,
          description: "Número de parcelas desejadas (ex: 84, 72). Padrão é 84 se não informado.",
        },
      },
      required: ["cpf", "valorSolicitado"],
    },
  },
  {
    name: "gerar_link_formalizacao",
    description: "Gera o link de formalização digital (biometria facial) para o cliente assinar a proposta.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        proposalNumber: {
          type: Type.STRING,
          description: "Número da proposta gerada anteriormente.",
        },
      },
      required: ["proposalNumber"],
    },
  },
  {
    name: "consultar_status_proposta",
    description: "Verifica o status atual de uma proposta no C6 (ex: Aguardando Assinatura, Integrada, Paga).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        proposalNumber: {
          type: Type.STRING,
          description: "Número da proposta.",
        },
      },
      required: ["proposalNumber"],
    },
  },
  {
    name: "transferir_para_humano",
    description: "Transfere o atendimento para um agente humano especializado. Use quando o cliente solicitar falar com uma pessoa, estiver irritado, ou quando o assunto fugir do escopo de crédito consignado.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        motivo: {
          type: Type.STRING,
          description: "O motivo da transferência (ex: 'Cliente solicitou humano', 'Dúvida complexa', 'Cliente irritado').",
        },
        resumo_caso: {
          type: Type.STRING,
          description: "Um breve resumo do que foi tratado até agora para o humano saber.",
        }
      },
      required: ["motivo"],
    },
  }
];