// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Heart, UserPlus, Shield, Activity, Circle, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'admin' | 'editor' | 'viewer';
  lastAccess: string;
}

interface Activity {
  id: string;
  collaboratorId: string;
  action: string;
  timestamp: string;
}

interface CollaborationHubProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  online: { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Online' },
  away: { color: 'text-amber-400', bg: 'bg-amber-500', label: 'Ausente' },
  busy: { color: 'text-rose-400', bg: 'bg-rose-500', label: 'Ocupado' },
  offline: { color: 'text-slate-500', bg: 'bg-slate-500', label: 'Offline' },
};

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  editor: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  viewer: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

const MOCK_COLLABORATORS: Collaborator[] = [
  { id: '1', name: 'Maria de Oxum', email: 'maria@cabaladoscaminhos.com', avatar: null, status: 'online', role: 'admin', lastAccess: '2026-05-30T10:35:00Z' },
  { id: '2', name: 'João de Ogum', email: 'joao@cabaladoscaminhos.com', avatar: null, status: 'online', role: 'editor', lastAccess: '2026-05-30T10:30:00Z' },
  { id: '3', name: 'Ana de Iansã', email: 'ana@cabaladoscaminhos.com', avatar: null, status: 'away', role: 'editor', lastAccess: '2026-05-30T09:45:00Z' },
  { id: '4', name: 'Carlos de Oxóssi', email: 'carlos@cabaladoscaminhos.com', avatar: null, status: 'busy', role: 'viewer', lastAccess: '2026-05-30T10:20:00Z' },
  { id: '5', name: 'Paulo de Xangô', email: 'paulo@cabaladoscaminhos.com', avatar: null, status: 'offline', role: 'viewer', lastAccess: '2026-05-29T22:00:00Z' },
  { id: '6', name: 'Lucia de Iemanjá', email: 'lucia@cabaladoscaminhos.com', avatar: null, status: 'online', role: 'editor', lastAccess: '2026-05-30T10:25:00Z' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', collaboratorId: '1', action: 'Criou nova leitura de Tarot', timestamp: '2026-05-30T10:35:00Z' },
  { id: '2', collaboratorId: '2', action: 'Atualizou mapa numerológico', timestamp: '2026-05-30T10:30:00Z' },
  { id: '3', collaboratorId: '6', action: 'Compartilhou insight astrológico', timestamp: '2026-05-30T10:25:00Z' },
  { id: '4', collaboratorId: '3', action: 'Adicionou comentário', timestamp: '2026-05-30T09:45:00Z' },
  { id: '5', collaboratorId: '4', action: 'Exportou relatório', timestamp: '2026-05-30T10:20:00Z' },
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

function CollaboratorCard({ collaborator }: { collaborator: Collaborator }) {
  const statusConfig = STATUS_COLORS[collaborator.status];
  const roleConfig = ROLE_COLORS[collaborator.role];

  const formatLastAccess = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium">
          {collaborator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <span className={cn(
          'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900',
          statusConfig.bg
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{collaborator.name}</p>
          <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium shrink-0', roleConfig.color, roleConfig.bg)}>
            {collaborator.role}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">{collaborator.email}</p>
      </div>
      <div className="text-right">
        <p className={cn('text-xs font-medium', statusConfig.color)}>{statusConfig.label}</p>
        <p className="text-xs text-slate-500">{formatLastAccess(collaborator.lastAccess)}</p>
      </div>
    </div>
  );
}

function ActivityItem({ activity, collaborator }: { activity: Activity; collaborator: Collaborator | undefined }) {
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-700/20 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
        {collaborator?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">
          <span className="font-medium text-white">{collaborator?.name.split(' ')[0]}</span>
          {' '}{activity.action.toLowerCase()}
        </p>
        <p className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function CollaborationHub({ className = '' }: CollaborationHubProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'collaborators' | 'activity'>('collaborators');

  const onlineCount = MOCK_COLLABORATORS.filter(c => c.status === 'online').length;
  const totalCount = MOCK_COLLABORATORS.length;
  const displayedCollaborators = showAll ? MOCK_COLLABORATORS : MOCK_COLLABORATORS.slice(0, 4);

  return (
    <Card className={cn('card-spiritual', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            <CardTitle className="text-lg">Colaboração</CardTitle>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              <Circle className="w-2 h-2 fill-current" />
              {onlineCount} online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Convidar
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'collaborators'
                ? 'bg-primary/20 text-primary'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            )}
          >
            <Users className="w-4 h-4 inline-block mr-1" />
            Equipe ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'activity'
                ? 'bg-primary/20 text-primary'
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            )}
          >
            <Activity className="w-4 h-4 inline-block mr-1" />
            Atividades
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'collaborators' ? (
          <div className="space-y-2">
            {displayedCollaborators.map(collaborator => (
              <CollaboratorCard key={collaborator.id} collaborator={collaborator} />
            ))}
            {totalCount > 4 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 inline-block mr-1" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 inline-block mr-1" />
                    Ver todos ({totalCount})
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Atividades Recentes</h4>
            <div className="space-y-1">
              {MOCK_ACTIVITIES.map(activity => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  collaborator={MOCK_COLLABORATORS.find(c => c.id === activity.collaboratorId)} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/30">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
            <Heart className="w-4 h-4" />
            Favoritos
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
            <Shield className="w-4 h-4" />
            Permissões
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CollaborationHub;
