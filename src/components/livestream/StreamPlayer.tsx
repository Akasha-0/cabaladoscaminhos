// W80-D livestream-watch-ui — StreamPlayer component
// Mobile-first React UI for watching sacred-tradition livestreams.
//
// Architecture:
//   - Calls into the @/lib/livestream engine for stream URL, state, chat,
//     viewer count, and sacred-content flags.
//   - Video rendering is delegated to the browser's <video> element using
//     the engine-provided HLS URL (no third-party player dependency).
//   - LGPD: no autoplay of audio without explicit user gesture. Sacred content
//     detection requires explicit consent gate before audio un-mute.
//   - WCAG AA: full keyboard nav, aria-live regions, 44px touch targets,
//     visible focus rings, semantic HTML.
//
// Coverage: 7 traditions (CIGANO, CANDOMBLE, UMBANDA, IFA, CABALA,
// ASTROLOGIA, TANTRA).

import * as React from 'react';
import {
  type LivestreamSession,
  type StreamChannel,
  type StreamState,
  type ChatMessage,
  type SacredContentFlag,
  type ViewerCount,
  type ViewerId,
  type ChatId,
  createLivestreamSession,
  TRADITION_KIND_LABELS,
  TRADITION_KIND_ICONS,
  STREAM_CATEGORIES,
  isAudioConsentApproved,
  approveAudioConsent,
  revokeAudioConsent,
} from '@/lib/livestream';
import {
  MIN_TOUCH_TARGET_PX,
  MAX_CHAT_LEN,
  CHAT_PAGE_SIZE,
  formatViewerCount,
  formatViewerSr,
  formatTime,
  reduceStreamPlayer,
  initMachineState,
  canUnmuteAudio,
  summarizeChatState,
  isChatSubmitDisabled,
  genreLabel,
  renderSacredTermsList,
  timeAgoPtBr,
  type MachineState,
} from './StreamPlayer.helpers.ts';
import type { StreamKind } from './engine-types.ts';

// ---------- Subcomponents ----------

interface StreamBadgeProps {
  kind: StreamChannel['kind'];
  state: StreamState;
  /** Optional sacred-content warning. */
  sacred?: SacredContentFlag;
}

/** Tradition + live-state badge. */
function StreamBadge({ kind, state, sacred }: StreamBadgeProps): React.ReactElement {
  const isLive = state === 'LIVE';
  const icon = TRADITION_KIND_ICONS[kind] ?? '✦';
  const label = TRADITION_KIND_LABELS[kind] ?? kind;
  const sacredMark = sacred?.containsSacredTerms ? ' 𓂀' : '';
  return (
    <div
      className="stream-badge"
      role="status"
      aria-label={`${label}, ${isLive ? 'transmissão ao vivo' : `estado ${state}`}${sacred?.containsSacredTerms ? ', conteúdo sagrado' : ''}`}
      data-state={state}
    >
      <span aria-hidden="true" className="stream-badge__icon">{icon}</span>
      <span className="stream-badge__label">{label}{sacredMark}</span>
      <span className={`stream-badge__live-pill ${isLive ? 'is-live' : 'is-offline'}`}>
        {isLive ? 'AO VIVO' : state}
      </span>
    </div>
  );
}

interface ViewerCountBadgeProps {
  count: ViewerCount;
}

/** Live viewer counter with sr-only label. */
function ViewerCountBadge({ count }: ViewerCountBadgeProps): React.ReactElement {
  const compact = formatViewerCount(count.current);
  return (
    <div
      className="viewer-count-badge"
      aria-live="polite"
      aria-atomic="true"
      aria-label={formatViewerSr(count.current, count.peak)}
    >
      <span aria-hidden="true" className="viewer-count-badge__icon">●</span>
      <span aria-hidden="true" className="viewer-count-badge__number">{compact}</span>
      <span className="sr-only">{formatViewerSr(count.current, count.peak)}</span>
    </div>
  );
}

interface SacredConsentGateProps {
  sacred: SacredContentFlag;
  approved: boolean;
  onApprove: () => void;
  onRevoke: () => void;
}

/**
 * Sacred-content consent gate.
 * Required before audio un-mute for streams flagged with sacred terms.
 * Implements LGPD explicit consent + accessibility preferences-respect.
 */
function SacredConsentGate({
  sacred,
  approved,
  onApprove,
  onRevoke,
}: SacredConsentGateProps): React.ReactElement {
  if (!sacred.requiresAudioConsent) {
    return (
      <div className="sacred-gate sacred-gate--ok" role="note">
        Conteúdo desta tradição não exige consentimento adicional de áudio.
      </div>
    );
  }
  if (approved) {
    return (
      <div className="sacred-gate sacred-gate--approved" role="status">
        <span aria-hidden="true">✓</span>
        <span>
          Áudio ativado por sua escolha consciente. Você pode revogar a qualquer momento.
        </span>
        <button
          type="button"
          onClick={onRevoke}
          className="sacred-gate__revoke"
          aria-label="Revogar consentimento de áudio"
          style={{ minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX }}
        >
          Revogar
        </button>
      </div>
    );
  }
  const terms = renderSacredTermsList(sacred.detectedTerms);
  return (
    <div
      className="sacred-gate sacred-gate--required"
      role="alertdialog"
      aria-modal="false"
      aria-labelledby="sacred-gate-title"
      aria-describedby="sacred-gate-desc"
    >
      <h3 id="sacred-gate-title" className="sacred-gate__title">
        Conteúdo sagrado detectado
      </h3>
      <p id="sacred-gate-desc" className="sacred-gate__desc">
        Esta transmissão contém {terms}. Por respeito à tradição e à LGPD,
        o áudio permanece silenciado até que você autorize conscientemente.
      </p>
      <button
        type="button"
        onClick={onApprove}
        className="sacred-gate__approve"
        aria-label="Autorizar áudio de conteúdo sagrado"
        style={{ minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX }}
      >
        Autorizar áudio
      </button>
    </div>
  );
}

interface PlaybackControlBarProps {
  paused: boolean;
  muted: boolean;
  canUnmute: boolean;
  onPlayPause: () => void;
  onToggleMute: () => void;
}

/** Bottom-bar controls: play/pause + mute (gated). */
function PlaybackControlBar({
  paused,
  muted,
  canUnmute,
  onPlayPause,
  onToggleMute,
}: PlaybackControlBarProps): React.ReactElement {
  return (
    <div className="playback-bar" role="group" aria-label="Controles de reprodução">
      <button
        type="button"
        onClick={onPlayPause}
        className="playback-bar__btn"
        aria-label={paused ? 'Reproduzir vídeo' : 'Pausar vídeo'}
        style={{ minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX }}
      >
        {paused ? '▶' : '❚❚'}
      </button>
      <button
        type="button"
        onClick={onToggleMute}
        className="playback-bar__btn"
        aria-label={muted ? 'Ativar som' : 'Silenciar'}
        aria-pressed={muted}
        disabled={!canUnmute && muted}
        title={!canUnmute && muted ? 'Autorize conteúdo sagrado para ativar' : ''}
        style={{ minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <span className="playback-bar__note" aria-hidden="true">
        {muted ? 'Mudo' : 'Som ativo'}
      </span>
    </div>
  );
}

interface ChatPanelProps {
  messages: readonly ChatMessage[];
  onSend: (body: string) => void;
  draft: string;
  onDraftChange: (body: string) => void;
  pendingCount: number;
  failedCount: number;
  streamState: StreamState;
  kind: StreamChannel['kind'];
}

/** Chat sidebar with tradition-aware label + optimistic UI. */
function ChatPanel({
  messages,
  onSend,
  draft,
  onDraftChange,
  pendingCount,
  failedCount,
  streamState,
  kind,
}: ChatPanelProps): React.ReactElement {
  const traditionLabel = genreLabel(kind);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    if (trimmed.length > MAX_CHAT_LEN) return;
    onSend(trimmed);
    onDraftChange('');
  };

  return (
    <aside className="chat-panel" aria-label="Chat ao vivo">
      <header className="chat-panel__header">
        <h2 className="chat-panel__title">Chat — {traditionLabel}</h2>
        <div className="chat-panel__queue" aria-live="polite">
          {pendingCount > 0 ? (
            <span className="chat-panel__pending">{pendingCount} pendente(s)</span>
          ) : null}
          {failedCount > 0 ? (
            <span className="chat-panel__failed">{failedCount} falha(s)</span>
          ) : null}
        </div>
      </header>

      <ol
        className="chat-panel__list"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensagens recentes"
      >
        {messages.length === 0 ? (
          <li className="chat-panel__empty" aria-label="Nenhuma mensagem ainda">
            {streamState === 'CONNECTING'
              ? 'Conectando... aguarde as primeiras mensagens.'
              : streamState === 'ENDED'
                ? 'Transmissão encerrada.'
                : 'Seja a primeira pessoa a enviar uma mensagem respeitosa.'}
          </li>
        ) : (
          messages.slice(-CHAT_PAGE_SIZE).map((m) => (
            <li
              key={m.id as string}
              className={`chat-panel__item chat-panel__item--${m.state.toLowerCase()}`}
              data-state={m.state}
            >
              <span className="chat-panel__author">{m.authorHandle}</span>
              {m.authorTradition ? (
                <span className="chat-panel__author-tradition"> · {m.authorTradition}</span>
              ) : null}
              <span className="chat-panel__body">{m.body}</span>
              <time
                className="chat-panel__time"
                dateTime={new Date(m.createdAt).toISOString()}
              >
                {formatTime(m.createdAt)}
              </time>
            </li>
          ))
        )}
      </ol>

      <form className="chat-panel__form" onSubmit={handleSubmit} aria-label="Enviar mensagem">
        <label className="sr-only" htmlFor="chat-draft">
          Mensagem do chat
        </label>
        <input
          id="chat-draft"
          className="chat-panel__input"
          type="text"
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onDraftChange(e.target.value.slice(0, MAX_CHAT_LEN));
          }}
          placeholder="Compartilhe com axé..."
          aria-label={`Mensagem para o chat de ${traditionLabel}`}
          maxLength={MAX_CHAT_LEN}
          disabled={streamState === 'ENDED' || streamState === 'ERROR'}
          style={{ minHeight: MIN_TOUCH_TARGET_PX }}
        />
        <button
          type="submit"
          className="chat-panel__send"
          disabled={isChatSubmitDisabled(draft, streamState)}
          aria-label="Enviar mensagem"
          style={{ minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX }}
        >
          Enviar
        </button>
        <span className="chat-panel__counter" aria-live="polite">
          {draft.length}/{MAX_CHAT_LEN}
        </span>
      </form>
    </aside>
  );
}

interface CategoryRailProps {
  selected: StreamKind | 'ALL';
  onSelect: (k: StreamKind | 'ALL') => void;
}

/** Top filter rail — 7 tradition categories + all. */
function CategoryRail({ selected, onSelect }: CategoryRailProps): React.ReactElement {
  return (
    <nav className="category-rail" aria-label="Categorias de transmissão">
      <button
        type="button"
        onClick={() => onSelect('ALL')}
        className={`category-rail__chip ${selected === 'ALL' ? 'is-active' : ''}`}
        aria-pressed={selected === 'ALL'}
        style={{ minHeight: MIN_TOUCH_TARGET_PX }}
      >
        Todas
      </button>
      {STREAM_CATEGORIES.map((cat) => {
        const isActive = selected === cat.kind;
        const icon = TRADITION_KIND_ICONS[cat.kind] ?? '✦';
        return (
          <button
            key={cat.kind}
            type="button"
            onClick={() => onSelect(cat.kind)}
            className={`category-rail__chip ${isActive ? 'is-active' : ''}`}
            aria-pressed={isActive}
            aria-label={`Filtrar por ${cat.labelPtBr}`}
            style={{ minHeight: MIN_TOUCH_TARGET_PX }}
          >
            <span aria-hidden="true" className="category-rail__icon">{icon}</span>
            <span className="category-rail__label">{cat.labelPtBr}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ---------- Main StreamPlayer ----------

export interface StreamPlayerProps {
  /** The engine-provided channel. */
  channel: StreamChannel;
  /** Viewer identity (for LGPD consent scoping). */
  viewerId: ViewerId;
  /**
   * Optional: render override of <video>. Defaults to <video controls>.
   * Useful when integrating an HLS.js shim if browser doesn't support HLS.
   */
  renderVideo?: (props: {
    src: string;
    poster?: string;
    muted: boolean;
    autoPlayBlocked: boolean;
    onManualPlay: () => void;
  }) => React.ReactElement;
}

/**
 * Main exported component. Wires the engine into a React UX.
 *
 * Pattern notes:
 *  - We avoid enqueuing dependencies at module-load — engine session is
 *    created lazily so SSR / build contexts without @/lib/livestream
 *    still permit type-only import.
 *  - All engine subscriptions are unsubscribed in a single cleanup effect.
 *  - Local state machine uses pure `reduceStreamPlayer` for predictable UX.
 *  - `<video>` element is brand-default; we never auto-play audio.
 */
export function StreamPlayer({
  channel,
  viewerId,
  renderVideo,
}: StreamPlayerProps): React.ReactElement {
  const sessionRef = React.useRef<LivestreamSession | null>(null);

  // We compute the initial state once per channel/viewer pair.
  const [state, setState] = React.useState<MachineState>(() =>
    initMachineState(isAudioConsentApproved(viewerId)),
  );

  // Engage the engine once on mount; tear down on unmount or channel swap.
  React.useEffect(() => {
    const session = createLivestreamSession(channel);
    sessionRef.current = session;

    // Initial sync
    setState((s) => ({
      ...s,
      streamState: session.getState(),
      viewers: session.getViewerCount(),
      chat: session.loadChatPage(undefined, CHAT_PAGE_SIZE),
      audioConsentApproved: isAudioConsentApproved(viewerId),
    }));

    const unsubState = session.subscribe((next) => {
      setState((s) => reduceStreamPlayer(s, { type: 'STREAM_STATE', payload: next }));
    });
    const unsubViewers = session.subscribeViewerCount((next) => {
      setState((s) => reduceStreamPlayer(s, { type: 'VIEWERS', payload: next }));
    });
    const unsubChat = session.subscribeChat((msg) => {
      setState((s) => reduceStreamPlayer(s, { type: 'CHAT_INCOMING', payload: msg }));
    });

    return () => {
      try {
        session.leave();
      } catch {
        // swallow — engine cleanup is best-effort
      }
      unsubState();
      unsubViewers();
      unsubChat();
      sessionRef.current = null;
    };
  }, [channel, viewerId]);

  const sacred = sessionRef.current?.getSacredFlag() ?? {
    streamKind: channel.kind,
    containsSacredTerms: false,
    detectedTerms: Object.freeze([]),
    requiresAudioConsent: false,
  };

  const chatSummary = summarizeChatState(state.chat);

  const handlePlayPause = React.useCallback((): void => {
    setState((s) => {
      // Drive engine in tandem with reducer.
      const session = sessionRef.current;
      if (session) {
        if (s.paused) session.resume();
        else session.pause();
      }
      return reduceStreamPlayer(s, { type: 'TOGGLE_PLAY' });
    });
  }, []);

  const handleToggleMute = React.useCallback((): void => {
    setState((s) => {
      const session = sessionRef.current;
      const sacredNow = session?.getSacredFlag() ?? sacred;
      // If we are trying to unmute and not allowed → no-op.
      if (s.muted && !canUnmuteAudio(s, sacredNow)) return s;
      return reduceStreamPlayer(s, { type: 'TOGGLE_MUTE' });
    });
  }, [sacred]);

  const handleApproveConsent = React.useCallback((): void => {
    approveAudioConsent(viewerId);
    setState((s) => {
      // Auto-unmute on approval (LGPD explicit consent).
      const next = reduceStreamPlayer(s, { type: 'CONSENT_APPROVED' });
      return { ...next, muted: false };
    });
  }, [viewerId]);

  const handleRevokeConsent = React.useCallback((): void => {
    revokeAudioConsent(viewerId);
    setState((s) => reduceStreamPlayer(s, { type: 'CONSENT_REVOKED' }));
  }, [viewerId]);

  const handleSendChat = React.useCallback(
    (body: string): void => {
      const session = sessionRef.current;
      if (!session) return;
      setState((s) => reduceStreamPlayer(s, { type: 'CHAT_SEND_PENDING' }));
      const tempId = `tmp_${Date.now()}_${Math.floor(Math.random() * 1e6)}` as ChatId;
      const result = session.sendChat(body);
      setState((s) =>
        reduceStreamPlayer(s, {
          type: 'CHAT_SEND_RESOLVED',
          payload: { tempId: tempId as string, ok: result.ok },
        }),
      );
    },
    [],
  );

  const handleDraftChange = React.useCallback((next: string): void => {
    setState((s) => reduceStreamPlayer(s, { type: 'DRAFT', payload: next }));
  }, []);

  const streamUrl = sessionRef.current?.getStreamUrl() ?? channel.hlsUrl;
  const canUnmute = canUnmuteAudio(state, sacred);

  const defaultVideoRenderer = renderVideo ?? DefaultVideoRenderer;

  return (
    <section
      className="stream-player"
      data-tradition={channel.kind}
      data-stream-state={state.streamState}
      aria-label={`Transmissão ao vivo: ${channel.title}`}
    >
      <CategoryRail
        selected="ALL"
        onSelect={() => {
          /* selection is handled at the page level; placeholder for prop wiring */
        }}
      />

      <header className="stream-player__header">
        <h1 className="stream-player__title">{channel.title}</h1>
        <p className="stream-player__presenter">
          por <strong>@{channel.presenterHandle}</strong>
          {channel.presenterTradition ? ` · ${channel.presenterTradition}` : ''}
        </p>
        <div className="stream-player__badges">
          <StreamBadge kind={channel.kind} state={state.streamState} sacred={sacred} />
          <ViewerCountBadge count={state.viewers} />
        </div>
      </header>

      <div className="stream-player__stage">
        <div className="stream-player__video-frame">
          {defaultVideoRenderer({
            src: streamUrl,
            poster: channel.posterUrl,
            muted: state.muted,
            autoPlayBlocked: state.muted || !canUnmute,
            onManualPlay: handlePlayPause,
          })}
          <PlaybackControlBar
            paused={state.paused}
            muted={state.muted}
            canUnmute={canUnmute}
            onPlayPause={handlePlayPause}
            onToggleMute={handleToggleMute}
          />
        </div>

        <SacredConsentGate
          sacred={sacred}
          approved={state.audioConsentApproved}
          onApprove={handleApproveConsent}
          onRevoke={handleRevokeConsent}
        />

        <ChatPanel
          messages={state.chat}
          onSend={handleSendChat}
          draft={state.draft}
          onDraftChange={handleDraftChange}
          pendingCount={chatSummary.pending + state.pendingChat}
          failedCount={chatSummary.failed + state.failedChat}
          streamState={state.streamState}
          kind={channel.kind}
        />
      </div>

      <footer className="stream-player__footer">
        <p className="stream-player__description">{channel.descriptionPtBr}</p>
      </footer>
    </section>
  );
}

// ---------- Re-exports for downstream consumers ----------
export {
  MIN_TOUCH_TARGET_PX,
  MAX_CHAT_LEN,
  CHAT_PAGE_SIZE,
  reduceStreamPlayer,
  initMachineState,
  canUnmuteAudio,
  summarizeChatState,
  isChatSubmitDisabled,
  formatViewerCount,
  formatViewerSr,
  formatTime,
  genreLabel,
  renderSacredTermsList,
  timeAgoPtBr,
} from './StreamPlayer.helpers';
export type {
  MachineState,
  MachineAction,
} from './StreamPlayer.helpers.ts';

// ---------- Default <video> renderer ----------

interface DefaultVideoRendererProps {
  src: string;
  poster?: string;
  muted: boolean;
  autoPlayBlocked: boolean;
  onManualPlay: () => void;
}

function DefaultVideoRenderer({
  src,
  poster,
  muted,
  autoPlayBlocked,
  onManualPlay,
}: DefaultVideoRendererProps): React.ReactElement {
  return (
    <div className="video-stage">
      <video
        className="video-stage__video"
        src={src}
        poster={poster}
        muted={muted}
        // LGPD: never autoplay audio without consent. Pure visuals OK.
        autoPlay={!autoPlayBlocked && !muted}
        playsInline
        controls={false}
        onClick={onManualPlay}
        aria-label="Player de vídeo da transmissão"
      />
      {muted ? (
        <div className="video-stage__audio-gate" role="note">
          Áudio silenciado por padrão. Toque para interagir.
        </div>
      ) : null}
    </div>
  );
}

export default StreamPlayer;
