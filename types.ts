
export type UserRole = 'lead' | 'human_agent' | 'ai_agent';

export type LeadStatus = 'new' | 'ai_talking' | 'human_intervention' | 'waiting_signature' | 'closed';

export type C6AuthStatus = 'pendente' | 'link_gerado' | 'autorizado' | 'recusado';

export interface Message {
  id: string;
  role: UserRole;
  content: string;
  timestamp: string;
  isInternal?: boolean; // For system notes
}

export interface Lead {
  id: string;
  name: string;
  cpf: string;
  phoneNumber: string; // Adicionado para WhatsApp
  birthDate: string;
  avatarUrl: string;
  status: LeadStatus;
  lastMessage: string;
  lastActive: string;
  c6Status: C6AuthStatus;
  c6Link?: string;
  proposalReady: boolean;
  messages: Message[];
}

export interface IntegrationsConfig {
  profileName?: string; // Nome para identificar o perfil salvo
  clientUser: string;
  password: string;
  promoterCode: string;
  typistCode: string;
  certifiedAgentCpf: string;
}

export type WhatsappConnectionMode = 'api' | 'web';

export interface EvolutionConfig {
  mode: WhatsappConnectionMode;
  // Configs API
  baseUrl: string;
  apiKey: string;
  instanceName: string;
  // Configs Web (Simulado)
  webSessionId?: string;
  webConnected?: boolean;
  webSessionName?: string;
}

export interface AIConfigSettings {
  model: string;
  temperature: number;
  systemPrompt: string;
}

// --- SALES CONTROL TYPES ---

export type SaleStatus = 'paid' | 'pending' | 'cancelled' | 'processing';
// Restrito para CLT
export type PaymentMethod = 'desconto_folha';

export interface Sale {
  id: string;
  clientName: string;
  cpf?: string;
  product: string;
  value: number;
  date: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// --- C6 API TYPES (Based on PDF) ---

export interface C6TokenResponse {
  access_token: string;
  expires_in: number;
}

export interface C6SimulationRequest {
  operation_type: "NOVA" | "REFINANCIAMENTO";
  product_type_code: string; // Ex: "0001" (Margem Livre)
  simulation_type: "POR_VALOR_SOLICITADO" | "POR_VALOR_PARCELA";
  formalization_subtype: "DIGITAL_WEB" | "PLUS";
  promoter_code: string;
  covenant_group: "INSS" | "SIAPE_SERVIDOR" | "SIAPE_PENSIONISTA";
  public_agency: string;
  requested_amount?: number;
  installment_quantity?: number;
  client: {
    tax_identifier: string; // CPF
    birth_date: string; // YYYY-MM-DD
    income_amount: number;
  };
}

export interface C6SimulationResponse {
  installments: Array<{
    number: number;
    amount: number;
    due_date: string;
  }>;
  requested_amount: number;
  net_amount: number;
  total_amount: number;
}