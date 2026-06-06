// src/components/cockpit/consultation/ConsultationInput.tsx
// Input do chat (Doc 05 §9 — textarea + botão Enviar laranja).
// Enter envia, Shift+Enter quebra linha.

'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ConsultationInputProps {
  onSend: (question: string) => void;
  disabled?: boolean;
}

export function ConsultationInput({ onSend, disabled }: ConsultationInputProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = value.trim();
    if (!q || disabled) return;
    onSend(q);
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/50 bg-background/50 px-4 py-3 flex items-end gap-2 flex-shrink-0"
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Pergunte ao Oráculo…  (Enter envia · Shift+Enter quebra linha)"
        rows={2}
        disabled={disabled}
        className="flex-1 resize-none px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 disabled:opacity-50"
      />
      <Button
        type="submit"
        variant="spiritual"
        size="icon"
        disabled={disabled || !value.trim()}
        className="shadow-[0_0_20px_var(--accent-orange-glow)] h-10 w-10"
        aria-label="Enviar pergunta"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
