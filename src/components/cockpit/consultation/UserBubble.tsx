// src/components/cockpit/consultation/UserBubble.tsx
// Bolha da mensagem do usuário (Doc 05 §9 — laranja, à direita).

export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-primary/15 border border-primary/30 rounded-2xl rounded-tr-sm px-4 py-2.5">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
