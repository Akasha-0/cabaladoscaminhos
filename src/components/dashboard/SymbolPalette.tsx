'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';
import {
  getSymbol,
  getSymbolNames,
} from '@/lib/astrologia/symbols';

type SymbolCategory = 'zodiac' | 'planet' | 'aspect';

const CATEGORY_LABELS: Record<SymbolCategory, string> = {
  zodiac: 'Zodiac',
  planet: 'Planetas',
  aspect: 'Aspectos',
};

const CATEGORY_DESCRIPTIONS: Record<SymbolCategory, string> = {
  zodiac: 'Sinais do zodíaco',
  planet: 'Corpos celestiais',
  aspect: 'Ângulos astrológicos',
};

interface SymbolButtonProps {
  category: SymbolCategory;
  name: string;
  onCopy: (svg: string, key: string) => void;
  isCopied: boolean;
}

function SymbolButton({ category, name, onCopy, isCopied }: SymbolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const svg = getSymbol(category, name);
  const key = `${category}:${name}`;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => onCopy(svg, key)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex aspect-square flex-col items-center justify-center rounded-lg border border-transparent bg-muted/50 p-3 transition-all hover:border-primary/30 hover:bg-muted"
      >
        <div
          className="size-10 text-foreground transition-transform group-hover:scale-110"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <span className="mt-1.5 text-[10px] font-medium capitalize text-muted-foreground">
          {name}
        </span>
        <div className="absolute right-1.5 top-1.5">
          {isCopied ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Copy className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </button>
      {showTooltip && (
        <div className="absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border bg-popover px-3 py-1.5 text-sm shadow-lg">
          <p className="font-medium capitalize">{name}</p>
          <p className="text-xs text-muted-foreground">Clique para copiar SVG</p>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}

interface SymbolGridProps {
  category: SymbolCategory;
  onCopy: (svg: string, key: string) => void;
  copiedKey: string | null;
}

function SymbolGrid({ category, onCopy, copiedKey }: SymbolGridProps) {
  const names = getSymbolNames(category);

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="grid grid-cols-4 gap-3">
        {names.map((name) => (
          <SymbolButton
            key={name}
            category={category}
            name={name}
            onCopy={onCopy}
            isCopied={copiedKey === `${category}:${name}`}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface SymbolPaletteProps {
  className?: string;
}

export function SymbolPalette({ className }: SymbolPaletteProps) {
  const [activeTab, setActiveTab] = useState<SymbolCategory>('zodiac');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (svg: string, key: string) => {
    try {
      await navigator.clipboard.writeText(svg);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = svg;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className={className}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SymbolCategory)}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Paleta de Símbolos</h3>
            <p className="text-sm text-muted-foreground">
              {CATEGORY_DESCRIPTIONS[activeTab]}
            </p>
          </div>
          <TabsList>
            {(['zodiac', 'planet', 'aspect'] as SymbolCategory[]).map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {(['zodiac', 'planet', 'aspect'] as SymbolCategory[]).map((cat) => (
          <TabsContent key={cat} value={cat}>
            <SymbolGrid
              category={cat}
              onCopy={handleCopy}
              copiedKey={copiedKey}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
        <p className="text-sm text-muted-foreground">
          {copiedKey ? (
            <span className="flex items-center gap-1.5 text-green-600">
              <Check className="size-4" />
              SVG copiado para a área de transferência
            </span>
          ) : (
            'Selecione um símbolo para copiar seu SVG'
          )}
        </p>
      </div>
    </div>
  );
}

export default SymbolPalette;