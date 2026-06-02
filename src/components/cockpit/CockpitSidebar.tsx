// src/components/cockpit/CockpitSidebar.tsx
// Left sidebar with client form and map badges (Doc 05 §4.2 / Doc 13 §4.3).
// Tokens Ramiro v2: badges por sistema — astro/cabala/odu = royal, tantric = laranja.

'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Crown
} from 'lucide-react';
import { useCockpitStore, type ClienteInfo } from '@/stores/cockpit-store';

interface CockpitSidebarProps {
  onNewAtendimento: () => void;
}

// fallow-ignore-next-line complexity
export function CockpitSidebar({ onNewAtendimento }: CockpitSidebarProps) {
  const { cliente, setCliente, isSidebarCollapsed, toggleSidebar } = useCockpitStore();
  const [isFormExpanded, setIsFormExpanded] = useState(!cliente);
  const [formData, setFormData] = useState<ClienteInfo>({
    nome: '',
    dataNascimento: '',
    horaNascimento: '',
    localNascimento: '',
    mapa: undefined,
  });

  const handleSaveCliente = () => {
    // Em produção: chama Server Action que calcula 4 mapas e persiste.
    // Aqui: stub que preenche badges para preview visual.
    setCliente({
      ...formData,
      mapa: {
        sol: 'Sol em Leão',
        ascendente: 'Asc: Virgem',
        caminho: '7',
        missao: '11',
        alma: '2',
        karma: '8',
      },
    });
    setIsFormExpanded(false);
  };

  const handleReset = () => {
    onNewAtendimento();
    setFormData({
      nome: '',
      dataNascimento: '',
      horaNascimento: '',
      localNascimento: '',
      mapa: undefined,
    });
    setIsFormExpanded(true);
  };

  if (isSidebarCollapsed) {
    return (
      <div className="w-16 bg-card/80 border-r border-border flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Expandir sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-8 space-y-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card/80 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-cinzel">
              Cabala
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Recolher sidebar"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Novo Atendimento
        </Button>
      </div>

      {/* Client Form / Summary */}
      <div className="flex-1 overflow-y-auto p-4">
        {isFormExpanded || !cliente ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" />
                Nome do Cliente
              </Label>
              <Input
                id="nome"
                placeholder="Digite o nome..."
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-muted/50 border-border/50 focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Data Nasc.
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Hora
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.horaNascimento}
                  onChange={(e) => setFormData({ ...formData, horaNascimento: e.target.value })}
                  className="bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="local" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Local
              </Label>
              <Input
                id="local"
                placeholder="Cidade, Estado"
                value={formData.localNascimento}
                onChange={(e) => setFormData({ ...formData, localNascimento: e.target.value })}
                className="bg-muted/50 border-border/50 focus:border-primary/50"
              />
            </div>

            <Button
              onClick={handleSaveCliente}
              disabled={!formData.nome || !formData.dataNascimento}
              className="w-full bg-muted hover:bg-muted/70 border-border/50"
              size="sm"
            >
              Salvar Cliente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client Summary */}
            <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground/90">{cliente.nome}</span>
                <button
                  onClick={() => setIsFormExpanded(true)}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Editar
                </button>
              </div>
              <p className="text-xs text-muted-foreground/70">
                {cliente.dataNascimento} · {cliente.localNascimento || 'Sem local'}
              </p>
            </div>

            {/* Map Badges (Doc 13 §4.3 — astro/cabala/odu = royal, tantric = laranja) */}
            {cliente.mapa && (
              <div className="space-y-2">
                {/* Astrologia → royal (Doc 13 §4.3) */}
                {(cliente.mapa.sol || cliente.mapa.ascendente) && (
                  <Badge
                    variant="outline"
                    className="w-full justify-start bg-secondary/15 border-secondary/40 text-secondary"
                  >
                    <Crown className="w-3 h-3 mr-2 text-secondary" />
                    {cliente.mapa.sol || 'Sol em ...'} {cliente.mapa.ascendente && `| ${cliente.mapa.ascendente}`}
                  </Badge>
                )}

                {/* Cabala → royal */}
                {(cliente.mapa.caminho || cliente.mapa.missao) && (
                  <Badge
                    variant="outline"
                    className="w-full justify-start bg-secondary/10 border-secondary/30 text-foreground/90"
                  >
                    <Sparkles className="w-3 h-3 mr-2 text-secondary" />
                    {cliente.mapa.caminho && `Caminho: ${cliente.mapa.caminho}`}
                    {cliente.mapa.missao && ` | Missão: ${cliente.mapa.missao}`}
                  </Badge>
                )}

                {/* Tântrica → laranja (Doc 13 §4.3) */}
                {(cliente.mapa.alma || cliente.mapa.karma) && (
                  <Badge
                    variant="outline"
                    className="w-full justify-start bg-primary/15 border-primary/40 text-primary"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-primary" />
                    {cliente.mapa.alma && `Alma: ${cliente.mapa.alma}`}
                    {cliente.mapa.karma && ` | Karma: ${cliente.mapa.karma}`}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Generate Dossiê Button (laranja, doc 13 §6.1) */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="spiritual"
          size="lg"
          className="w-full shadow-[0_0_20px_var(--accent-orange-glow)]"
          disabled={false}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Dossiê Cabalístico
        </Button>
        <p className="text-xs text-muted-foreground/60 text-center mt-2">
          Preencha as casas para gerar o relatório
        </p>
      </div>
    </div>
  );
}
