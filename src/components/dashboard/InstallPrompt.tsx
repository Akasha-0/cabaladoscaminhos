'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  /** Custom title text */
  title?: string;
  /** Custom description text */
  description?: string;
  /** Custom install button label */
  installLabel?: string;
  /** Custom dismiss button label */
  dismissLabel?: string;
  /** Custom CSS classes */
  className?: string;
  /** Auto-dismiss delay in ms after action (default: 0) */
  dismissDelay?: number;
  /** Show only when canInstall is true (default: true) */
  autoShow?: boolean;
}

export function InstallPrompt({
  title = 'Install App',
  description = 'Add Cabala dos Caminhos to your home screen for a better experience.',
  installLabel = 'Install',
  dismissLabel = 'Not now',
  className,
  dismissDelay = 0,
  autoShow = true,
}: InstallPromptProps) {
  const { installApp, installPrompt, canInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when install prompt becomes available
  useEffect(() => {
    if (canInstall) {
      setDismissed(false);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    await installApp();
    if (dismissDelay > 0) {
      setTimeout(() => setDismissed(true), dismissDelay);
    } else {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    if (dismissDelay > 0) {
      setTimeout(() => setDismissed(true), dismissDelay);
    } else {
      setDismissed(true);
    }
  };

  // Don't render if no prompt, already dismissed, or autoShow disabled
  if (!installPrompt || dismissed || (!autoShow && !canInstall)) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm',
        className
      )}
      role="dialog"
      aria-label={title}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <SpiritualButton variant="ghost" size="sm" onClick={handleDismiss}>
            {dismissLabel}
          </SpiritualButton>
          <SpiritualButton variant="golden" size="sm" onClick={handleInstall}>
            {installLabel}
          </SpiritualButton>
        </div>
      </div>
    </div>
  );
}