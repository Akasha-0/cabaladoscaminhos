// src/components/cockpit/consultation/UserBubble.tsx
// Bolha da mensagem do usuário (Doc 05 §9 — laranja, à direita).

export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] border border-[var(--color-ramiro-orange)]/30 rounded-2xl rounded-tr-sm px-4 py-2.5"
        style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
        role="listitem"
        aria-label="Sua mensagem"
      >
        <p className="text-sm text-[var(--color-ramiro-orange)] whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}
