// ============================================================================
// UsersTable — Client Component (Wave 20)
// ============================================================================
// Filtros, sort, paginação, busca + ações rápidas (ban, promote mentor).
// Usa router.push para navegação; useTransition para loading state.
// ============================================================================

'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Ban, Sparkles } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  nomeCompleto: string;
  createdAt: string;
  isMentor: boolean;
  mentorTraditions: string[];
  planoAssinatura: string | null;
  postsCount: number;
  likesReceived: number;
  isBanned: boolean;
}

interface AdminUserList {
  data: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

interface UsersTableProps {
  initial: AdminUserList;
  initialFilters: {
    q: string;
    mentor: string;
    tradition: string;
    sort: 'recent' | 'name' | 'engagement';
  };
  traditions: string[];
}

export function UsersTable({ initial, initialFilters, traditions }: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Mirror searchParams locally so form is reactive
  const [q, setQ] = useState(initialFilters.q);
  const [mentor, setMentor] = useState(initialFilters.mentor);
  const [tradition, setTradition] = useState(initialFilters.tradition);
  const [sort, setSort] = useState(initialFilters.sort);

  // Modal state
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUser | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function pushUrl(next: Record<string, string | undefined>, resetPage = true) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v && v.length > 0) sp.set(k, v);
      else sp.delete(k);
    });
    if (resetPage) sp.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${sp.toString()}`);
    });
  }

  function goPage(p: number) {
    pushUrl({ page: String(Math.max(1, p)) }, false);
  }

  async function submitBan(reason: string) {
    if (!banTarget) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${banTarget.id}/ban`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      setBanTarget(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao banir');
    } finally {
      setActionBusy(false);
    }
  }

  async function submitPromote(traditions: string[], bio?: string) {
    if (!promoteTarget) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${promoteTarget.id}/promote-mentor`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ traditions, bio }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      setPromoteTarget(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao promover');
    } finally {
      setActionBusy(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(initial.total / initial.pageSize));
  const { page, pageSize } = initial;

  return (
    <div className="space-y-3">
      {/* ============================== */}
      {/* Filtros                        */}
      {/* ============================== */}
      <form
        className="grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:grid-cols-2 md:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          pushUrl({ q, mentor, tradition, sort });
        }}
      >
        <label className="relative md:col-span-2">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar por nome ou email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            aria-label="Buscar usuários"
          />
        </label>

        <select
          value={mentor}
          onChange={(e) => setMentor(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          aria-label="Filtrar por mentor"
        >
          <option value="">Todos (mentor?)</option>
          <option value="true">Só mentores</option>
          <option value="false">Não-mentores</option>
        </select>

        <select
          value={tradition}
          onChange={(e) => setTradition(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          aria-label="Filtrar por tradição"
        >
          <option value="">Qualquer tradição</option>
          {traditions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            aria-label="Ordenar por"
          >
            <option value="recent">Mais recentes</option>
            <option value="name">Nome A-Z</option>
            <option value="engagement">Engajamento</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? '…' : 'Filtrar'}
          </button>
        </div>
      </form>

      {actionError && (
        <div className="rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {actionError}
        </div>
      )}

      {/* ============================== */}
      {/* Tabela (mobile: cards)         */}
      {/* ============================== */}
      <div className="overflow-hidden rounded-lg border border-slate-800">
        {/* Mobile cards */}
        <ul className="divide-y divide-slate-800 md:hidden">
          {initial.data.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">
              Nenhum usuário encontrado.
            </li>
          )}
          {initial.data.map((u) => (
            <li key={u.id} className="space-y-1 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-100">
                    {u.nomeCompleto}
                  </div>
                  <div className="truncate text-xs text-slate-500">{u.email}</div>
                </div>
                <UserBadges user={u} />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{u.postsCount} posts</span>
                <span>·</span>
                <span>{u.likesReceived} likes</span>
                <span>·</span>
                <span>
                  {new Date(u.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <UserActions user={u} onBan={() => setBanTarget(u)} onPromote={() => setPromoteTarget(u)} />
            </li>
          ))}
        </ul>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-center">Mentor</th>
                <th className="px-3 py-2 text-right">Posts</th>
                <th className="px-3 py-2 text-right">Likes</th>
                <th className="px-3 py-2 text-left">Cadastro</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {initial.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {initial.data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-100">{u.nomeCompleto}</div>
                    <div className="text-[11px] text-slate-500">{u.id.slice(0, 12)}…</div>
                  </td>
                  <td className="px-3 py-2 text-slate-300">{u.email}</td>
                  <td className="px-3 py-2 text-center">
                    <UserBadges user={u} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{u.postsCount}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{u.likesReceived}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-3 py-2">
                    <UserActions
                      user={u}
                      onBan={() => setBanTarget(u)}
                      onPromote={() => setPromoteTarget(u)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================== */}
      {/* Paginação                      */}
      {/* ============================== */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-xs text-slate-500">
          Página {page} de {totalPages} · {pageSize} por página
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goPage(page - 1)}
            disabled={page <= 1 || pending}
            className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition-colors hover:bg-slate-900 disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 text-xs tabular-nums text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goPage(page + 1)}
            disabled={page >= totalPages || pending}
            className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition-colors hover:bg-slate-900 disabled:opacity-40"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ============================== */}
      {/* Modais                         */}
      {/* ============================== */}
      {banTarget && (
        <BanModal
          user={banTarget}
          busy={actionBusy}
          onCancel={() => setBanTarget(null)}
          onConfirm={submitBan}
        />
      )}
      {promoteTarget && (
        <PromoteModal
          user={promoteTarget}
          traditions={traditions}
          busy={actionBusy}
          onCancel={() => setPromoteTarget(null)}
          onConfirm={submitPromote}
        />
      )}
    </div>
  );
}

// ============================================================================
// Sub-componentes
// ============================================================================

function UserBadges({ user }: { user: AdminUser }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {user.isBanned && (
        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
          BANIDO
        </span>
      )}
      {user.isMentor && (
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          MENTOR
        </span>
      )}
      {user.planoAssinatura === 'ADMIN' && (
        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
          ADMIN
        </span>
      )}
    </div>
  );
}

function UserActions({
  user,
  onBan,
  onPromote,
}: {
  user: AdminUser;
  onBan: () => void;
  onPromote: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/comunidade/perfil/${user.id}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-900"
      >
        Ver
      </Link>
      {!user.isMentor && (
        <button
          type="button"
          onClick={onPromote}
          className="inline-flex items-center gap-1 rounded-md border border-amber-700 px-2 py-1 text-xs text-amber-300 transition-colors hover:bg-amber-950/40"
        >
          <Sparkles size={12} />
          Mentor
        </button>
      )}
      {!user.isBanned && user.planoAssinatura !== 'ADMIN' && (
        <button
          type="button"
          onClick={onBan}
          className="inline-flex items-center gap-1 rounded-md border border-rose-700 px-2 py-1 text-xs text-rose-300 transition-colors hover:bg-rose-950/40"
        >
          <Ban size={12} />
          Banir
        </button>
      )}
    </div>
  );
}

function BanModal({
  user,
  busy,
  onCancel,
  onConfirm,
}: {
  user: AdminUser;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <ModalShell onClose={onCancel} title={`Banir ${user.nomeCompleto}?`}>
      <p className="mb-3 text-sm text-slate-300">
        Esta ação é registrada no AuditLog. O usuário não aparecerá em
        buscas e será removido de feeds públicos.
      </p>
      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">
          Motivo (mín. 3 caracteres)
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none"
          placeholder="Ex: Spam persistente em múltiplos posts"
        />
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => reason.trim().length >= 3 && onConfirm(reason.trim())}
          disabled={busy || reason.trim().length < 3}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy ? 'Banning…' : 'Confirmar ban'}
        </button>
      </div>
    </ModalShell>
  );
}

function PromoteModal({
  user,
  traditions,
  busy,
  onCancel,
  onConfirm,
}: {
  user: AdminUser;
  traditions: string[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: (traditions: string[], bio?: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>(user.mentorTraditions);
  const [bio, setBio] = useState(user.mentorTraditions.length > 0 ? '' : '');

  function toggle(t: string) {
    setSelected((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].slice(0, 10)
    );
  }

  return (
    <ModalShell onClose={onCancel} title={`Promover ${user.nomeCompleto} a mentor`}>
      <p className="mb-3 text-sm text-slate-300">
        Selecione as tradições que este mentor pratica. A bio é opcional.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {traditions.map((t) => {
          const isOn = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                isOn
                  ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">Bio (opcional)</span>
        <input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          placeholder="Breve descrição da experiência…"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        />
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(selected, bio || undefined)}
          disabled={busy || selected.length === 0}
          className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy ? 'Promovendo…' : 'Promover'}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-bold text-slate-100">{title}</h2>
        {children}
      </div>
    </div>
  );
}
