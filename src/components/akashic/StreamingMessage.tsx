'use client';

import { useEffect, useState } from 'react';

export interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * StreamingMessage — displays AI response with live cursor while streaming.
 * Used by Akashic chat (Cabala dos Caminhos) to show SSE-chunked text.
 */
export function StreamingMessage({
  content,
  isStreaming,
  onComplete,
  className = '',
}: StreamingMessageProps) {
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (!isStreaming) {
      setShowCursor(false);
      onComplete?.();
      return;
    }
    setShowCursor(true);
    const interval = setInterval(() => setShowCursor((c) => c), 500);
    return () => clearInterval(interval);
  }, [isStreaming, onComplete]);

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      role="status"
      aria-live="polite"
      aria-busy={isStreaming}
    >
      <span>{content}</span>
      {showCursor && (
        <span
          className="ml-0.5 inline-block w-2 h-4 bg-current align-middle animate-pulse"
          aria-hidden="true"
        >
          ▌
        </span>
      )}
    </div>
  );
}

export default StreamingMessage;