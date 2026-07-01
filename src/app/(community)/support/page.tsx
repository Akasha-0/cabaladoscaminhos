'use client';

// ============================================================================
// /support — Helpdesk UI (Wave 37)
// ============================================================================
// Painel do cliente. Lista tickets do próprio user (anônimo via email),
// permite criar novo ticket, ver thread de mensagens e enviar respostas.
//
// Acessibilidade: focus management, aria-live para feedback, keyboard
// shortcuts (Cmd/Ctrl+Enter para enviar).
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type TicketStatus = 'NEW' | 'OPEN' | 'PENDING_CUSTOMER' | 'PENDING_AGENT' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TicketCategory = 'BILLING' | 'TECHNICAL' | 'CONTENT' | 'COMMUNITY' | 'ACCOUNT' | 'OTHER';

interface TicketListItem {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  subject: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  team: string | null;
  messageCount: number;
  satisfactionRating: number | null;
}

interface TicketDetail extends TicketListItem {
  description: string;
  email: string | null;
  userId: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  satisfactionComment: string | null;
  tags: string[];
  messages: Array<{
    id: string;
    body: string;
    isInternal: boolean;
    authorType: 'customer' | 'agent' | 'system';
    authorId: string | null;
    attachments: string[];
    createdAt: string;
  }>;
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: 'Novo',
  OPEN: 'Em atendimento',
  PENDING_CUSTOMER: 'Aguardando você',
  PENDING_AGENT: 'Aguardando agente',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

const PRIORITY_BADGES: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  BILLING: 'Cobrança',
  TECHNICAL: 'Técnico',
  CONTENT: 'Conteúdo',
  COMMUNITY: 'Comunidade',
  ACCOUNT: 'Conta',
  OTHER: 'Outro',
};

export default function SupportPage() {
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ status?: TicketStatus; category?: TicketCategory }>({});

  // Read userId/email from query (set by auth layer)
  const userId = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('userId') : null;
  const email = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('email') : null;

  // Load list
  useEffect(() => {
    if (view !== 'list') return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (email) params.set('email', email);
    fetch(`/api/support/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets ?? []))
      .catch(() => setError('Erro ao carregar tickets.'))
      .finally(() => setLoading(false));
  }, [view, userId, email]);

  // Load detail
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (userId) params.set('requesterId', userId);
    if (email) params.set('email', email);
    fetch(`/api/support/tickets/${selectedId}?${params}`)
      .then((r) => r.json())
      .then((data) => setDetail(data.ticket ?? null))
      .catch(() => setError('Erro ao carregar ticket.'))
      .finally(() => setLoading(false));
  }, [selectedId, userId, email]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.category && t.category !== filter.category) return false;
      return true;
    });
  }, [tickets, filter]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-labelledby="support-h1">
      <header className="mb-6">
        <h1 id="support-h1" className="text-3xl font-bold text-slate-900">
          Central de Suporte
        </h1>
        <p className="mt-2 text-slate-600">
          Abra um ticket, acompanhe suas solicitações e converse com nosso time.
        </p>
      </header>

      <nav className="mb-4 flex gap-2 border-b border-slate-200" aria-label="Ações">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 text-sm font-medium ${
            view === 'list' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Meus tickets ({tickets.length})
        </button>
        <button
          onClick={() => setView('new')}
          className={`px-4 py-2 text-sm font-medium ${
            view === 'new' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          + Novo ticket
        </button>
      </nav>

      <div aria-live="polite" className="sr-only">
        {error}
      </div>

      {view === 'list' && (
        <TicketList
          tickets={filteredTickets}
          loading={loading}
          filter={filter}
          onFilterChange={setFilter}
          onSelect={(id) => {
            setSelectedId(id);
            setView('detail');
          }}
        />
      )}
      {view === 'new' && <NewTicketForm onCreated={(id) => { setSelectedId(id); setView('detail'); }} userId={userId} email={email} />}
      {view === 'detail' && detail && (
        <TicketDetailView
          ticket={detail}
          onReply={async (body) => {
            const res = await fetch(`/api/support/tickets/${detail.id}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ body, authorType: 'customer', authorId: userId }),
            });
            if (res.ok) {
              // re-fetch
              const params = new URLSearchParams();
              if (userId) params.set('requesterId', userId);
              if (email) params.set('email', email);
              const refresh = await fetch(`/api/support/tickets/${detail.id}?${params}`).then((r) => r.json());
              setDetail(refresh.ticket);
            }
          }}
          onBack={() => setView('list')}
        />
      )}
      {view === 'detail' && !detail && <p className="text-slate-500">Carregando ticket…</p>}

      <p className="mt-8 text-sm text-slate-500">
        Prefere falar agora? Use o <Link href="/support#chat" className="text-purple-600 hover:underline">chat ao vivo</Link> no
        canto inferior direito.
      </p>
    </main>
  );
}

// ============================================================================
// TicketList
// ============================================================================
function TicketList({
  tickets,
  loading,
  filter,
  onFilterChange,
  onSelect,
}: {
  tickets: TicketListItem[];
  loading: boolean;
  filter: { status?: TicketStatus; category?: TicketCategory };
  onFilterChange: (f: { status?: TicketStatus; category?: TicketCategory }) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          aria-label="Filtrar por status"
          value={filter.status ?? ''}
          onChange={(e) => onFilterChange({ ...filter, status: (e.target.value || undefined) as TicketStatus | undefined })}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar por categoria"
          value={filter.category ?? ''}
          onChange={(e) => onFilterChange({ ...filter, category: (e.target.value || undefined) as TicketCategory | undefined })}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-600">Você ainda não abriu nenhum ticket.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {tickets.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => onSelect(t.id)}
                className="flex w-full items-start justify-between p-4 text-left hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">#{t.id.slice(-6).toUpperCase()}</span>
                    <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_BADGES[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {CATEGORY_LABELS[t.category]}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-slate-900">{t.subject}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t.messageCount} {t.messageCount === 1 ? 'mensagem' : 'mensagens'} ·{' '}
                    {STATUS_LABELS[t.status]} · {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {t.satisfactionRating && (
                  <span className="text-amber-500" aria-label={`Avaliação ${t.satisfactionRating} de 5`}>
                    {'★'.repeat(t.satisfactionRating)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// NewTicketForm
// ============================================================================
function NewTicketForm({
  onCreated,
  userId,
  email: prefilledEmail,
}: {
  onCreated: (id: string) => void;
  userId: string | null;
  email: string | null;
}) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('OTHER');
  const [email, setEmail] = useState(prefilledEmail ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (subject.trim().length < 5) return setError('Assunto muito curto.');
    if (description.trim().length < 20) return setError('Descreva com pelo menos 20 caracteres.');
    if (!userId && !email) return setError('Informe seu email para receber atualizações.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description, category, email: email || undefined, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Erro ao criar ticket.');
        return;
      }
      onCreated(data.ticket.id);
    } catch {
      setError('Erro de rede.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label htmlFor="t-subject" className="block text-sm font-medium text-slate-900">
          Assunto
        </label>
        <input
          id="t-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          required
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Resumo em uma linha"
        />
      </div>
      <div>
        <label htmlFor="t-category" className="block text-sm font-medium text-slate-900">
          Categoria
        </label>
        <select
          id="t-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      {!userId && (
        <div>
          <label htmlFor="t-email" className="block text-sm font-medium text-slate-900">
            Seu email
          </label>
          <input
            id="t-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="seu@email.com"
          />
        </div>
      )}
      <div>
        <label htmlFor="t-desc" className="block text-sm font-medium text-slate-900">
          Descreva o problema
        </label>
        <textarea
          id="t-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          maxLength={8000}
          required
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Quanto mais detalhes, mais rápido conseguimos ajudar."
        />
        <p className="mt-1 text-xs text-slate-500">{description.length}/8000 caracteres</p>
      </div>
      {error && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {submitting ? 'Enviando…' : 'Abrir ticket'}
      </button>
    </form>
  );
}

// ============================================================================
// TicketDetailView
// ============================================================================
function TicketDetailView({
  ticket,
  onReply,
  onBack,
}: {
  ticket: TicketDetail;
  onReply: (body: string) => Promise<void>;
  onBack: () => void;
}) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (reply.trim().length < 1) return;
    setSending(true);
    await onReply(reply.trim());
    setReply('');
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-purple-600 hover:underline">
        ← Voltar para meus tickets
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">#{ticket.id.slice(-6).toUpperCase()}</h2>
          <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_BADGES[ticket.priority]}`}>{ticket.priority}</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {CATEGORY_LABELS[ticket.category]}
          </span>
          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
            {STATUS_LABELS[ticket.status]}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{ticket.subject}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Aberto em {new Date(ticket.createdAt).toLocaleString('pt-BR')}
          {ticket.team && <> · Equipe: {ticket.team}</>}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded p-3 ${
              m.authorType === 'agent'
                ? 'bg-purple-50 border border-purple-100'
                : m.authorType === 'system'
                  ? 'bg-slate-50 text-slate-600 italic'
                  : 'bg-white border border-slate-200'
            }`}
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                {m.authorType === 'agent' ? '🛡️ Agente' : m.authorType === 'system' ? '⚙️ Sistema' : '👤 Você'}
              </span>
              <span className="text-slate-500">{new Date(m.createdAt).toLocaleString('pt-BR')}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-800">{m.body}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'CLOSED' && (
        <form onSubmit={handleReply} className="rounded-lg border border-slate-200 bg-white p-6">
          <label htmlFor="reply" className="block text-sm font-medium text-slate-900">
            Responder
          </label>
          <textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleReply(e as unknown as React.FormEvent);
            }}
            rows={4}
            maxLength={8000}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="Escreva sua resposta… (Cmd/Ctrl+Enter para enviar)"
          />
          <button
            type="submit"
            disabled={sending || reply.trim().length === 0}
            className="mt-2 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {sending ? 'Enviando…' : 'Enviar resposta'}
          </button>
        </form>
      )}

      {ticket.status === 'CLOSED' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Este ticket foi fechado. Se precisar de mais ajuda, abra um novo ticket.
        </div>
      )}
    </div>
  );
}