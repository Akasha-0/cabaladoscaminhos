export type TemaChat =
  | 'relacionamento'
  | 'trabalho'
  | 'dinheiro'
  | 'saude'
  | 'espiritualidade'
  | 'proposito'
  | 'outros';

export interface MensagemChat {
  id: string;
  tipo: 'usuario' | 'assistente';
  conteudo: string;
  tema?: TemaChat;
  timestamp: Date;
}

export interface ConversaChat {
  id: string;
  userId: string;
  tema: TemaChat;
  mensagens: MensagemChat[];
  criadaEm: Date;
  atualizadaEm: Date;
}

export interface ChatRequest {
  pergunta: string;
  tema: TemaChat;
  historico?: MensagemChat[];
}

export interface ChatResponse {
  resposta: string;
  novoSaldo: number;
}

export interface HistoricoResponse {
  conversas: ConversaChat[];
}

export interface SalvarConversaRequest {
  tema: TemaChat;
  mensagens: MensagemChat[];
}

export interface SalvarConversaResponse {
  conversa: ConversaChat;
}
