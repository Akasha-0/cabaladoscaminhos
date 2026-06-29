// ============================================================================
// EVENTS & WORKSHOPS — W43
// ----------------------------------------------------------------------------
// Sistema de eventos do Akasha: workshops online e presenciais, cerimônias,
// círculos de estudo, retiros e palestras. Cobre RSVP, ticket types,
// recorrência estilo RRULE, calendário com timezone, check-in via QR,
// gravação gated, reviews com NPS, capacity management e política de
// cancelamento.
//
// Este módulo é a evolução do `src/lib/events/types.ts` (W26) — aqui temos
// as REGRAS de negócio (CRUD, regras de capacidade, expansão de recorrência,
// gating de gravação) e não só a forma do dado.
//
// Convenções PT-BR:
//   - camelCase em identificadores
//   - Comentários descritivos em PT-BR (consistência com módulos W22-W42)
//   - Datas como ISO 8601 string
//   - Preços em centavos (priceCents) — sem ponto flutuante
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Tipos e enums de domínio
// ---------------------------------------------------------------------------

/** Tipos de evento cobertos pelo módulo */
export type EventoTipo =
  | 'workshop'
  | 'cerimonia'
  | 'circulo-estudo'
  | 'retiro'
  | 'palestra';

/** Modalidade de realização */
export type EventoModalidade = 'online' | 'presencial' | 'hibrido';

/** Nível de profundidade exigido do participante */
export type EventoNivel = 'iniciante' | 'intermediario' | 'avancado' | 'todos';

/** Status de ciclo de vida do evento */
export type EventoStatus =
  | 'rascunho'
  | 'publicado'
  | 'em-andamento'
  | 'concluido'
  | 'cancelado'
  | 'arquivado';

/** Tipos de ingresso ofertados */
export type TicketTipo = 'geral' | 'vip' | 'apoiador' | 'estudante' | 'patrocinador';

/** Status do RSVP de um participante */
export type RsvpStatus =
  | 'confirmado'
  | 'pendente'
  | 'lista-espera'
  | 'cancelado'
  | 'compareceu'
  | 'faltou';

/** Frequência de recorrência */
export type RecorrenciaFreq = 'diaria' | 'semanal' | 'mensal';

/** Tipo de notificação relacionada a evento */
export type NotificacaoEventoTipo =
  | 'lembrete-24h'
  | 'lembrete-1h'
  | 'lembrete-15min'
  | 'cancelamento'
  | 'alteracao'
  | 'confirmacao'
  | 'gravacao-disponivel';

/** Tradição espiritual (espelha outros módulos W22-W42) */
export type Tradicao =
  | 'cabala'
  | 'ifa'
  | 'astrologia'
  | 'tantra'
  | 'reiki'
  | 'meditacao'
  | 'xamanismo'
  | 'cristianismo-mistico'
  | 'sufismo'
  | 'taoismo'
  | 'umbanda'
  | 'candomble'
  | 'outros';

// ---------------------------------------------------------------------------
// 2. Interfaces principais
// ---------------------------------------------------------------------------

/** Localização física ou virtual */
export interface EventoLocalizacao {
  /** Link de acesso (Zoom, Google Meet, etc.) */
  url?: string;
  /** Endereço completo (presencial) */
  endereco?: string;
  /** Cidade / Estado / País */
  cidade?: string;
  /** País em ISO 3166-1 alpha-2 (BR, US, PT...) */
  pais?: string;
  /** Coordenadas para mapa (opcional) */
  lat?: number;
  lng?: number;
  /** Instruções de acesso (ex: "levar tapete e roupa branca") */
  instrucoes?: string;
}

/** Tipo de ingresso com preço e benefícios */
export interface EventoTicketType {
  id: string;
  eventoId: string;
  tipo: TicketTipo;
  /** Preço em centavos. 0 = gratuito */
  precoCents: number;
  /** Moeda ISO 4217 (BRL, USD, EUR) */
  moeda: string;
  /** Quantidade disponível (null = ilimitado) */
  quantidade?: number;
  /** Quantidade vendida (running counter) */
  vendidos: number;
  /** Lista de benefícios (ex: ["material-digital", "mentoria-pos"]) */
  beneficios: string[];
  /** Venda abre em (ISO 8601) */
  vendasAbremEm?: string;
  /** Venda fecha em (ISO 8601) */
  vendasFechamEm?: string;
  /** Limite por pessoa (default 1) */
  limitePorPessoa?: number;
  /** Código promocional necessário? (ex: "ESTUDANTE2026") */
  codigoRequerido?: string;
}

/** Regra de recorrência estilo RRULE simplificado */
export interface EventoRecorrencia {
  frequencia: RecorrenciaFreq;
  /** Intervalo — a cada N dias/semanas/meses (default 1) */
  intervalo: number;
  /** Dias da semana quando frequencia = 'semanal' (0=dom, 6=sab) */
  diasSemana?: number[];
  /** Dia do mês quando frequencia = 'mensal' (1-31) */
  diaMes?: number;
  /** Total de ocorrências (null = até dataFim) */
  totalOcorrencias?: number;
  /** Data final da série (ISO 8601) */
  dataFim?: string;
  /** Datas específicas EXCLUÍDAS (ex: feriados, recessos) */
  excecoes: string[];
}

/** Localização geográfica resumida */
export interface EventoLocal {
  nome: string;
  capacidade?: number;
  endereco: string;
  cidade: string;
  pais: string;
}

/** Instrutor/facilitador de um evento */
export interface EventoOrganizador {
  id: string;
  nomeExibicao: string;
  handle?: string;
  avatarUrl?: string;
  linhagemTradicao?: string;
  bio: string;
  /** Eventos anteriores que conduziu (rating médio) */
  ratingMedio?: number;
}

/** Estrutura canônica do evento */
export interface Evento {
  id: string;
  organizadorId: string;
  organizador?: EventoOrganizador;
  titulo: string;
  slug: string;
  descricao: string;
  /** Descrição longa (Markdown) */
  descricaoLonga?: string;
  tipo: EventoTipo;
  tradicao: Tradicao;
  modalidade: EventoModalidade;
  local: EventoLocalizacao;
  /** Data/hora de início (ISO 8601) */
  iniciaEm: string;
  /** Data/hora de fim (ISO 8601) */
  terminaEm: string;
  /** IANA timezone (ex: 'America/Sao_Paulo') */
  timezone: string;
  /** Capacidade total (null = ilimitado) */
  capacidade?: number;
  /** Soft cap — a partir deste número ativa lista de espera */
  capacidadeSuave?: number;
  ticketTypes: EventoTicketType[];
  tags: string[];
  nivel: EventoNivel;
  /** Idioma principal do evento */
  idioma: string;
  /** Preço mínimo (derivado do ticketType mais barato em centavos) */
  precoMinimoCents: number;
  /** Capa do evento (URL) */
  capaUrl?: string;
  status: EventoStatus;
  /** Regra de recorrência (ausente = evento único) */
  recorrencia?: EventoRecorrencia;
  /** ID do evento pai (quando é instância de uma série) */
  eventoPaiId?: string;
  /** Material de apoio (PDFs, links) */
  materiaisUrl?: string[];
  /** Política de cancelamento ativa */
  politicaCancelamentoId?: string;
  /** Visibilidade — afeta indexação e SEO */
  publico: boolean;
  /** Requer aprovação manual do organizador? */
  requerAprovacao: boolean;
  criadoEm: string;
  atualizadoEm: string;
  /** Número de RSVPs confirmados (denormalizado) */
  confirmados: number;
  /** Número em lista de espera */
  listaEspera: number;
}

/** Inscrição (RSVP) de um participante em um evento */
export interface EventoRsvp {
  id: string;
  eventoId: string;
  ticketTypeId: string;
  usuarioId: string;
  nomeParticipante: string;
  email: string;
  status: RsvpStatus;
  /** Posição na lista de espera (null se confirmado) */
  posicaoEspera?: number;
  /** Preço pago em centavos */
  precoPagoCents: number;
  moeda: string;
  /** Código de check-in (QR payload) */
  codigoCheckin: string;
  /** Se já fez check-in */
  checkinFeitoEm?: string;
  /** Notas do participante (intenções, restrições alimentares) */
  notas?: string;
  /** Confirmação de presença (resposta ao lembrete) */
  confirmouPresenca?: boolean;
  /** Histórico de mudanças de status */
  historico: Array<{
    de: RsvpStatus;
    para: RsvpStatus;
    em: string;
    motivo?: string;
  }>;
  criadoEm: string;
  atualizadoEm: string;
}

/** Avaliação pós-evento */
export interface EventoReview {
  id: string;
  eventoId: string;
  usuarioId: string;
  rsvpId: string;
  /** Nota geral 1-5 */
  nota: number;
  /** Nota do instrutor 1-5 */
  notaInstrutor: number;
  /** NPS 0-10 */
  nps: number;
  /** Texto livre */
  comentario?: string;
  /** URLs de fotos do evento */
  fotos: string[];
  /** Review aprovada pelo organizador */
  aprovado: boolean;
  criadoEm: string;
}

/** Gravação de um evento */
export interface EventoGravacao {
  id: string;
  eventoId: string;
  /** URL do vídeo (privada — só acessível com token) */
  urlPrivada: string;
  /** URL pública alternativa (ex: YouTube não-listado) */
  urlPublica?: string;
  /** Duração em segundos */
  duracaoSegundos: number;
  /** Thumbnail do vídeo */
  thumbnailUrl?: string;
  /** Quem pode assistir: 'todos' | 'participantes' | 'pago' */
  visibilidade: 'todos' | 'participantes' | 'pago';
  /** Preço de acesso (se visibilidade = 'pago') */
  precoAcessoCents?: number;
  publicadoEm: string;
  /** Material complementar (PDFs, links) */
  materiaisComplementares: string[];
}

/** Notificação agendada para um evento */
export interface EventoNotificacao {
  id: string;
  eventoId: string;
  rsvpId?: string;
  tipo: NotificacaoEventoTipo;
  /** Quando enviar (ISO 8601) */
  disparaEm: string;
  /** Canal preferido */
  canal: 'email' | 'push' | 'sms' | 'whatsapp';
  /** Conteúdo (template slug + variáveis) */
  templateSlug: string;
  /** Variáveis pro template */
  variaveis: Record<string, string>;
  enviado: boolean;
  enviadoEm?: string;
  erro?: string;
}

/** Política de cancelamento com tiers de reembolso */
export interface EventoPoliticaCancelamento {
  id: string;
  eventoId?: string;
  nome: string;
  /** Tiers ordenados do mais distante para o mais próximo do evento */
  tiers: Array<{
    /** Horas antes do início */
    horasAntes: number;
    /** Percentual de reembolso (0-100) */
    percentualReembolso: number;
    descricao: string;
  }>;
  /** Permite transferência para outra pessoa? */
  permiteTransferencia: boolean;
  /** Taxa administrativa fixa em centavos */
  taxaAdministrativaCents: number;
}

// ---------------------------------------------------------------------------
// 3. CRUD de eventos
// ---------------------------------------------------------------------------

/** Cria um novo evento (apenas organizador autenticado) */
export function criarEvento(
  parcial: Omit<Evento, 'id' | 'criadoEm' | 'atualizadoEm' | 'confirmados' | 'listaEspera' | 'precoMinimoCents' | 'slug'> & { slug?: string },
  agora: string = new Date().toISOString(),
): Evento {
  if (!parcial.titulo || parcial.titulo.trim().length < 3) {
    throw new Error('Titulo do evento deve ter ao menos 3 caracteres');
  }
  if (new Date(parcial.terminaEm) <= new Date(parcial.iniciaEm)) {
    throw new Error('terminaEm deve ser maior que iniciaEm');
  }
  const precoMin = parcial.ticketTypes.length
    ? Math.min(...parcial.ticketTypes.map((t) => t.precoCents))
    : 0;
  const id = gerarId('evt');
  const slug = parcial.slug ?? slugificar(parcial.titulo, id);
  return {
    ...parcial,
    id,
    slug,
    precoMinimoCents: precoMin,
    confirmados: 0,
    listaEspera: 0,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

/** Lê um evento por ID (helper — em produção viria do DB) */
export function lerEvento(eventos: Evento[], id: string): Evento | undefined {
  return eventos.find((e) => e.id === id);
}

/** Atualiza parcialmente um evento */
export function atualizarEvento(
  evento: Evento,
  patch: Partial<Omit<Evento, 'id' | 'criadoEm' | 'organizadorId'>>,
  agora: string = new Date().toISOString(),
): Evento {
  if (patch.iniciaEm && patch.terminaEm) {
    if (new Date(patch.terminaEm) <= new Date(patch.iniciaEm)) {
      throw new Error('Intervalo de datas invalido');
    }
  }
  if (patch.ticketTypes) {
    patch.precoMinimoCents = Math.min(...patch.ticketTypes.map((t) => t.precoCents));
  }
  return { ...evento, ...patch, atualizadoEm: agora };
}

/** Soft delete: arquiva (mantém histórico) */
export function arquivarEvento(evento: Evento, agora: string = new Date().toISOString()): Evento {
  return { ...evento, status: 'arquivado', atualizadoEm: agora };
}

/** Cancelamento explícito: notifica participantes e bloqueia novos RSVPs */
export function cancelarEvento(
  evento: Evento,
  motivo: string,
  agora: string = new Date().toISOString(),
): Evento {
  if (evento.status === 'concluido') {
    throw new Error('Nao e possivel cancelar evento ja concluido');
  }
  if (!motivo || motivo.trim().length < 5) {
    throw new Error('Motivo do cancelamento deve ter ao menos 5 caracteres');
  }
  return { ...evento, status: 'cancelado', atualizadoEm: agora, descricao: `${evento.descricao}\n\n[CANCELADO: ${motivo}]` };
}

/** Remove definitivamente (hard delete — só pra rascunhos) */
export function deletarEvento(evento: Evento): { deletado: true; id: string } {
  if (evento.status !== 'rascunho' && evento.status !== 'arquivado') {
    throw new Error('Apenas eventos em rascunho ou arquivados podem ser deletados definitivamente');
  }
  return { deletado: true, id: evento.id };
}

/** Duplica um evento (recorrência manual) */
export function duplicarEvento(
  evento: Evento,
  novoInicio: string,
  agora: string = new Date().toISOString(),
): Evento {
  const duracao = new Date(evento.terminaEm).getTime() - new Date(evento.iniciaEm).getTime();
  const novoFim = new Date(new Date(novoInicio).getTime() + duracao).toISOString();
  const id = gerarId('evt');
  return {
    ...evento,
    id,
    slug: slugificar(`${evento.titulo} copia`, id),
    iniciaEm: novoInicio,
    terminaEm: novoFim,
    status: 'rascunho',
    eventoPaiId: evento.id,
    confirmados: 0,
    listaEspera: 0,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

// ---------------------------------------------------------------------------
// 4. Ticket types — regras de preço, estoque, promoções
// ---------------------------------------------------------------------------

/** Cria um tipo de ingresso com validações */
export function criarTicketType(
  parcial: Omit<EventoTicketType, 'id' | 'vendidos'>,
  agora: string = new Date().toISOString(),
): EventoTicketType {
  if (parcial.precoCents < 0) {
    throw new Error('Preco nao pode ser negativo');
  }
  if (parcial.quantidade !== undefined && parcial.quantidade < 0) {
    throw new Error('Quantidade nao pode ser negativa');
  }
  if (parcial.limitePorPessoa !== undefined && parcial.limitePorPessoa < 1) {
    throw new Error('Limite por pessoa deve ser ao menos 1');
  }
  if (parcial.vendasAbremEm && parcial.vendasFechamEm) {
    if (new Date(parcial.vendasFechamEm) <= new Date(parcial.vendasAbremEm)) {
      throw new Error('Janela de vendas invalida');
    }
  }
  return {
    ...parcial,
    id: gerarId('tkt'),
    vendidos: 0,
  };
}

/** Verifica se o ticket type está disponível para venda */
export function ticketEstaDisponivel(
  ticket: EventoTicketType,
  agora: string = new Date().toISOString(),
): { disponivel: boolean; motivo?: string } {
  if (ticket.vendasAbremEm && new Date(ticket.vendasAbremEm) > new Date(agora)) {
    return { disponivel: false, motivo: 'Vendas ainda nao abriram' };
  }
  if (ticket.vendasFechamEm && new Date(ticket.vendasFechamEm) < new Date(agora)) {
    return { disponivel: false, motivo: 'Vendas encerradas' };
  }
  if (ticket.quantidade !== undefined && ticket.vendidos >= ticket.quantidade) {
    return { disponivel: false, motivo: 'Esgotado' };
  }
  return { disponivel: true };
}

/** Reserva um ticket (incrementa contador atomicamente) */
export function reservarTicket(
  ticket: EventoTicketType,
  agora: string = new Date().toISOString(),
): EventoTicketType {
  const disp = ticketEstaDisponivel(ticket, agora);
  if (!disp.disponivel) {
    throw new Error(`Ticket indisponivel: ${disp.motivo}`);
  }
  if (ticket.quantidade !== undefined && ticket.vendidos + 1 > ticket.quantidade) {
    throw new Error('Estouro de capacidade do ticket');
  }
  return { ...ticket, vendidos: ticket.vendidos + 1 };
}

/** Estorna um ticket (cancelamento, no-show revertido) */
export function estornarTicket(ticket: EventoTicketType): EventoTicketType {
  if (ticket.vendidos <= 0) {
    throw new Error('Nenhum ticket vendido para estornar');
  }
  return { ...ticket, vendidos: ticket.vendidos - 1 };
}

/** Aplica código promocional ao ticket type (ex: ESTUDANTE2026) */
export function validarCodigoPromocional(
  ticket: EventoTicketType,
  codigo: string,
): { valido: boolean; motivo?: string } {
  if (!ticket.codigoRequerido) {
    return { valido: true }; // Sem código requerido
  }
  if (!codigo || codigo.trim().toUpperCase() !== ticket.codigoRequerido.toUpperCase()) {
    return { valido: false, motivo: 'Codigo promocional invalido' };
  }
  return { valido: true };
}

// ---------------------------------------------------------------------------
// 5. RSVP — inscrição, fila de espera, presença
// ---------------------------------------------------------------------------

/** Inscreve um participante em um evento */
export function inscreverEmEvento(
  evento: Evento,
  ticketTypeId: string,
  participante: { usuarioId: string; nome: string; email: string; notas?: string },
  agora: string = new Date().toISOString(),
): { rsvp: EventoRsvp; evento: Evento; emEspera: boolean } {
  const ticket = evento.ticketTypes.find((t) => t.id === ticketTypeId);
  if (!ticket) {
    throw new Error('Ticket type nao encontrado');
  }
  if (evento.status !== 'publicado') {
    throw new Error('Evento nao esta aberto para inscricoes');
  }
  const capacidadeEsgotada = evento.capacidade !== undefined && evento.confirmados >= evento.capacidade;
  const emEspera = capacidadeEsgotada;
  const rsvp: EventoRsvp = {
    id: gerarId('rsvp'),
    eventoId: evento.id,
    ticketTypeId,
    usuarioId: participante.usuarioId,
    nomeParticipante: participante.nome,
    email: participante.email,
    status: emEspera ? 'lista-espera' : 'pendente',
    posicaoEspera: emEspera ? evento.listaEspera + 1 : undefined,
    precoPagoCents: ticket.precoCents,
    moeda: ticket.moeda,
    codigoCheckin: gerarCodigoCheckin(evento.id, participante.usuarioId),
    notas: participante.notas,
    historico: [],
    criadoEm: agora,
    atualizadoEm: agora,
  };
  const novoEvento: Evento = {
    ...evento,
    confirmados: emEspera ? evento.confirmados : evento.confirmados + 1,
    listaEspera: emEspera ? evento.listaEspera + 1 : evento.listaEspera,
    atualizadoEm: agora,
  };
  return { rsvp, evento: novoEvento, emEspera };
}

/** Confirma pagamento do RSVP (pendente → confirmado) */
export function confirmarPagamentoRsvp(rsvp: EventoRsvp, agora: string = new Date().toISOString()): EventoRsvp {
  if (rsvp.status !== 'pendente') {
    throw new Error(`RSVP em status ${rsvp.status} nao pode ter pagamento confirmado`);
  }
  return {
    ...rsvp,
    status: 'confirmado',
    posicaoEspera: undefined,
    atualizadoEm: agora,
    historico: [...rsvp.historico, { de: 'pendente', para: 'confirmado', em: agora, motivo: 'pagamento-aprovado' }],
  };
}

/** Cancela um RSVP (reembolsa de acordo com a política) */
export function cancelarRsvp(
  rsvp: EventoRsvp,
  motivo: string,
  agora: string = new Date().toISOString(),
): EventoRsvp {
  if (rsvp.status === 'cancelado') {
    throw new Error('RSVP ja foi cancelado');
  }
  return {
    ...rsvp,
    status: 'cancelado',
    posicaoEspera: undefined,
    atualizadoEm: agora,
    historico: [...rsvp.historico, { de: rsvp.status, para: 'cancelado', em: agora, motivo }],
  };
}

/** Promove o próximo da lista de espera quando há cancelamento/vaga */
export function promoverDaListaEspera(
  rsvp: EventoRsvp,
  agora: string = new Date().toISOString(),
): EventoRsvp {
  if (rsvp.status !== 'lista-espera') {
    throw new Error('RSVP nao esta na lista de espera');
  }
  return {
    ...rsvp,
    status: 'pendente',
    posicaoEspera: undefined,
    atualizadoEm: agora,
    historico: [...rsvp.historico, { de: 'lista-espera', para: 'pendente', em: agora, motivo: 'vaga-aberta' }],
  };
}

/** Marca comparecimento (check-in pós-evento) */
export function marcarComparecimento(
  rsvp: EventoRsvp,
  compareceu: boolean,
  agora: string = new Date().toISOString(),
): EventoRsvp {
  if (rsvp.status !== 'confirmado' && rsvp.status !== 'pendente') {
    throw new Error('Apenas RSVPs ativos podem ter comparecimento marcado');
  }
  return {
    ...rsvp,
    status: compareceu ? 'compareceu' : 'faltou',
    checkinFeitoEm: compareceu ? (rsvp.checkinFeitoEm ?? agora) : rsvp.checkinFeitoEm,
    atualizadoEm: agora,
    historico: [
      ...rsvp.historico,
      { de: rsvp.status, para: compareceu ? 'compareceu' : 'faltou', em: agora },
    ],
  };
}

/** Reordena fila de espera após cancelamento (helper interno) */
export function reordenarListaEspera(rsvps: EventoRsvp[], agora: string = new Date().toISOString()): EventoRsvp[] {
  const emEspera = rsvps
    .filter((r) => r.status === 'lista-espera')
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  return rsvps.map((r) => {
    if (r.status !== 'lista-espera') return r;
    const idx = emEspera.findIndex((x) => x.id === r.id);
    if (idx === -1) return r;
    return { ...r, posicaoEspera: idx + 1, atualizadoEm: agora };
  });
}

// ---------------------------------------------------------------------------
// 6. Recorrência — RRULE simplificado
// ---------------------------------------------------------------------------

/** Expande uma recorrência em N ocorrências concretas */
export function expandirRecorrencia(
  eventoBase: Evento,
  ateFinal: string = eventoBase.iniciaEm,
  limite: number = 50,
): Evento[] {
  if (!eventoBase.recorrencia) return [eventoBase];
  const recorrencia = eventoBase.recorrencia;
  const dataLimiteFinal = new Date(recorrencia.dataFim ?? ateFinal);
  const ocorrencias: Evento[] = [];
  const dataBaseMs = new Date(eventoBase.iniciaEm).getTime();
  const duracaoMs = new Date(eventoBase.terminaEm).getTime() - dataBaseMs;
  let cursor = new Date(eventoBase.iniciaEm);
  let contador = 0;
  while (ocorrencias.length < limite && cursor <= dataLimiteFinal) {
    if (contador > 0) {
      const isoData = cursor.toISOString();
      if (!recorrencia.excecoes.includes(isoData.split('T')[0]!)) {
        const novaOcorrencia: Evento = {
          ...eventoBase,
          id: `${eventoBase.id}#${contador}`,
          slug: `${eventoBase.slug}-${contador}`,
          iniciaEm: isoData,
          terminaEm: new Date(cursor.getTime() + duracaoMs).toISOString(),
          eventoPaiId: eventoBase.id,
          confirmados: 0,
          listaEspera: 0,
        };
        ocorrencias.push(novaOcorrencia);
      }
    } else {
      // Primeira ocorrência é o próprio evento base
      ocorrencias.push(eventoBase);
    }
    cursor = proximaDataRecorrencia(cursor, recorrencia);
    contador += 1;
    if (recorrencia.totalOcorrencias && ocorrencias.length >= recorrencia.totalOcorrencias) break;
    if (contador > 365) break; // safety
  }
  return ocorrencias;
}

/** Avança o cursor para a próxima data conforme a regra */
export function proximaDataRecorrencia(
  cursor: Date,
  regra: EventoRecorrencia,
): Date {
  const prox = new Date(cursor);
  if (regra.frequencia === 'diaria') {
    prox.setUTCDate(prox.getUTCDate() + (regra.intervalo || 1));
    return prox;
  }
  if (regra.frequencia === 'semanal') {
    if (regra.diasSemana && regra.diasSemana.length > 0) {
      // Próximo dia da semana dentro do conjunto
      for (let i = 1; i <= 7; i += 1) {
        const candidato = new Date(cursor);
        candidato.setUTCDate(candidato.getUTCDate() + i);
        const dow = candidato.getUTCDay();
        if (regra.diasSemana.includes(dow)) return candidato;
      }
    }
    prox.setUTCDate(prox.getUTCDate() + 7 * (regra.intervalo || 1));
    return prox;
  }
  if (regra.frequencia === 'mensal') {
    if (regra.diaMes) {
      prox.setUTCMonth(prox.getUTCMonth() + (regra.intervalo || 1));
      prox.setUTCDate(Math.min(regra.diaMes, diasNoMes(prox.getUTCFullYear(), prox.getUTCMonth() + 1)));
      return prox;
    }
    prox.setUTCMonth(prox.getUTCMonth() + (regra.intervalo || 1));
    return prox;
  }
  return prox;
}

/** Adiciona uma exceção (data específica) à recorrência */
export function adicionarExcecaoRecorrencia(
  regra: EventoRecorrencia,
  dataIso: string,
): EventoRecorrencia {
  const data = dataIso.split('T')[0]!;
  if (regra.excecoes.includes(data)) return regra;
  return { ...regra, excecoes: [...regra.excecoes, data] };
}

/** Valida a regra de recorrência */
export function validarRegraRecorrencia(regra: EventoRecorrencia): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  if (regra.intervalo < 1) erros.push('Intervalo deve ser >= 1');
  if (regra.frequencia === 'semanal' && (!regra.diasSemana || regra.diasSemana.length === 0)) {
    erros.push('Recorrencia semanal requer diasSemana');
  }
  if (regra.frequencia === 'mensal' && regra.diaMes !== undefined && (regra.diaMes < 1 || regra.diaMes > 31)) {
    erros.push('diaMes deve estar entre 1 e 31');
  }
  if (regra.dataFim && regra.totalOcorrencias) {
    erros.push('Use dataFim OU totalOcorrencias, nao ambos');
  }
  return { valido: erros.length === 0, erros };
}

// ---------------------------------------------------------------------------
// 7. Calendário — views e detecção de conflito
// ---------------------------------------------------------------------------

/** Agrupa eventos por dia no formato YYYY-MM-DD (timezone-aware) */
export function eventosPorMes(eventos: Evento[], ano: number, mes: number, timezone: string = 'UTC'): Map<string, Evento[]> {
  const grupos = new Map<string, Evento[]>();
  for (const evento of eventos) {
    const chave = formatarDiaEmTimezone(evento.iniciaEm, timezone);
    if (!chave.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}`)) continue;
    const lista = grupos.get(chave) ?? [];
    lista.push(evento);
    grupos.set(chave, lista);
  }
  return grupos;
}

/** Visão semanal (7 dias) a partir de uma data base */
export function eventosDaSemana(eventos: Evento[], dataBase: string, timezone: string = 'UTC'): Evento[][] {
  const inicio = new Date(dataBase);
  const inicioMs = inicio.getTime();
  const diaMs = 24 * 60 * 60 * 1000;
  const dias: Evento[][] = [[], [], [], [], [], [], []];
  for (const evento of eventos) {
    const evMs = new Date(evento.iniciaEm).getTime();
    const diffDias = Math.floor((evMs - inicioMs) / diaMs);
    if (diffDias >= 0 && diffDias < 7) {
      dias[diffDias]!.push(evento);
    }
  }
  return dias;
}

/** Visão diária — todos os eventos de um dia */
export function eventosDoDia(eventos: Evento[], dataIso: string, timezone: string = 'UTC'): Evento[] {
  const chave = formatarDiaEmTimezone(dataIso, timezone);
  return eventos
    .filter((e) => formatarDiaEmTimezone(e.iniciaEm, timezone) === chave)
    .sort((a, b) => a.iniciaEm.localeCompare(b.iniciaEm));
}

/** Detecta conflitos de horário entre dois eventos no mesmo calendário */
export function detectarConflito(eventoA: Evento, eventoB: Evento): boolean {
  if (eventoA.id === eventoB.id) return false;
  if (eventoA.timezone !== eventoB.timezone) {
    // Em produção converteríamos via Intl.DateTimeFormat; aqui simplificamos
    return sobrepoeIntervalo(eventoA.iniciaEm, eventoA.terminaEm, eventoB.iniciaEm, eventoB.terminaEm);
  }
  return sobrepoeIntervalo(eventoA.iniciaEm, eventoA.terminaEm, eventoB.iniciaEm, eventoB.terminaEm);
}

/** Detecta todos os conflitos em uma lista */
export function listarConflitos(eventos: Evento[]): Array<{ a: string; b: string }> {
  const conflitos: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < eventos.length; i += 1) {
    for (let j = i + 1; j < eventos.length; j += 1) {
      if (detectarConflito(eventos[i]!, eventos[j]!)) {
        conflitos.push({ a: eventos[i]!.id, b: eventos[j]!.id });
      }
    }
  }
  return conflitos;
}

// ---------------------------------------------------------------------------
// 8. Notificações — lembretes e alertas
// ---------------------------------------------------------------------------

/** Gera notificações de lembrete para um evento (T-24h, T-1h, T-15min) */
export function agendarLembretes(
  evento: Evento,
  rsvpId: string,
  agora: string = new Date().toISOString(),
): EventoNotificacao[] {
  const inicio = new Date(evento.iniciaEm);
  const tipos: Array<{ tipo: NotificacaoEventoTipo; horas: number }> = [
    { tipo: 'lembrete-24h', horas: 24 },
    { tipo: 'lembrete-1h', horas: 1 },
    { tipo: 'lembrete-15min', horas: 0.25 },
  ];
  return tipos.map(({ tipo, horas }) => {
    const dispara = new Date(inicio.getTime() - horas * 60 * 60 * 1000).toISOString();
    return {
      id: gerarId('notif'),
      eventoId: evento.id,
      rsvpId,
      tipo,
      canal: 'email',
      disparaEm: dispara,
      templateSlug: tipo,
      variaveis: {
        titulo: evento.titulo,
        inicio: evento.iniciaEm,
        tipo: evento.tipo,
        modalidade: evento.modalidade,
      },
      enviado: false,
    };
  });
}

/** Notifica todos os participantes sobre cancelamento */
export function agendarNotificacaoCancelamento(
  evento: Evento,
  motivo: string,
  agora: string = new Date().toISOString(),
): EventoNotificacao {
  return {
    id: gerarId('notif'),
    eventoId: evento.id,
    tipo: 'cancelamento',
    canal: 'email',
    disparaEm: agora,
    templateSlug: 'evento-cancelado',
    variaveis: {
      titulo: evento.titulo,
      motivo,
      reembolsoInfo: 'Reembolso automatico em ate 7 dias uteis',
    },
    enviado: false,
  };
}

/** Marca notificação como enviada (helper idempotente) */
export function marcarNotificacaoEnviada(
  notif: EventoNotificacao,
  sucesso: boolean,
  erro?: string,
  agora: string = new Date().toISOString(),
): EventoNotificacao {
  if (notif.enviado) return notif;
  return {
    ...notif,
    enviado: sucesso,
    enviadoEm: sucesso ? agora : notif.enviadoEm,
    erro: sucesso ? undefined : (erro ?? 'Falha desconhecida'),
  };
}

// ---------------------------------------------------------------------------
// 9. Check-in — QR code, validação, entrada tardia
// ---------------------------------------------------------------------------

/** Gera payload do QR code (string que vai no QR) */
export function gerarPayloadQR(eventoId: string, rsvpId: string, codigo: string): string {
  return `akasha://evento/${eventoId}/rsvp/${rsvpId}?token=${codigo}`;
}

/** Valida o token escaneado */
export function validarTokenQR(
  payload: string,
  rsvps: EventoRsvp[],
): { valido: boolean; rsvp?: EventoRsvp; motivo?: string } {
  const match = payload.match(/^akasha:\/\/evento\/([^/]+)\/rsvp\/([^/]+)\?token=(.+)$/);
  if (!match) {
    return { valido: false, motivo: 'Formato de QR invalido' };
  }
  const [, eventoId, rsvpId, token] = match;
  const rsvp = rsvps.find((r) => r.id === rsvpId && r.eventoId === eventoId);
  if (!rsvp) return { valido: false, motivo: 'RSVP nao encontrado' };
  if (rsvp.codigoCheckin !== token) return { valido: false, motivo: 'Token invalido' };
  if (rsvp.status === 'cancelado') return { valido: false, motivo: 'Inscricao cancelada' };
  return { valido: true, rsvp };
}

/** Registra check-in (chamado após validação) */
export function registrarCheckin(
  rsvp: EventoRsvp,
  agora: string = new Date().toISOString(),
): EventoRsvp {
  if (rsvp.checkinFeitoEm) {
    throw new Error('Check-in ja foi realizado');
  }
  if (rsvp.status === 'cancelado' || rsvp.status === 'lista-espera') {
    throw new Error(`RSVP em status ${rsvp.status} nao pode fazer check-in`);
  }
  return {
    ...rsvp,
    status: 'compareceu',
    checkinFeitoEm: agora,
    atualizadoEm: agora,
  };
}

/** Decide se a entrada tardia é permitida (ex: > 15 min após início) */
export function podeEntrarTardiamente(evento: Evento, agora: string = new Date().toISOString()): { pode: boolean; minutosAtraso: number; motivo?: string } {
  const inicio = new Date(evento.iniciaEm).getTime();
  const agoraMs = new Date(agora).getTime();
  const atrasoMinutos = Math.floor((agoraMs - inicio) / 60000);
  if (atrasoMinutos <= 15) return { pode: true, minutosAtraso: Math.max(0, atrasoMinutos) };
  if (atrasoMinutos <= 60 && (evento.tipo === 'palestra' || evento.tipo === 'circulo-estudo')) {
    return { pode: true, minutosAtraso: atrasoMinutos, motivo: 'Entrada tardia permitida' };
  }
  return { pode: false, minutosAtraso: atrasoMinutos, motivo: 'Atraso excede tolerancia' };
}

// ---------------------------------------------------------------------------
// 10. Gravação — gating por acesso
// ---------------------------------------------------------------------------

/** Vincula uma gravação a um evento */
export function vincularGravacao(
  evento: Evento,
  gravacao: Omit<EventoGravacao, 'id' | 'eventoId' | 'publicadoEm'>,
  agora: string = new Date().toISOString(),
): EventoGravacao {
  if (evento.status !== 'concluido' && evento.status !== 'em-andamento') {
    throw new Error('Gravacoes so podem ser vinculadas a eventos em andamento ou concluidos');
  }
  if (gravacao.duracaoSegundos <= 0) {
    throw new Error('Duracao da gravacao deve ser positiva');
  }
  return {
    ...gravacao,
    id: gerarId('grav'),
    eventoId: evento.id,
    publicadoEm: agora,
  };
}

/** Verifica se um RSVP pode acessar a gravação */
export function podeAcessarGravacao(
  gravacao: EventoGravacao,
  rsvp: EventoRsvp | null,
  usuarioLogadoId: string | null,
): { acesso: boolean; precoCents?: number; motivo?: string } {
  if (gravacao.visibilidade === 'todos') {
    return { acesso: true };
  }
  if (!rsvp || !usuarioLogadoId) {
    return { acesso: false, motivo: 'Login e inscricao necessarios' };
  }
  if (rsvp.usuarioId !== usuarioLogadoId) {
    return { acesso: false, motivo: 'RSVP nao pertence ao usuario' };
  }
  if (gravacao.visibilidade === 'participantes') {
    const compareceu = rsvp.status === 'confirmado' || rsvp.status === 'compareceu' || rsvp.status === 'pendente';
    return compareceu
      ? { acesso: true }
      : { acesso: false, motivo: 'Apenas participantes' };
  }
  // visibilidade = 'pago'
  return { acesso: false, precoCents: gravacao.precoAcessoCents, motivo: 'Pagamento requerido' };
}

// ---------------------------------------------------------------------------
// 11. Reviews — NPS, fotos, moderação
// ---------------------------------------------------------------------------

/** Submete uma avaliação pós-evento */
export function submeterReview(
  parcial: Omit<EventoReview, 'id' | 'criadoEm' | 'aprovado'>,
  eventoTerminou: boolean,
  rsvpFoiConfirmado: boolean,
  agora: string = new Date().toISOString(),
): EventoReview {
  if (!eventoTerminou) {
    throw new Error('Avaliacoes so podem ser enviadas apos o termino do evento');
  }
  if (!rsvpFoiConfirmado) {
    throw new Error('Apenas participantes confirmados podem avaliar');
  }
  if (parcial.nota < 1 || parcial.nota > 5) {
    throw new Error('Nota deve ser entre 1 e 5');
  }
  if (parcial.notaInstrutor < 1 || parcial.notaInstrutor > 5) {
    throw new Error('Nota do instrutor deve ser entre 1 e 5');
  }
  if (parcial.nps < 0 || parcial.nps > 10) {
    throw new Error('NPS deve ser entre 0 e 10');
  }
  return {
    ...parcial,
    id: gerarId('rev'),
    aprovado: false, // passa por moderação
    criadoEm: agora,
  };
}

/** Calcula NPS agregado a partir de reviews */
export function calcularNps(reviews: EventoReview[]): { nps: number; promotores: number; detratores: number; neutros: number; total: number } {
  if (reviews.length === 0) {
    return { nps: 0, promotores: 0, detratores: 0, neutros: 0, total: 0 };
  }
  let promotores = 0;
  let detratores = 0;
  let neutros = 0;
  for (const r of reviews) {
    if (r.nps >= 9) promotores += 1;
    else if (r.nps <= 6) detratores += 1;
    else neutros += 1;
  }
  const nps = Math.round(((promotores - detratores) / reviews.length) * 100);
  return { nps, promotores, detratores, neutros, total: reviews.length };
}

/** Calcula rating médio do evento */
export function ratingMedio(reviews: EventoReview[]): { geral: number; instrutor: number; total: number } {
  if (reviews.length === 0) return { geral: 0, instrutor: 0, total: 0 };
  const somaGeral = reviews.reduce((acc, r) => acc + r.nota, 0);
  const somaInstr = reviews.reduce((acc, r) => acc + r.notaInstrutor, 0);
  return {
    geral: Number((somaGeral / reviews.length).toFixed(2)),
    instrutor: Number((somaInstr / reviews.length).toFixed(2)),
    total: reviews.length,
  };
}

/** Aprova review para exibição pública */
export function aprovarReview(review: EventoReview, aprovado: boolean): EventoReview {
  return { ...review, aprovado };
}

// ---------------------------------------------------------------------------
// 12. Capacity management — soft cap, hard cap, dynamic pricing
// ---------------------------------------------------------------------------

/** Verifica se deve ativar lista de espera (soft cap) */
export function deveAbrirListaEspera(evento: Evento, agora: string = new Date().toISOString()): boolean {
  if (evento.capacidadeSuave === undefined) return false;
  return evento.confirmados >= evento.capacidadeSuave && evento.confirmados < (evento.capacidade ?? Infinity);
}

/** Verifica se hard cap foi atingido (não permite mais inscrições) */
export function hardCapAtingido(evento: Evento): boolean {
  if (evento.capacidade === undefined) return false;
  return evento.confirmados >= evento.capacidade;
}

/** Calcula preço dinâmico (sobe quando ocupação passa de X%) */
export function calcularPrecoDinamico(
  ticket: EventoTicketType,
  evento: Evento,
  gatilhoOcupacao: number = 0.8,
  multiplicador: number = 1.2,
): { precoCents: number; dinamico: boolean; ocupacao: number } {
  if (evento.capacidade === undefined) return { precoCents: ticket.precoCents, dinamico: false, ocupacao: 0 };
  const ocupacao = evento.confirmados / evento.capacidade;
  if (ocupacao >= gatilhoOcupacao) {
    return {
      precoCents: Math.round(ticket.precoCents * multiplicador),
      dinamico: true,
      ocupacao,
    };
  }
  return { precoCents: ticket.precoCents, dinamico: false, ocupacao };
}

/** Sugere lotear soft cap dinamicamente (aumenta cap em ondas) */
export function expandirCapacidade(
  evento: Evento,
  novoLimite: number,
): Evento {
  if (novoLimite < evento.confirmados) {
    throw new Error('Novo limite nao pode ser menor que o numero de confirmados');
  }
  return { ...evento, capacidade: novoLimite, capacidadeSuave: Math.floor(novoLimite * 0.9) };
}

// ---------------------------------------------------------------------------
// 13. Política de cancelamento e reembolso
// ---------------------------------------------------------------------------

/** Política padrão — usada quando evento não tem política customizada */
export function politicaCancelamentoPadrao(id: string = 'padrao'): EventoPoliticaCancelamento {
  return {
    id,
    nome: 'Padrao Akasha',
    tiers: [
      { horasAntes: 24 * 7, percentualReembolso: 100, descricao: 'Mais de 7 dias: reembolso integral' },
      { horasAntes: 24, percentualReembolso: 50, descricao: 'Entre 1 e 7 dias: 50% de reembolso' },
      { horasAntes: 0, percentualReembolso: 0, descricao: 'Menos de 24h: sem reembolso' },
    ],
    permiteTransferencia: true,
    taxaAdministrativaCents: 500,
  };
}

/** Cria uma política customizada */
export function criarPoliticaCancelamento(
  tiers: Array<{ horasAntes: number; percentualReembolso: number; descricao: string }>,
  permiteTransferencia: boolean = true,
  taxa: number = 0,
  nome: string = 'Customizada',
): EventoPoliticaCancelamento {
  if (tiers.length === 0) {
    throw new Error('Politica deve ter ao menos 1 tier');
  }
  const ordenados = [...tiers].sort((a, b) => b.horasAntes - a.horasAntes);
  for (const t of ordenados) {
    if (t.percentualReembolso < 0 || t.percentualReembolso > 100) {
      throw new Error('Percentual de reembolso deve estar entre 0 e 100');
    }
  }
  return {
    id: gerarId('pol'),
    nome,
    tiers: ordenados,
    permiteTransferencia,
    taxaAdministrativaCents: taxa,
  };
}

/** Calcula o reembolso aplicável para um RSVP em um instante */
export function calcularReembolso(
  politica: EventoPoliticaCancelamento,
  rsvp: EventoRsvp,
  evento: Evento,
  agora: string = new Date().toISOString(),
): { valorCents: number; percentual: number; taxaCents: number; liquidoCents: number; motivo: string } {
  const horasAteInicio = (new Date(evento.iniciaEm).getTime() - new Date(agora).getTime()) / (60 * 60 * 1000);
  let tierAplicado = politica.tiers[politica.tiers.length - 1]!;
  for (const t of politica.tiers) {
    if (horasAteInicio >= t.horasAntes) {
      tierAplicado = t;
      break;
    }
  }
  const valorBruto = Math.round((rsvp.precoPagoCents * tierAplicado.percentualReembolso) / 100);
  const liquido = Math.max(0, valorBruto - politica.taxaAdministrativaCents);
  return {
    valorCents: valorBruto,
    percentual: tierAplicado.percentualReembolso,
    taxaCents: politica.taxaAdministrativaCents,
    liquidoCents: liquido,
    motivo: tierAplicado.descricao,
  };
}

/** Transfere um RSVP para outro participante (se política permite) */
export function transferirRsvp(
  rsvp: EventoRsvp,
  novoParticipante: { usuarioId: string; nome: string; email: string },
  politica: EventoPoliticaCancelamento,
  agora: string = new Date().toISOString(),
): EventoRsvp {
  if (!politica.permiteTransferencia) {
    throw new Error('Politica nao permite transferencia');
  }
  if (rsvp.status === 'cancelado' || rsvp.status === 'lista-espera') {
    throw new Error('Apenas RSVPs confirmados podem ser transferidos');
  }
  return {
    ...rsvp,
    usuarioId: novoParticipante.usuarioId,
    nomeParticipante: novoParticipante.nome,
    email: novoParticipante.email,
    codigoCheckin: gerarCodigoCheckin(rsvp.eventoId, novoParticipante.usuarioId),
    atualizadoEm: agora,
    historico: [...rsvp.historico, { de: rsvp.status, para: rsvp.status, em: agora, motivo: `transferido-para:${novoParticipante.usuarioId}` }],
  };
}

// ---------------------------------------------------------------------------
// 14. Helpers internos
// ---------------------------------------------------------------------------

/** Slugifica um título removendo acentos e caracteres especiais */
export function slugificar(texto: string, fallbackId: string = 'evento'): string {
  const mapaAcentos: Record<string, string> = {
    a: '[aáàâãä]',
    e: '[eéèêë]',
    i: '[iíìîï]',
    o: '[oóòôõö]',
    u: '[uúùûü]',
    c: '[cç]',
    n: '[nñ]',
  };
  const slug = texto
    .toLowerCase()
    .trim()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || fallbackId;
}

/** Gera um ID curto com prefixo semântico (mock — produção usaria UUID v7) */
export function gerarId(prefixo: string): string {
  const aleatorio = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefixo}_${timestamp}${aleatorio}`;
}

/** Gera código de check-in (token único por RSVP) */
export function gerarCodigoCheckin(eventoId: string, usuarioId: string): string {
  // Combinação simples — produção usaria HMAC + salt
  const base = `${eventoId}:${usuarioId}:${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(8, '0');
}

/** Formata data ISO em YYYY-MM-DD considerando timezone (simplificado) */
export function formatarDiaEmTimezone(iso: string, timezone: string): string {
  // Em produção usaríamos Intl.DateTimeFormat; aqui simplificamos com offset fixo
  const d = new Date(iso);
  const offsetMinutos = obterOffsetTimezone(timezone, d);
  const local = new Date(d.getTime() + offsetMinutos * 60000);
  return local.toISOString().split('T')[0]!;
}

/** Retorna offset em minutos de uma timezone (mock simplificado) */
export function obterOffsetTimezone(timezone: string, data: Date = new Date()): number {
  const mapa: Record<string, number> = {
    'America/Sao_Paulo': -180,
    'America/New_York': -300,
    'America/Los_Angeles': -480,
    'Europe/Lisbon': 0,
    'Europe/London': 0,
    UTC: 0,
  };
  // Simplificação: não tratamos DST. Em produção usaríamos Intl.DateTimeFormat.
  if (timezone in mapa) return mapa[timezone]!;
  // Tenta extrair offset do nome (ex: "UTC+03:00")
  const match = timezone.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/i);
  if (match) {
    const sinal = match[1] === '-' ? -1 : 1;
    const horas = parseInt(match[2] ?? '0', 10);
    const minutos = parseInt(match[3] ?? '0', 10);
    return sinal * (horas * 60 + minutos);
  }
  void data;
  return 0;
}

/** Verifica sobreposição entre dois intervalos ISO */
export function sobrepoeIntervalo(aInicio: string, aFim: string, bInicio: string, bFim: string): boolean {
  const ai = new Date(aInicio).getTime();
  const af = new Date(aFim).getTime();
  const bi = new Date(bInicio).getTime();
  const bf = new Date(bFim).getTime();
  return ai < bf && bi < af;
}

/** Retorna o número de dias em um mês (1-12) */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getUTCDate();
}

// ---------------------------------------------------------------------------
// 15. Estatísticas e agregadores
// ---------------------------------------------------------------------------

/** Calcula taxa de comparecimento (no-show rate) */
export function taxaComparecimento(rsvps: EventoRsvp[]): { compareceram: number; faltaram: number; pendentes: number; taxa: number } {
  let compareceram = 0;
  let faltaram = 0;
  let pendentes = 0;
  for (const r of rsvps) {
    if (r.status === 'compareceu') compareceram += 1;
    else if (r.status === 'faltou') faltaram += 1;
    else if (r.status === 'confirmado' || r.status === 'pendente') pendentes += 1;
  }
  const decididos = compareceram + faltaram;
  return {
    compareceram,
    faltaram,
    pendentes,
    taxa: decididos === 0 ? 0 : Number(((compareceram / decididos) * 100).toFixed(2)),
  };
}

/** Calcula receita total confirmada de um evento */
export function receitaTotal(rsvps: EventoRsvp[]): { totalCents: number; moeda: string; porTicketType: Record<string, number> } {
  const pagos = rsvps.filter((r) => r.status === 'confirmado' || r.status === 'compareceu' || r.status === 'pendente');
  const totalCents = pagos.reduce((acc, r) => acc + r.precoPagoCents, 0);
  const moeda = pagos[0]?.moeda ?? 'BRL';
  const porTicketType: Record<string, number> = {};
  for (const r of pagos) {
    porTicketType[r.ticketTypeId] = (porTicketType[r.ticketTypeId] ?? 0) + r.precoPagoCents;
  }
  return { totalCents, moeda, porTicketType };
}

/** Filtra eventos por tradição e/ou modalidade */
export function filtrarEventos(
  eventos: Evento[],
  filtros: { tradicao?: Tradicao; modalidade?: EventoModalidade; tipo?: EventoTipo; status?: EventoStatus; idioma?: string },
): Evento[] {
  return eventos.filter((e) => {
    if (filtros.tradicao && e.tradicao !== filtros.tradicao) return false;
    if (filtros.modalidade && e.modalidade !== filtros.modalidade) return false;
    if (filtros.tipo && e.tipo !== filtros.tipo) return false;
    if (filtros.status && e.status !== filtros.status) return false;
    if (filtros.idioma && e.idioma !== filtros.idioma) return false;
    return true;
  });
}

/** Ordena eventos por data de início */
export function ordenarEventosPorInicio(eventos: Evento[], direcao: 'asc' | 'desc' = 'asc'): Evento[] {
  const copia = [...eventos];
  copia.sort((a, b) => a.iniciaEm.localeCompare(b.iniciaEm));
  if (direcao === 'desc') copia.reverse();
  return copia;
}

/** Retorna próximos N eventos a partir de agora */
export function proximosEventos(eventos: Evento[], quantidade: number = 5, agora: string = new Date().toISOString()): Evento[] {
  return ordenarEventosPorInicio(
    eventos.filter((e) => e.iniciaEm >= agora && (e.status === 'publicado' || e.status === 'em-andamento')),
    'asc',
  ).slice(0, quantidade);
}
