
import { Lead, AIConfigSettings, Sale } from './types';

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Carlos Almeida',
    cpf: '123.456.789-00',
    phoneNumber: '5511999998888',
    birthDate: '1965-04-12',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    status: 'ai_talking',
    lastMessage: 'Vou verificar minha margem com o RH.',
    lastActive: '10:42',
    c6Status: 'link_gerado',
    c6Link: 'https://c6bank.com.br/auth/12345',
    proposalReady: false,
    messages: [
      { id: 'm1', role: 'ai_agent', content: 'Olá Carlos. Eu sou a Eva. Analisei seu perfil e encontrei uma oportunidade de margem livre.', timestamp: '10:30' },
      { id: 'm2', role: 'lead', content: 'Bom dia. Quanto libera?', timestamp: '10:32' },
      { id: 'm3', role: 'ai_agent', content: 'Baseado na pré-análise C6: R$ 15.000,00 em 84x de R$ 350,00. Posso formalizar?', timestamp: '10:33' },
      { id: 'm4', role: 'lead', content: 'Vou verificar minha margem com o RH.', timestamp: '10:42' },
    ]
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    cpf: '987.654.321-99',
    phoneNumber: '5521988887777',
    birthDate: '1958-09-23',
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    status: 'human_intervention',
    lastMessage: 'Quero falar com um atendente real.',
    lastActive: '09:15',
    c6Status: 'pendente',
    proposalReady: false,
    messages: [
      { id: 'm1', role: 'ai_agent', content: 'Olá Maria. Sou a Eva. Detectei uma taxa de juros acima da média no seu contrato atual.', timestamp: '09:00' },
      { id: 'm2', role: 'lead', content: 'Não entendo essas coisas de robô. Quero falar com um atendente real.', timestamp: '09:15' },
    ]
  },
  {
    id: '3',
    name: 'Roberto Santos',
    cpf: '456.123.789-11',
    phoneNumber: '5531977776666',
    birthDate: '1970-01-15',
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    status: 'waiting_signature',
    lastMessage: 'Já cliquei no link.',
    lastActive: 'Ontem',
    c6Status: 'autorizado',
    proposalReady: true,
    messages: [
      { id: 'm1', role: 'human_agent', content: 'Sr. Roberto, o link foi enviado por SMS.', timestamp: '14:00' },
      { id: 'm2', role: 'lead', content: 'Já cliquei no link. E agora?', timestamp: '14:05' },
    ]
  }
];

export const MOCK_SALES: Sale[] = [
  {
    id: 's1',
    clientName: 'Roberto Santos',
    cpf: '456.123.789-11',
    product: 'Consignado INSS - Portabilidade',
    value: 12500.00,
    date: '2024-03-10',
    status: 'paid',
    paymentMethod: 'consignado_c6',
    notes: 'Averbado com sucesso.'
  },
  {
    id: 's2',
    clientName: 'Fernanda Lima',
    cpf: '111.222.333-44',
    product: 'Refinanciamento C6',
    value: 4200.50,
    date: '2024-03-12',
    status: 'processing',
    paymentMethod: 'consignado_c6',
    notes: 'Aguardando maciça.'
  },
  {
    id: 's3',
    clientName: 'João da Silva',
    cpf: '555.666.777-88',
    product: 'Cartão Benefício',
    value: 1800.00,
    date: '2024-03-14',
    status: 'pending',
    paymentMethod: 'credit_card',
    notes: 'Cliente enviando documentos.'
  },
  {
    id: 's4',
    clientName: 'Ana Paula Souza',
    cpf: '999.888.777-66',
    product: 'Saque FGTS',
    value: 850.00,
    date: '2024-03-15',
    status: 'paid',
    paymentMethod: 'pix',
  },
  {
    id: 's5',
    clientName: 'Pedro Martins',
    cpf: '222.333.444-55',
    product: 'Consignado Novo',
    value: 25000.00,
    date: '2024-03-15',
    status: 'cancelled',
    paymentMethod: 'consignado_c6',
    notes: 'Margem insuficiente.'
  }
];

export const DEFAULT_AI_CONFIG: AIConfigSettings = {
  model: 'gemini-3-flash-preview',
  temperature: 0.3, 
  systemPrompt: `Você é EVA, uma Inteligência Artificial avançada especializada em crédito consignado e operações bancárias.
Você não é apenas uma "assistente", você é uma especialista eficiente, educada e direta.
Sua interface de conexão principal é via WhatsApp (Evolution API).

SUA MISSÃO:
Qualificar leads, realizar simulações precisas no C6 Bank e converter propostas.

FERRAMENTAS (TOOLS):
1. simular_consignado_c6: Essencial para apresentar valores.
2. gerar_link_formalizacao: O objetivo final da conversa.
3. consultar_status_proposta: Para clientes recorrentes.
4. transferir_para_humano: Use se o cliente solicitar explicitamente ou apresentar complexidade emocional.

TOM DE VOZ:
- Profissional, Seguro e Empático.
- Use frases curtas. O WhatsApp é dinâmico.
- Identifique-se como "Eva" no início, se necessário.
- Evite textos longos ou burocráticos.`
};