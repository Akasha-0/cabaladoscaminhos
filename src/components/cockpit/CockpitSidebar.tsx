// src/components/cockpit/CockpitSidebar.tsx
// Left sidebar with client form and map badges
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
    // In a real app, this would calculate the mapa from birth data
    // For now, just save the form data
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
      <div className="w-16 bg-slate-900/80 border-r border-slate-800 flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-8 space-y-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900/80 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Cabala
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="w-full border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
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
              <Label htmlFor="nome" className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" />
                Nome do Cliente
              </Label>
              <Input
                id="nome"
                placeholder="Digite o nome..."
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Data Nasc.
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora" className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Hora
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.horaNascimento}
                  onChange={(e) => setFormData({ ...formData, horaNascimento: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="local" className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Local
              </Label>
              <Input
                id="local"
                placeholder="Cidade, Estado"
                value={formData.localNascimento}
                onChange={(e) => setFormData({ ...formData, localNascimento: e.target.value })}
                className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
              />
            </div>

            <Button 
              onClick={handleSaveCliente}
              disabled={!formData.nome || !formData.dataNascimento}
              className="w-full bg-slate-800 hover:bg-slate-700 border-slate-700/50"
              size="sm"
            >
              Salvar Cliente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client Summary */}
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">{cliente.nome}</span>
                <button
                  onClick={() => setIsFormExpanded(true)}
                  className="text-xs text-amber-500 hover:text-amber-400"
                >
                  Editar
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {cliente.dataNascimento} · {cliente.localNascimento || 'Sem local'}
              </p>
            </div>

            {/* Map Badges */}
            {cliente.mapa && (
              <div className="space-y-2">
                {/* Astrological Badge */}
                {(cliente.mapa.sol || cliente.mapa.ascendente) && (
                  <Badge 
                    variant="outline"
                    className="w-full justify-start bg-amber-500/5 border-amber-500/20 text-amber-400/80"
                  >
                    <Crown className="w-3 h-3 mr-2 text-amber-500" />
                    {cliente.mapa.sol || 'Sol em ...'} {cliente.mapa.ascendente && `| ${cliente.mapa.ascendente}`}
                  </Badge>
                )}

                {/* Cabalistic Badge */}
                {(cliente.mapa.caminho || cliente.mapa.missao) && (
                  <Badge 
                    variant="outline"
                    className="w-full justify-start bg-violet-500/5 border-violet-500/20 text-violet-400/80"
                  >
                    <Sparkles className="w-3 h-3 mr-2 text-violet-500" />
                    {cliente.mapa.caminho && `Caminho: ${cliente.mapa.caminho}`} 
                    {cliente.mapa.missao && ` | Missão: ${cliente.mapa.missao}`}
                  </Badge>
                )}

                {/* Tantric Badge */}
                {(cliente.mapa.alma || cliente.mapa.karma) && (
                  <Badge 
                    variant="outline"
                    className="w-full justify-start bg-emerald-500/5 border-emerald-500/20 text-emerald-400/80"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-emerald-500" />
                    {cliente.mapa.alma && `Alma: ${cliente.mapa.alma}`} 
                    {cliente.mapa.karma && ` | Karma: ${cliente.mapa.karma}`}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Generate Dossiê Button */}
      <div className="p-4 border-t border-slate-800/50">
        <Button
          variant="golden"
          size="lg"
          className="w-full shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          disabled={false}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Dossiê Cabalístico
        </Button>
        <p className="text-xs text-slate-600 text-center mt-2">
          Preencha as casas para gerar o relatório
        </p>
      </div>
    </div>
  );
}

export default CockpitSidebar;