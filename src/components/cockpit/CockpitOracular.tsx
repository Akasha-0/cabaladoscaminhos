// src/components/cockpit/CockpitOracular.tsx
// Main cockpit — 3-zone layout (Doc 05 §4.1).
// Tokens Ramiro v2: bg-background, glow royal no container, glow laranja no overlay.
// Zone A (sidebar): Client info + 4 natal maps
// Zone B (center): Mesa Real grid 9×4
// Zone C (right): Dossier viewer + Consultation drawer (collapsible)

'use client';

import { FileText, MessageCircle, X, Sparkles } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { type OduInfo } from '@/lib/ifa/odu-data';
import { cn } from '@/lib/utils';
import { useCockpitStore, type CartaCiganaOption } from '@/stores/cockpit-store';
import { CockpitHeader } from './CockpitHeader';
import { CockpitSidebar } from './CockpitSidebar';
import { HouseCell } from './HouseCell';
import { HouseInputPopover } from './HouseInputPopover';
import { DossierViewer } from './dossier/DossierViewer';
import { OraculoChat } from './consultation/OraculoChat';
import { Button } from '@/components/ui/button';

// Zone C panel dimensions
const RIGHT_PANEL_WIDTH = '480px';

interface CockpitOracularProps {
  /** Optional reading ID to wire DossierViewer and OraculoChat. */
  readingId?: string;
  /** Client name for OraculoChat placeholder. */
  clientName?: string;
  showDebug?: boolean;
}

export function CockpitOracular({ readingId: propReadingId, clientName: propClientName, showDebug = false }: CockpitOracularProps) {
  const {
    houses,
    activePopover,
    setActivePopover,
    fillHouse,
    clearHouse,
    clearAllHouses,
    resetCockpit,
    currentReadingId: storeReadingId,
    cliente,
    // Zone C state
    isRightPanelOpen,
    rightPanelTab,
    setRightPanelTab,
    toggleRightPanel,
    openRightPanel,
  } = useCockpitStore();

  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleClosePopover = useCallback(() => {
    setActivePopover(null);
    setPopoverPosition(null);
  }, [setActivePopover]);

  const handleSaveHouse = useCallback(
    (carta: CartaCiganaOption, odu: OduInfo) => {
      if (activePopover) {
        fillHouse(activePopover, carta, odu);
      }
    },
    [activePopover, fillHouse]
  );

  const handleClearHouse = useCallback(
    (casaNumero: number) => {
      clearHouse(casaNumero);
    },
    [clearHouse]
  );

  const handleNewAtendimento = useCallback(() => {
    resetCockpit();
  }, [resetCockpit]);

  const handleClearAll = useCallback(() => {
    clearAllHouses();
  }, [clearAllHouses]);

  const handleAutoFill = useCallback(() => {
    // Demo auto-fill - fill first 12 houses
    const CARTAS_EXAMPLE: { numero: number; nome: string; significado: string }[] = [
      { numero: 1, nome: 'O Cavaleiro', significado: 'Ação' },
      { numero: 4, nome: 'A Casa', significado: 'Família' },
      { numero: 9, nome: 'Os Buquês', significado: 'Surpresas' },
      { numero: 12, nome: 'Os Pássaros', significado: 'Comunicação' },
      { numero: 16, nome: 'A Estrela', significado: 'Esperança' },
      { numero: 19, nome: 'O Cachorro', significado: 'Lealdade' },
      { numero: 25, nome: 'O Coração', significado: 'Amor' },
      { numero: 27, nome: 'A Âncora', significado: 'Estabilidade' },
      { numero: 31, nome: 'O Sol', significado: 'Sucesso' },
      { numero: 5, nome: 'A Árvore', significado: 'Crescimento' },
      { numero: 17, nome: 'A Cegonha', significado: 'Novidades' },
      { numero: 28, nome: 'O Cigano', significado: 'Energia Masculina' },
    ];

    const odusExample = [
      {
        numero: 1,
        nome: 'Okaran',
        significado: 'O começo',
        elementos: 'Terra / Fogo',
        orixas: ['Exu', 'Omolu'],
        quizilas: [],
        preceitos: '',
        ebo: '',
      },
      {
        numero: 4,
        nome: 'Irosun',
        significado: 'O aviso',
        elementos: 'Fogo / Terra',
        orixas: ['Iemanjá', 'Oxóssi'],
        quizilas: [],
        preceitos: '',
        ebo: '',
      },
      {
        numero: 7,
        nome: 'Odi',
        significado: 'O poço',
        elementos: 'Terra / Água',
        orixas: ['Omolu', 'Oxumaré'],
        quizilas: [],
        preceitos: '',
        ebo: '',
      },
      {
        numero: 2,
        nome: 'Ejiokô',
        significado: 'Dualidade',
        elementos: 'Ar / Terra',
        orixas: ['Ibeji', 'Ogum'],
        quizilas: [],
        preceitos: '',
        ebo: '',
      },
    ];

    for (let i = 1; i <= 12; i++) {
      const carta = CARTAS_EXAMPLE[(i - 1) % CARTAS_EXAMPLE.length];
      const odu = odusExample[(i - 1) % odusExample.length];
      fillHouse(i, carta, odu as unknown as OduInfo);
    }
  }, [fillHouse]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Zone A: Left Sidebar */}
      <CockpitSidebar onNewAtendimento={handleNewAtendimento} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Zone B: Header */}
        <CockpitHeader
          showDebug={showDebug}
          onClearAll={handleClearAll}
          onAutoFill={showDebug ? handleAutoFill : undefined}
        />

        {/* Zone C: Mesa Real Grid (center content) */}
        <div className="flex-1 p-6 overflow-auto">
          <div
            className={cn(
              'relative max-w-6xl mx-auto',
              'bg-card/50 rounded-3xl',
              'border border-border/50',
              'p-6 md:p-8',
              // Doc 05 §4.3 — profundidade royal ao fundo do grid
              'shadow-[inset_0_0_60px_var(--accent-royal-glow)]'
            )}
          >
            {/* Grid Container */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
              }}
            >
              {HOUSES_36.map((house) => {
                const filledData = houses.get(house.number);
                const isActive = activePopover === house.number;

                return (
                  <div
                    key={house.number}
                    className="group"
                    onClick={() => {
                      setActivePopover(isActive ? null : house.number);
                    }}
                  >
                    <HouseCell
                      house={house}
                      filledData={filledData}
                      isActive={isActive}
                      onClick={() => {
                        setActivePopover(isActive ? null : house.number);
                      }}
                      onClear={() => handleClearHouse(house.number)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Grid Glow Effect (laranja) */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          </div>

          {/* Progress Summary */}
          <div className="max-w-6xl mx-auto mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted border border-dashed border-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/70">Vazia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-card/80 to-background/80 border border-primary/50" />
                <span className="text-xs text-muted-foreground/70">Preenchida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-2 ring-primary" />
                <span className="text-xs text-muted-foreground/70">Em edição</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/60">
              Clique em uma casa para preencher · Use Tab para navegar
            </p>
          </div>
        </div>
      </div>

      {/* Popover - Positioned absolutely */}
      {activePopover !== null && (
        <div
          className="fixed z-50"
          style={{
            top: popoverPosition?.y ? popoverPosition.y - 10 : undefined,
            left: popoverPosition?.x ? `calc(${popoverPosition.x}px - 160px)` : undefined,
            transform: 'translateY(-100%)',
          }}
        >
          <HouseInputPopover
            casaNumero={activePopover}
            onClose={handleClosePopover}
            onSave={handleSaveHouse}
          />
        </div>
      )}

      {/* Zone C: Right Panel (collapsible drawer) */}
      <ZoneCRightPanel
        readingId={storeReadingId ?? undefined}
        clientName={cliente?.nome ?? 'Cliente'}
        isOpen={isRightPanelOpen}
        activeTab={rightPanelTab}
        onToggle={toggleRightPanel}
        onSetTab={setRightPanelTab}
      />
    </div>
  );
}

// ─── Zone C: Right Panel ─────────────────────────────────────────────────────

interface ZoneCRightPanelProps {
  readingId?: string;
  clientName: string;
  isOpen: boolean;
  activeTab: 'dossier' | 'consult';
  onToggle: () => void;
  onSetTab: (tab: 'dossier' | 'consult') => void;
}

function ZoneCRightPanel({
  readingId,
  clientName,
  isOpen,
  activeTab,
  onToggle,
  onSetTab,
}: ZoneCRightPanelProps) {
  return (
    <>
      {/* Toggle Button — always visible on right edge */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Fechar painel direito' : 'Abrir painel direito'}
        className={cn(
          'fixed top-1/2 right-0 z-30',
          'flex flex-col items-center justify-center gap-1',
          'w-10 h-20 rounded-l-xl',
          'bg-card/90 border border-border/50 backdrop-blur-sm',
          'shadow-[0_0_20px_var(--accent-royal-glow)]',
          'transition-all duration-300',
          'hover:bg-card',
          isOpen && 'opacity-0 pointer-events-none translate-x-4'
        )}
      >
        <FileText className="w-4 h-4 text-primary" />
        <MessageCircle className="w-4 h-4 text-secondary" />
      </button>

      {/* Panel backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-30 h-full',
          'bg-card/95 border-l border-border/50 backdrop-blur-md',
          'flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.3)]',
          'transition-transform duration-300 ease-out',
          'w-[480px] max-w-[100vw]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-cinzel text-sm text-foreground">
              Ferramentas de Leitura
            </h2>
            <button
              onClick={onToggle}
              aria-label="Fechar painel"
              className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-muted/50 p-1 gap-1">
            <TabButton
              active={activeTab === 'dossier'}
              onClick={() => onSetTab('dossier')}
              icon={<FileText className="w-3.5 h-3.5" />}
              label="Dossiê"
            />
            <TabButton
              active={activeTab === 'consult'}
              onClick={() => onSetTab('consult')}
              icon={<MessageCircle className="w-3.5 h-3.5" />}
              label="Consultar"
            />
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'dossier' ? (
            readingId ? (
              <DossierViewer readingId={readingId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="font-cinzel text-base text-muted-foreground mb-2">
                  Nenhuma leitura selecionada
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Gere o dossiê após preencher as casas da Mesa Real
                </p>
              </div>
            )
          ) : readingId ? (
            <div className="flex flex-col h-full">
              {/* Oráculo header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-cinzel text-xs text-primary">
                  Oráculo · {clientName}
                </span>
              </div>
              <OraculoChat readingId={readingId} clientName={clientName} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="font-cinzel text-base text-muted-foreground mb-2">
                Nenhuma leitura selecionada
              </p>
              <p className="text-xs text-muted-foreground/60">
                Abra uma leitura para consultar o Oráculo
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2 px-3',
        'rounded-md text-xs font-medium transition-all duration-200',
        active
          ? [
              'bg-primary text-primary-foreground',
              'shadow-[0_0_16px_var(--accent-orange-glow)]',
              // laranja for active
            ].join(' ')
          : [
              'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              // royal for inactive
            ].join(' ')
      )}
    >
      {icon}
      {label}
    </button>
  );
}
