// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Filter, Calendar, User, Activity, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'process';
  module: 'tarot' | 'astrologia' | 'numerologia' | 'orixás' | 'ifá' | 'auth' | 'admin' | 'payment';
  resource: string;
  resourceId: string | null;
  ipAddress: string;
}

interface AuditLogViewerProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ACTION_COLORS: Record<string, { text: string; bg: string }> = {
  create: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  read: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
  update: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
  delete: { text: 'text-rose-400', bg: 'bg-rose-500/20' },
  login: { text: 'text-violet-400', bg: 'bg-violet-500/20' },
  logout: { text: 'text-slate-400', bg: 'bg-slate-500/20' },
  export: { text: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  process: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
};

const MODULE_ICONS: Record<string, string> = {
  tarot: '🃏',
  astrologia: '⭐',
  numerologia: '🔢',
  orixás: '🌀',
  ifá: '🌿',
  auth: '🔐',
  admin: '⚙️',
  payment: '💳',
};

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: '1', timestamp: '2026-05-30T10:35:00Z', user: 'Maria de Oxum', action: 'create', module: 'tarot', resource: 'Leitura Celtic Cross', resourceId: 'lr-001', ipAddress: '192.168.1.100' },
  { id: '2', timestamp: '2026-05-30T10:30:00Z', user: 'João de Ogum', action: 'process', module: 'numerologia', resource: 'Cálculo Numerológico', resourceId: 'calc-042', ipAddress: '192.168.1.101' },
  { id: '3', timestamp: '2026-05-30T10:25:00Z', user: 'Ana de Iansã', action: 'read', module: 'astrologia', resource: 'Trânsitos Planetários', resourceId: null, ipAddress: '192.168.1.102' },
  { id: '4', timestamp: '2026-05-30T10:20:00Z', user: 'Maria de Oxum', action: 'export', module: 'orixás', resource: 'Relatório Orixá', resourceId: 'rpt-012', ipAddress: '192.168.1.100' },
  { id: '5', timestamp: '2026-05-30T10:15:00Z', user: 'Admin', action: 'login', module: 'auth', resource: 'Dashboard', resourceId: null, ipAddress: '192.168.1.1' },
  { id: '6', timestamp: '2026-05-30T10:10:00Z', user: 'Carlos de Oxóssi', action: 'update', module: 'ifá', resource: 'Odu do Dia', resourceId: 'odu-089', ipAddress: '192.168.1.103' },
  { id: '7', timestamp: '2026-05-30T10:05:00Z', user: 'Maria de Oxum', action: 'read', module: 'tarot', resource: 'Histórico de Leituras', resourceId: null, ipAddress: '192.168.1.100' },
  { id: '8', timestamp: '2026-05-30T10:00:00Z', user: 'Paulo de Xangô', action: 'create', module: 'numerologia', resource: 'Mapa Numerológico', resourceId: 'map-156', ipAddress: '192.168.1.104' },
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

function LogEntryRow({ entry, onExpand }: { entry: AuditLogEntry; onExpand: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const actionColors = ACTION_COLORS[entry.action];
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  return (
    <>
      <tr 
        key={`${entry.id}-main`}
        className="border-b border-slate-700/30 hover:bg-slate-800/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-2 text-xs text-slate-400">
          {formatTimestamp(entry.timestamp)}
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-slate-500" />
            <span className="text-sm text-white">{entry.user}</span>
          </div>
        </td>
        <td className="px-3 py-2">
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', actionColors.text, actionColors.bg)}>
            {entry.action}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{MODULE_ICONS[entry.module]}</span>
            <span className="text-sm text-slate-300">{entry.module}</span>
          </div>
        </td>
        <td className="px-3 py-2 text-sm text-slate-300 truncate max-w-[200px]">
          {entry.resource}
        </td>
        <td className="px-3 py-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr key={`${entry.id}-detail`} className="bg-slate-800/20">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">ID do Recurso:</span>
                <p className="text-slate-300 font-mono">{entry.resourceId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500">Endereço IP:</span>
                <p className="text-slate-300 font-mono">{entry.ipAddress}</p>
              </div>
              <div>
                <span className="text-slate-500">ID do Log:</span>
                <p className="text-slate-300 font-mono">{entry.id}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AuditLogViewer({ className = '' }: AuditLogViewerProps) {
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    return matchesAction && matchesModule;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredLogs;
    const blob = format === 'json' 
      ? new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      : new Blob([[
          'Timestamp,User,Action,Module,Resource,ResourceId,IP',
          ...data.map(l => `${l.timestamp},${l.user},${l.action},${l.module},${l.resource},${l.resourceId || ''},${l.ipAddress}`)
        ].join('\n')], { type: 'text/csv' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn('card-spiritual', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-lg">Log de Auditoria</CardTitle>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
              {filteredLogs.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400">Filtrar:</span>
          </div>
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todas ações</option>
            <option value="create">Create</option>
            <option value="read">Read</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Export</option>
            <option value="process">Process</option>
          </select>
          <select
            value={filterModule}
            onChange={(e) => { setFilterModule(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todos módulos</option>
            <option value="tarot">Tarot</option>
            <option value="astrologia">Astrologia</option>
            <option value="numerologia">Numerologia</option>
            <option value="orixás">Orixás</option>
            <option value="ifá">Ifá</option>
            <option value="auth">Auth</option>
            <option value="admin">Admin</option>
            <option value="payment">Payment</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedLogs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-slate-400">Nenhum registro encontrado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Data/Hora</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Usuário</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ação</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Módulo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Recurso</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map(log => (
                    <LogEntryRow key={log.id} entry={log} onExpand={() => {}} />
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                <span className="text-sm text-slate-500">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AuditLogViewer;
