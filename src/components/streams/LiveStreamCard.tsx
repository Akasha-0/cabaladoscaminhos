'use client';

import * as React from 'react';

export interface LiveStreamCardProps {
  streamId: string;
  title: string;
  hostName: string;
  viewerCount: number;
  isLive: boolean;
}

// TODO(w24): integrate with HLS/DASH player + WebRTC signaling
export function LiveStreamCard({
  streamId,
  title,
  hostName,
  viewerCount,
  isLive,
}: LiveStreamCardProps) {
  const formattedViewers = new Intl.NumberFormat('pt-BR').format(viewerCount);

  return (
    <article
      aria-label={isLive ? `Transmissão ao vivo: ${title}` : `Transmissão: ${title}`}
      className="live-stream-card"
      data-stream-id={streamId}
    >
      <div className="live-stream-card__media" aria-hidden="true">
        {/* TODO(w24): replace placeholder with HLS/DASH <video> element */}
        <div className="live-stream-card__placeholder" />
        {isLive ? (
          <span className="live-stream-card__badge live-stream-card__badge--live" role="status">
            AO VIVO
          </span>
        ) : (
          <span className="live-stream-card__badge live-stream-card__badge--offline">
            OFFLINE
          </span>
        )}
      </div>

      <div className="live-stream-card__body">
        <h3 className="live-stream-card__title">{title}</h3>
        <p className="live-stream-card__host">
          <span className="sr-only">Apresentado por </span>
          {hostName}
        </p>
        <p className="live-stream-card__viewers" aria-live="polite">
          <span className="sr-only">{viewerCount} espectadores assistindo</span>
          <span aria-hidden="true">{formattedViewers} espectadores</span>
        </p>
      </div>
    </article>
  );
}

export default LiveStreamCard;
