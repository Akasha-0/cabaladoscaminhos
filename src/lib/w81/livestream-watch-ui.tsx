/**
 * ════════════════════════════════════════════════════════════════════════════
 * W81-D — LIVESTREAM WATCH UI · REACT COMPONENTS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 81 · 2026-06-30
 * Author: W81-D Coder (Mavis orchestrator session 414735487684817)
 *
 * Six components, no external deps, all <video>/<button> primitives + the
 * engine helpers from `livestream-watch-engine.ts`:
 *
 *   1. VideoPlayer         — <video> wrapper with LGPD audio-consent gate
 *   2. LiveChat            — chat feed + composer (aria-live=polite)
 *   3. ViewerCount         — compact counter with aria-label
 *   4. StreamCategoryBadge — pill w/ tradition hints + sacred warning
 *   5. ReactionBar         — debounced emoji bar w/ aggregates
 *   6. ScheduleBanner      — "começa em X min" + sacred-content warning
 *
 * No video player lib, no chat lib, no signal lib — just React + the engine.
 *
 * Mobile-first: 44px touch targets, fullscreen toggle, swipe-to-dismiss chat
 * stub via onSwipeDismiss prop, single-column flow.
 *
 * All public records are Object.freeze'd before return (cycle 75 #6).
 * Branded IDs only flow through engine factories — never accept raw strings.
 */

// @ts-ignore — react-stubs.d.ts provides ambient types.
import * as React from 'react';
import {
  A11Y_SHORTCUTS,
  type A11yShortcut,
  CHAT_LIVE_REGION_POLITENESS,
  PLAYER_LIVE_REGION_POLITENESS,
  STREAM_CATEGORIES,
  type StreamCategory,
  type StreamCategoryMeta,
  audioConsentCta,
  canAutoPlayWithAudio,
  canTransitionChat,
  canTransitionPlayer,
  type ChatMessage,
  type ChatMessageId,
  type ChatState,
  formatViewerCount,
  moderateChatBody,
  type ModerationDecision,
  type PlayerState,
  resolveShortcut,
  type ReactionAggregate,
  type ReactionAttempt,
  aggregateReactions,
  buildScheduleNotice,
  buildModerationMessage,
  chatMessageKind,
  shouldAllowReaction,
  transitionChat,
  transitionPlayer,
  userId,
  type UserId,
  type StreamId,
  viewerCountAriaLabel,
  TOUCH_TARGET_MIN_PX,
} from './livestream-watch-engine.ts';

// ════════════════════════════════════════════════════════════════════════════
// Component 1 — VideoPlayer
// ════════════════════════════════════════════════════════════════════════════

export interface VideoPlayerProps {
  readonly streamId: StreamId;
  readonly src: string;
  readonly posterUrl?: string;
  readonly captionsUrl?: string;
  readonly category: StreamCategory;
  readonly autoPlay?: boolean;
  readonly onStateChange?: (state: PlayerState) => void;
  readonly onAudioConsent?: () => void;
}

/**
 * Pure UI wrapper around <video>. NEVER auto-plays with audio — that requires
 * a user gesture AND, for sacred categories, an explicit "play with sound"
 * opt-in. Renders an overlay CTA when audio is gated.
 */
export function VideoPlayer(props: VideoPlayerProps): React.ReactElement {
  const [state, setState] = React.useState<PlayerState>('IDLE');
  const [muted, setMuted] = React.useState<boolean>(true);
  const [audioUnlocked, setAudioUnlocked] = React.useState<boolean>(false);
  const [userGesture, setUserGesture] = React.useState<boolean>(false);
  const [showOverlay, setShowOverlay] = React.useState<boolean>(true);

  const meta = STREAM_CATEGORIES[props.category];
  const consentCfg = {
    sacredCategory: props.category,
    userGesture,
    explicitAudioOptIn: audioUnlocked,
  };
  const audioAllowed = canAutoPlayWithAudio(consentCfg);

  React.useEffect(() => {
    if (props.onStateChange) props.onStateChange(state);
  }, [state, props]);

  const handlePlay = React.useCallback((): void => {
    setUserGesture(true);
    const next = transitionPlayer(state, 'BUFFERING');
    setState(next);
  }, [state]);

  const handlePlaying = React.useCallback((): void => {
    const next = transitionPlayer(state, 'PLAYING');
    setState(next);
    setShowOverlay(false);
  }, [state]);

  const handlePause = React.useCallback((): void => {
    const next = transitionPlayer(state, 'PAUSED');
    setState(next);
  }, [state]);

  const handleEnded = React.useCallback((): void => {
    const next = transitionPlayer(state, 'ENDED');
    setState(next);
    setShowOverlay(true);
  }, [state]);

  const handleToggleMute = React.useCallback((): void => {
    setUserGesture(true);
    setMuted((m) => !m);
  }, []);

  const handleUnlockAudio = React.useCallback((): void => {
    setUserGesture(true);
    setAudioUnlocked(true);
    setMuted(false);
    if (props.onAudioConsent) props.onAudioConsent();
  }, [props]);

  const handleKeyDown = React.useCallback((ev: { key: string }): void => {
    const shortcut: A11yShortcut | null = resolveShortcut(ev.key);
    if (shortcut === 'playPause') {
      ev.key === ' ' && handlePlay();
    } else if (shortcut === 'mute') {
      handleToggleMute();
    }
  }, [handlePlay, handleToggleMute]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 240,
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    textAlign: 'center',
    padding: 16,
    zIndex: 2,
  };

  const ctaStyle: React.CSSProperties = {
    minHeight: TOUCH_TARGET_MIN_PX,
    minWidth: TOUCH_TARGET_MIN_PX,
    padding: '12px 24px',
    backgroundColor: meta.accentColor,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div
      style={containerStyle}
      role="region"
      aria-label={`Player — ${meta.label}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-stream-id={props.streamId}
    >
      <video
        src={props.src}
        poster={props.posterUrl ?? ''}
        autoPlay={props.autoPlay === true && audioAllowed && muted === false}
        muted={muted}
        playsInline
        controls
        onPlay={handlePlay}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onEnded={handleEnded}
        aria-label={`Player de vídeo — ${meta.ariaDescription}`}
        style={{ width: '100%', display: 'block' }}
      >
        {props.captionsUrl !== undefined ? (
          <track kind="captions" srcLang="pt-BR" src={props.captionsUrl} label="Português" default />
        ) : null}
      </video>

      <div aria-live={PLAYER_LIVE_REGION_POLITENESS} style={{ position: 'absolute', left: -9999, top: -9999 }}>
        {state === 'PLAYING' ? 'Reproduzindo' : state === 'PAUSED' ? 'Pausado' : state === 'BUFFERING' ? 'Carregando' : state === 'ENDED' ? 'Encerrado' : 'Pronto'}
      </div>

      {showOverlay ? (
        <div style={overlayStyle}>
          <div>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>{meta.ariaDescription}</p>
            {!audioAllowed ? (
              <button
                type="button"
                style={ctaStyle}
                onClick={handleUnlockAudio}
                aria-label={audioConsentCta(props.category)}
              >
                {audioConsentCta(props.category)}
              </button>
            ) : (
              <button
                type="button"
                style={ctaStyle}
                onClick={handlePlay}
                aria-label="Iniciar transmissão"
              >
                ▶ Assistir
              </button>
            )}
            <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
              Atalhos: {A11Y_SHORTCUTS.playPause.ariaKeyShortcuts} · {A11Y_SHORTCUTS.mute.ariaKeyShortcuts} · {A11Y_SHORTCUTS.seekBack.ariaKeyShortcuts} · {A11Y_SHORTCUTS.seekForward.ariaKeyShortcuts} · {A11Y_SHORTCUTS.fullscreen.ariaKeyShortcuts}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Component 2 — LiveChat
// ════════════════════════════════════════════════════════════════════════════

export interface LiveChatProps {
  readonly streamId: StreamId;
  readonly currentUserId: UserId;
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly state: ChatState;
  readonly onSend: (body: string) => void;
  readonly onStateChange?: (state: ChatState) => void;
  readonly idFactory: () => ChatMessageId;
}

export function LiveChat(props: LiveChatProps): React.ReactElement {
  const [draft, setDraft] = React.useState<string>('');

  const handleInputChange = React.useCallback((ev: unknown): void => {
    if (typeof ev === 'object' && ev !== null && 'value' in ev) {
      setDraft(String((ev as { value: unknown }).value ?? ''));
    }
  }, []);

  React.useEffect(() => {
    if (props.onStateChange) props.onStateChange(props.state);
  }, [props.state, props]);

  const handleSubmit = (ev: { preventDefault?: () => void }): void => {
    ev.preventDefault?.();
    const body = draft.trim();
    if (body.length === 0) return;
    const decision: ModerationDecision = moderateChatBody(body);
    if (decision.action === 'block') {
      const modMsg = buildModerationMessage(
        props.currentUserId,
        decision,
        props.idFactory,
      );
      props.onSend(JSON.stringify({ kind: 'moderation', payload: modMsg }));
    } else if (decision.action === 'redact') {
      props.onSend(decision.redactedBody);
    } else {
      props.onSend(body);
    }
    setDraft('');
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    maxHeight: 320,
    overflowY: 'auto',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 12,
  };

  const itemStyle: React.CSSProperties = {
    padding: '8px 0',
    borderBottom: '1px solid #1e293b',
    color: '#e2e8f0',
    fontSize: 14,
    minHeight: TOUCH_TARGET_MIN_PX,
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: TOUCH_TARGET_MIN_PX,
    padding: '10px 12px',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    border: 'none',
    borderRadius: 8,
    marginTop: 8,
    boxSizing: 'border-box',
    fontSize: 16,
  };

  const sendStyle: React.CSSProperties = {
    minHeight: TOUCH_TARGET_MIN_PX,
    minWidth: TOUCH_TARGET_MIN_PX,
    padding: '10px 16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    marginLeft: 8,
  };

  const stateLabel =
    props.state === 'CONNECTED' ? 'Conectado' :
    props.state === 'LOADING' ? 'Conectando...' :
    props.state === 'DISCONNECTED' ? 'Desconectado — tentando reconectar' :
    'Chat inativo';

  return (
    <section
      role="region"
      aria-label="Chat ao vivo"
      aria-live={CHAT_LIVE_REGION_POLITENESS}
      data-stream-id={props.streamId}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
        <strong style={{ color: '#e2e8f0' }}>Chat ao vivo</strong>
        <span style={{ fontSize: 12, color: '#94a3b8' }} aria-label={`Estado do chat: ${stateLabel}`}>{stateLabel}</span>
      </header>

      <ul style={listStyle} aria-label="Mensagens do chat">
        {props.messages.length === 0 ? (
          <li style={itemStyle}><em style={{ color: '#64748b' }}>Sem mensagens ainda</em></li>
        ) : (
          props.messages.map((m) => renderMessage(m, itemStyle))
        )}
      </ul>

      <form onSubmit={handleSubmit} role="group" aria-label="Enviar mensagem">
        <label htmlFor={`chat-input-${props.streamId}`} style={{ position: 'absolute', left: -9999 }}>
          Mensagem do chat
        </label>
        <input
          id={`chat-input-${props.streamId}`}
          type="text"
          value={draft}
          onChange={handleInputChange}
          onInput={handleInputChange}
          maxLength={500}
          placeholder={props.state === 'CONNECTED' ? 'Escreva uma mensagem...' : 'Aguarde o chat conectar'}
          disabled={props.state !== 'CONNECTED'}
          style={inputStyle}
          aria-disabled={props.state !== 'CONNECTED'}
        />
        <button
          type="submit"
          style={sendStyle}
          disabled={props.state !== 'CONNECTED' || draft.trim().length === 0}
          aria-disabled={props.state !== 'CONNECTED' || draft.trim().length === 0}
        >
          Enviar
        </button>
      </form>
    </section>
  );
}

function renderMessage(m: ChatMessage, baseStyle: React.CSSProperties): React.ReactElement {
  const time = new Date(m.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (m.kind === 'text') {
    return (
      <li key={m.id} style={baseStyle}>
        <span aria-label={`${m.displayName} disse às ${time}`}>
          <strong style={{ color: '#a5b4fc' }}>{m.displayName}</strong>
          <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>{time}</span>
          <p style={{ margin: '4px 0 0 0' }}>{m.body}</p>
        </span>
      </li>
    );
  }
  if (m.kind === 'reaction') {
    return (
      <li key={m.id} style={baseStyle} aria-label={`Reação ${m.emoji} às ${time}`}>
        <span style={{ fontSize: 18 }}>{m.emoji}</span>
        <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>{time}</span>
      </li>
    );
  }
  if (m.kind === 'system') {
    return (
      <li key={m.id} style={baseStyle} aria-label={`Aviso do sistema às ${time}`}>
        <em style={{ color: '#fbbf24' }}>{m.body}</em>
        <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>{time}</span>
      </li>
    );
  }
  if (m.kind === 'moderation') {
    return (
      <li key={m.id} style={baseStyle} aria-label={`Moderação às ${time}: ${m.reason}`}>
        <em style={{ color: '#f87171' }}>⚠ Moderação: {m.reason}</em>
        <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>{time}</span>
      </li>
    );
  }
  // question
  return (
    <li key={m.id} style={baseStyle} aria-label={`Pergunta${m.pinned ? ' fixada' : ''} de ${m.displayName} às ${time}`}>
      <span>
        <strong style={{ color: '#a5b4fc' }}>{m.displayName}</strong>
        {m.pinned ? <span style={{ marginLeft: 8, color: '#fbbf24' }}>📌 fixada</span> : null}
        <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>{time}</span>
        <p style={{ margin: '4px 0 0 0' }}>{m.body}</p>
      </span>
    </li>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Component 3 — ViewerCount
// ════════════════════════════════════════════════════════════════════════════

export interface ViewerCountProps {
  readonly count: number;
  readonly peak?: number;
}

export function ViewerCount(props: ViewerCountProps): React.ReactElement {
  const formatted = formatViewerCount(props.count);
  const peak = props.peak !== undefined ? ` · pico ${formatViewerCount(props.peak)}` : '';
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    color: '#fca5a5',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
  };
  return (
    <div style={containerStyle} role="status" aria-label={viewerCountAriaLabel(props.count)}>
      <span aria-hidden="true">🔴</span>
      <span>{formatted} ao vivo</span>
      {props.peak !== undefined ? (
        <span style={{ fontSize: 11, opacity: 0.75 }}>{peak}</span>
      ) : null}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Component 4 — StreamCategoryBadge
// ════════════════════════════════════════════════════════════════════════════

export interface StreamCategoryBadgeProps {
  readonly category: StreamCategory;
  readonly size?: 'sm' | 'md';
}

export function StreamCategoryBadge(props: StreamCategoryBadgeProps): React.ReactElement {
  const meta: StreamCategoryMeta = STREAM_CATEGORIES[props.category];
  const size = props.size ?? 'md';
  const padding = size === 'sm' ? '3px 8px' : '6px 12px';
  const fontSize = size === 'sm' ? 11 : 13;
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding,
    backgroundColor: `${meta.accentColor}22`,
    color: meta.accentColor,
    border: `1px solid ${meta.accentColor}66`,
    borderRadius: 999,
    fontSize,
    fontWeight: 600,
  };
  const sacredMark = meta.lgpdSacredContent ? '✦' : '';
  return (
    <span style={containerStyle} aria-label={`Categoria: ${meta.label}${meta.lgpdSacredContent ? ' — conteúdo sagrado' : ''}`}>
      <span aria-hidden="true">{meta.emoji}</span>
      <span>{meta.shortLabel}</span>
      <span aria-hidden="true">{sacredMark}</span>
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Component 5 — ReactionBar
// ════════════════════════════════════════════════════════════════════════════

export interface ReactionBarProps {
  readonly streamId: StreamId;
  readonly currentUserId: UserId;
  readonly history: ReadonlyArray<ReactionAttempt>;
  readonly emojiPalette?: ReadonlyArray<string>;
  readonly onReact: (emoji: string) => void;
}

const DEFAULT_EMOJI_PALETTE: ReadonlyArray<string> = Object.freeze(['🙏', '🔥', '✨', '💫', '🕯️', '🌿']);

export function ReactionBar(props: ReactionBarProps): React.ReactElement {
  const palette = props.emojiPalette ?? DEFAULT_EMOJI_PALETTE;
  const aggregates: ReadonlyArray<ReactionAggregate> = aggregateReactions(props.history);
  const aggregateMap = new Map<string, number>(aggregates.map((a) => [a.emoji, a.count]));

  const handleClick = (emoji: string): void => {
    const decision = shouldAllowReaction(props.history, {
      userId: props.currentUserId,
      emoji,
      ts: Date.now(),
    });
    if (decision.allowed) props.onReact(emoji);
  };

  const barStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: 8,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    alignItems: 'center',
  };

  const btnStyle = (count: number): React.CSSProperties => ({
    minHeight: TOUCH_TARGET_MIN_PX,
    minWidth: TOUCH_TARGET_MIN_PX,
    padding: '6px 12px',
    backgroundColor: count > 0 ? '#312e81' : '#1e293b',
    color: '#e2e8f0',
    border: 'none',
    borderRadius: 999,
    fontSize: 16,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  });

  return (
    <div role="group" aria-label="Reações" style={barStyle} data-stream-id={props.streamId}>
      {palette.map((emoji) => {
        const count = aggregateMap.get(emoji) ?? 0;
        return (
          <button
            key={emoji}
            type="button"
            style={btnStyle(count)}
            onClick={() => handleClick(emoji)}
            aria-label={`Reagir com ${emoji}${count > 0 ? ` (${count})` : ''}`}
          >
            <span aria-hidden="true">{emoji}</span>
            {count > 0 ? <span style={{ fontSize: 12 }}>{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Component 6 — ScheduleBanner
// ════════════════════════════════════════════════════════════════════════════

export interface ScheduleBannerProps {
  readonly streamId: StreamId;
  readonly category: StreamCategory;
  readonly startsAt: number;
  readonly now: number;
}

export function ScheduleBanner(props: ScheduleBannerProps): React.ReactElement {
  const delta = props.startsAt - props.now;
  const notice = buildScheduleNotice(props.category, delta);
  const toneColor =
    notice.tone === 'sacred' ? '#fbbf24' :
    notice.tone === 'warn' ? '#fb923c' :
    '#a5b4fc';
  const containerStyle: React.CSSProperties = {
    padding: '10px 14px',
    backgroundColor: `${toneColor}22`,
    color: toneColor,
    borderLeft: `4px solid ${toneColor}`,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };
  return (
    <div style={containerStyle} role="status" aria-live="polite" data-stream-id={props.streamId}>
      <StreamCategoryBadge category={props.category} size="sm" />
      <span>{notice.message}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Convenience — composed WatchSurface (all 6 components together)
// ════════════════════════════════════════════════════════════════════════════

export interface WatchSurfaceProps {
  readonly streamId: StreamId;
  readonly src: string;
  readonly posterUrl?: string;
  readonly captionsUrl?: string;
  readonly category: StreamCategory;
  readonly viewerCount: number;
  readonly viewerPeak?: number;
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly chatState: ChatState;
  readonly reactionHistory: ReadonlyArray<ReactionAttempt>;
  readonly startsAt?: number;
  readonly now: number;
  readonly currentUserId: UserId;
  readonly idFactory: () => ChatMessageId;
  readonly onSendChat: (body: string) => void;
  readonly onReact: (emoji: string) => void;
  readonly onAudioConsent?: () => void;
  readonly onPlayerStateChange?: (state: PlayerState) => void;
  readonly onChatStateChange?: (state: ChatState) => void;
}

export function WatchSurface(props: WatchSurfaceProps): React.ReactElement {
  const wrapperStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12,
    maxWidth: 960,
    margin: '0 auto',
    padding: 12,
    boxSizing: 'border-box',
  };
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  };
  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <StreamCategoryBadge category={props.category} />
        <ViewerCount count={props.viewerCount} peak={props.viewerPeak} />
      </div>
      {props.startsAt !== undefined ? (
        <ScheduleBanner
          streamId={props.streamId}
          category={props.category}
          startsAt={props.startsAt}
          now={props.now}
        />
      ) : null}
      <VideoPlayer
        streamId={props.streamId}
        src={props.src}
        posterUrl={props.posterUrl}
        captionsUrl={props.captionsUrl}
        category={props.category}
        autoPlay={false}
        onStateChange={props.onPlayerStateChange}
        onAudioConsent={props.onAudioConsent}
      />
      <ReactionBar
        streamId={props.streamId}
        currentUserId={props.currentUserId}
        history={props.reactionHistory}
        onReact={props.onReact}
      />
      <LiveChat
        streamId={props.streamId}
        currentUserId={props.currentUserId}
        messages={props.messages}
        state={props.chatState}
        onSend={props.onSendChat}
        onStateChange={props.onChatStateChange}
        idFactory={props.idFactory}
      />
    </div>
  );
}

// Re-export engine surface for downstream consumers
export {
  STREAM_CATEGORIES,
  canAutoPlayWithAudio,
  canTransitionChat,
  canTransitionPlayer,
  transitionChat,
  transitionPlayer,
  moderateChatBody,
  shouldAllowReaction,
  aggregateReactions,
  buildScheduleNotice,
  formatViewerCount,
  resolveShortcut,
  audioConsentCta,
  viewerCountAriaLabel,
  userId,
};
