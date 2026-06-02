'use client';

import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Check,
  X,
  Crown,
  Star,
  Zap,
  Sparkles,
  Sun,
  Moon,
  Heart,
  Bird,
  Dog,
  Cat,
  Bug,
  Baby,
  Flame,
  Castle,
  Trees,
  Mountain,
  GitFork,
  Circle,
  Book,
  Mail,
  Cross,
  Key,
  Coins,
  Anchor,
  Skull,
  AlertTriangle,
  Cloud,
  Home,
  Ship,
  Flower2,
  Flower,
  Briefcase,
  Scissors,
} from 'lucide-react';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { CARTAS_CIGANAS, type CartaCigana } from '@/lib/mesa-real/cards';
import { ODUS_16, type OduResumido } from '@/lib/mesa-real/oduses';
import { cn } from '@/lib/utils';

export interface CasaSlotData {
  casaId: number;
  cartaNumero: number | null;
  oduNumero: number | null;
  cartaNomeCustom?: string;
  oduNomeCustom?: string;
}

export interface MesaRealGridProps {
  values: Map<number, CasaSlotData>;
  onChange: (casaId: number, data: Partial<CasaSlotData>) => void;
  onClear: (casaId: number) => void;
  readOnly?: boolean;
}

const ICON_MAP: Record<number, any> = {
  1: Sun, 2: Briefcase, 3: Ship, 4: Home, 5: Flower, 6: Cloud,
  7: AlertTriangle, 8: Skull, 9: Flower, 10: Scissors, 11: Zap, 12: Bird,
  13: Baby, 14: Cat, 15: Crown, 16: Star, 17: Bird, 18: Dog,
  19: Castle, 20: Trees, 21: Mountain, 22: GitFork, 23: Bug, 24: Heart,
  25: Circle, 26: Book, 27: Mail, 28: Flame, 29: Sparkles, 30: Flower2,
  31: Sun, 32: Moon, 33: Key, 34: Coins, 35: Anchor, 36: Cross,
};

export function MesaRealGrid({ values, onChange, onClear, readOnly }: MesaRealGridProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-slate-700 bg-slate-900/50" />
          <span className="text-slate-400">Vazia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-amber-500/50 bg-amber-500/10" />
          <span className="text-slate-400">Com Carta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-violet-500/50 bg-violet-500/10" />
          <span className="text-slate-400">Com Odu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/20" />
          <span className="text-slate-400">Completa</span>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-1.5 md:gap-2">
        {HOUSES_36.map((house) => {
          const value = values.get(house.number);
          return (
            <CasaSlot
              key={house.number}
              house={house}
              value={value ?? { casaId: house.number, cartaNumero: null, oduNumero: null }}
              onChange={onChange}
              onClear={onClear}
              readOnly={readOnly}
            />
          );
        })}
      </div>
    </div>
  );
}

function CasaSlot({
  house,
  value,
  onChange,
  onClear,
  readOnly,
}: {
  house: typeof HOUSES_36[0];
  value: CasaSlotData;
  onChange: (casaId: number, data: Partial<CasaSlotData>) => void;
  onClear: (casaId: number) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = ICON_MAP[house.number] ?? Star;
  const carta = value.cartaNumero
    ? CARTAS_CIGANAS.find((c) => c.numero === value.cartaNumero)
    : null;
  const odu = value.oduNumero ? ODUS_16.find((o) => o.numero === value.oduNumero) : null;

  const isCompleta = value.cartaNumero !== null && value.oduNumero !== null;
  const isParcial = value.cartaNumero !== null || value.oduNumero !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={readOnly}
          className={cn(
            'group relative aspect-[3/4] rounded-md border transition-all p-1 md:p-1.5 text-left',
            'hover:scale-105 hover:z-10',
            isCompleta
              ? 'border-emerald-500 bg-emerald-500/10 hover:border-emerald-400'
              : isParcial
              ? value.cartaNumero
                ? 'border-amber-500/60 bg-amber-500/10 hover:border-amber-400'
                : 'border-violet-500/60 bg-violet-500/10 hover:border-violet-400'
              : 'border-slate-700/50 bg-slate-900/40 hover:border-slate-500'
          )}
          style={!isParcial ? { borderColor: `${house.corPrimaria}30` } : undefined}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[8px] md:text-[9px] font-bold"
              style={{ color: house.corPrimaria }}
            >
              {String(house.number).padStart(2, '0')}
            </span>
            <Icon
              className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-60"
              style={{ color: house.corPrimaria }}
            />
          </div>

          {carta && (
            <div className="text-[8px] md:text-[10px] font-medium text-amber-300 truncate">
              {value.cartaNomeCustom ?? carta.nome}
            </div>
          )}
          {odu && (
            <div className="text-[8px] md:text-[10px] font-medium text-violet-300 truncate">
              {value.oduNomeCustom ?? odu.nome}
            </div>
          )}

          {!isParcial && (
            <div className="text-[8px] md:text-[10px] text-slate-500 group-hover:text-slate-300 truncate">
              {house.cartaCigana}
            </div>
          )}

          {isCompleta && (
            <Check className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 text-emerald-400 bg-slate-900 rounded-full p-0.5" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 bg-slate-900 border-slate-700 p-0" align="start">
        <CasaPopoverContent
          house={house}
          value={value}
          onChange={onChange}
          onClear={onClear}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

function CasaPopoverContent({
  house,
  value,
  onChange,
  onClear,
  onClose,
}: {
  house: typeof HOUSES_36[0];
  value: CasaSlotData;
  onChange: (casaId: number, data: Partial<CasaSlotData>) => void;
  onClear: (casaId: number) => void;
  onClose: () => void;
}) {
  const cartaAtual = value.cartaNumero
    ? CARTAS_CIGANAS.find((c) => c.numero === value.cartaNumero)
    : null;
  const oduAtual = value.oduNumero
    ? ODUS_16.find((o) => o.numero === value.oduNumero)
    : null;

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
        <div>
          <p className="text-[10px] text-slate-500">Casa {house.number}</p>
          <h3 className="text-sm font-bold" style={{ color: house.corPrimaria }}>
            {house.cartaCigana}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{house.tema}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <CartaSelector
        cartaAtual={cartaAtual ?? null}
        cartaNumero={value.cartaNumero}
        cartaNomeCustom={value.cartaNomeCustom}
        onSelect={(cartaNumero, nomeCustom) =>
          onChange(house.number, { cartaNumero, cartaNomeCustom: nomeCustom })
        }
      />

      <OduSelector
        oduAtual={oduAtual ?? null}
        oduNumero={value.oduNumero}
        oduNomeCustom={value.oduNomeCustom}
        onSelect={(oduNumero, nomeCustom) =>
          onChange(house.number, { oduNumero, oduNomeCustom: nomeCustom })
        }
      />

      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onClear(house.number);
            onClose();
          }}
          className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <X className="w-3 h-3 mr-1" /> Limpar
        </Button>
        <Button size="sm" onClick={onClose} className="flex-1 bg-gradient-to-r from-amber-500 to-violet-500">
          <Check className="w-3 h-3 mr-1" /> Fechar
        </Button>
      </div>
    </div>
  );
}

function CartaSelector({
  cartaAtual,
  cartaNumero,
  cartaNomeCustom,
  onSelect,
}: {
  cartaAtual: CartaCigana | null;
  cartaNumero: number | null;
  cartaNomeCustom?: string;
  onSelect: (numero: number | null, nomeCustom?: string) => void;
}) {
  const [busca, setBusca] = useState('');
  const cartasFiltradas = CARTAS_CIGANAS.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-amber-400">Carta Cigana</Label>
        {cartaNumero !== null && (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[9px]">
            {cartaNomeCustom ?? cartaAtual?.nome}
          </Badge>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar carta (ex: Torre)..."
          className="bg-slate-800/50 border-slate-700 pl-7 h-7 text-xs"
        />
      </div>
      <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
        {cartaNumero !== null && (
          <button
            onClick={() => onSelect(null)}
            className="w-full text-left px-2 py-1.5 rounded text-[11px] text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <X className="w-3 h-3" /> Remover carta
          </button>
        )}
        {cartasFiltradas.map((carta) => (
          <button
            key={carta.numero}
            onClick={() => onSelect(carta.numero)}
            className={cn(
              'w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-2 transition-colors',
              cartaNumero === carta.numero
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            )}
          >
            <span className="text-slate-500 text-[9px]">{carta.numero}</span>
            <span className="flex-1">{carta.nome}</span>
            <span className="text-[9px] text-slate-500">{carta.categoria}</span>
            {cartaNumero === carta.numero && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function OduSelector({
  oduAtual,
  oduNumero,
  oduNomeCustom,
  onSelect,
}: {
  oduAtual: OduResumido | null;
  oduNumero: number | null;
  oduNomeCustom?: string;
  onSelect: (numero: number | null, nomeCustom?: string) => void;
}) {
  const [busca, setBusca] = useState('');
  const odusFiltrados = ODUS_16.filter((o) =>
    o.nome.toLowerCase().includes(busca.toLowerCase()) ||
    o.significadoCurto.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-violet-400">Odu de Búzios</Label>
        {oduNumero !== null && (
          <Badge variant="outline" className="border-violet-500/30 text-violet-400 text-[9px]">
            {oduNomeCustom ?? oduAtual?.nome}
          </Badge>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar odu (ex: Ogbe)..."
          className="bg-slate-800/50 border-slate-700 pl-7 h-7 text-xs"
        />
      </div>
      <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
        {oduNumero !== null && (
          <button
            onClick={() => onSelect(null)}
            className="w-full text-left px-2 py-1.5 rounded text-[11px] text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <X className="w-3 h-3" /> Remover odu
          </button>
        )}
        {odusFiltrados.map((odu) => (
          <button
            key={odu.numero}
            onClick={() => onSelect(odu.numero)}
            className={cn(
              'w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-2 transition-colors',
              oduNumero === odu.numero
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            )}
          >
            <span className="text-slate-500 text-[9px] w-4">{odu.numero}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{odu.nome}</div>
              <div className="text-[9px] text-slate-500 truncate">{odu.significadoCurto}</div>
            </div>
            {oduNumero === odu.numero && <Check className="w-3 h-3 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
