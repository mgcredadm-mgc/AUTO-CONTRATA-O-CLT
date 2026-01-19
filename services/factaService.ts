
import { FactaConfig } from "../types";

const FACTA_BASE_URL = "https://webservice-homol.facta.com.br";
const FACTA_CONFIG_KEY = "facta_api_config";

/**
 * Service Layer para API Facta Financeira
 * Baseado na documentação: API FACTA | CRÉDITO DO TRABALHADOR (Versão 9.0)
 */
export const FactaService = {
  
  saveConfig: (config: FactaConfig) => {
    localStorage.setItem(FACTA_CONFIG_KEY, JSON.stringify(config));
  },

  getConfig: (): FactaConfig | null => {
    const stored = localStorage.getItem(FACTA_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // 1 - GET | Gera Token (Página 2)
  authenticate: async (): Promise<string | null> => {
    try {
      const config = FactaService.getConfig();
      if (!config?.user || !config.password) {
          console.warn("Credenciais Facta não configuradas.");
          return null;
      }

      // Encodar usuario:senha em base64 conforme documentação
      const credentials = btoa(`${config.user}:${config.password}`);
      
      const response = await fetch(`${FACTA_BASE_URL}/gera-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (!response.ok) throw new Error('Falha na autenticação Facta');
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.warn("API Facta indisponível (CORS/Auth). Usando token mockado para demonstração.");
      // Retorna token mockado para permitir fluxo de demonstração
      return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock_facta_token_demo_only";
    }
  },

  // 4 – GET – Consulta de Operações Disponíveis (Página 7)
  // Utilizado para simulação de valores
  consultarOperacoesDisponiveis: async (
    cpf: string, 
    valorRenda: number,
    dataNascimento: string = "01/01/1980"
  ) => {
    const token = await FactaService.authenticate();
    if (!token) throw new Error("Token Facta não obtido");

    try {
      // Parâmetros fixos conforme documentação para "13 – NOVO DIGITAL"
      const params = new URLSearchParams({
        produto: 'D',
        tipo_operacao: '13',
        averbador: '10010', // Exemplo do PDF
        convenio: '3',      // Exemplo do PDF
        opcao_valor: '2',   // 2 = por parcela (calculo reverso costuma ser melhor para maximo) ou 1 para valor
        cpf: cpf.replace(/\D/g, ''),
        data_nascimento: dataNascimento,
        valor_renda: valorRenda.toString()
      });

      const response = await fetch(`${FACTA_BASE_URL}/proposta/operacoes-disponiveis?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Erro ao consultar operações Facta");
      
      return await response.json();

    } catch (error) {
      console.warn("Simulação Facta falhou. Retornando Mock baseado no PDF.");
      
      // Mock de resposta baseado na página 8 do PDF
      return {
        erro: false,
        tabelas: [
          {
            tabela: "59870 - CLT NOVO PN-S",
            codigoTabela: 112727,
            taxa: 4.0,
            prazo: 12,
            parcela: 150.00,
            valor_liquido: 1337.24,
            valor_seguro: 0,
            coeficiente: 0.112171
          },
          {
            tabela: "59862 - CLT NOVO GOLD PN-S",
            codigoTabela: 112726,
            taxa: 3.5,
            prazo: 24,
            parcela: 150.00,
            valor_liquido: 2150.50,
            valor_seguro: 25.00,
            coeficiente: 0.069
          }
        ]
      };
    }
  }
};
