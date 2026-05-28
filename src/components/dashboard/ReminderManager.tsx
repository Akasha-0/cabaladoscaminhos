'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Repeat,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent } from '@/components/ui/spiritual-card';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type ReminderType = 'oracao' | 'meditacao' | 'ritual' | 'intencao' | 'gratidao' | 'manifestacao';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: ReminderType;
  datetime: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  createdAt: string;
}

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  oracao: 'Oração',
  meditacao: 'Meditação',
  ritual: 'Ritual',
  intencao: 'Intenção',
  gratidao: 'Gratidão',
  manifestacao: 'Manifestação',
};

const REMINDER_TYPE_COLORS: Record<ReminderType, string> = {
  oracao: 'text-amber-400',
  meditacao: 'text-indigo-400',
  ritual: 'text-purple-400',
  intencao: 'text-cyan-400',
  gratidao: 'text-emerald-400',
  manifestacao: 'text-rose-400',
};

function generateId(): string {
  return `reminder_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('spiritual_reminders');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem('spiritual_reminders', JSON.stringify(reminders));
}

export function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'oracao' as ReminderType,
    datetime: '',
    recurring: 'none' as Reminder['recurring'],
  });

  useEffect(() => {
    setReminders(getStoredReminders());
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.title.trim() || !formData.datetime) return;

    const now = new Date().toISOString();

    if (editingReminder) {
      const updated = reminders.map(r =>
        r.id === editingReminder.id
          ? { ...r, ...formData }
          : r
      );
      setReminders(updated);
      saveReminders(updated);
    } else {
      const newReminder: Reminder = {
        id: generateId(),
        ...formData,
        completed: false,
        createdAt: now,
      };
      const updated = [newReminder, ...reminders];
      setReminders(updated);
      saveReminders(updated);
    }

    setShowModal(false);
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      type: 'oracao',
      datetime: '',
      recurring: 'none',
    });
  }, [formData, editingReminder, reminders]);

  const handleEdit = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      type: reminder.type,
      datetime: reminder.datetime.slice(0, 16),
      recurring: reminder.recurring,
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  }, [reminders]);

  const handleToggleComplete = useCallback((id: string) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    saveReminders(updated);
  }, [reminders]);

  const handleAddNew = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      type: 'oracao',
      datetime: '',
      recurring: 'none',
    });
    setShowModal(true);
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Bell className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-spiritual-gold">
              Lembretes Espirituais
            </h2>
            <p className="text-sm text-spiritual-text/60">
              {activeReminders.length} lembr{activeReminders.length === 1 ? 'ete' : 'etes'} ativo{activeReminders.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <SpiritualButton onClick={handleAddNew} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lembrete
        </SpiritualButton>
      </div>

      <Separator className="bg-spiritual-border/30" />

      {/* Active Reminders */}
      {activeReminders.length === 0 ? (
        <div className="text-center py-12 text-spiritual-text/50">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum lembrete ativo</p>
          <p className="text-sm mt-1">Clique em "Novo Lembrete" para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeReminders.map(reminder => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggleComplete}
              formatDateTime={formatDateTime}
            />
          ))}
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <>
          <Separator className="bg-spiritual-border/30" />
          <div>
            <h3 className="text-sm font-medium text-spiritual-text/60 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Concluídos ({completedReminders.length})
            </h3>
            <div className="space-y-3 opacity-60">
              {completedReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggleComplete}
                  formatDateTime={formatDateTime}
                  variant="completed"
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-spiritual-deep rounded-xl border border-spiritual-border/50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-spiritual-gold">
                {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-spiritual-text/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Meditação matinal"
                  className="mt-1.5 bg-white/5 border-spiritual-border/50"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Adicione detalhes..."
                  className="mt-1.5 bg-white/5 border-spiritual-border/50"
                  rows={3}
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Object.keys(REMINDER_TYPE_LABELS) as ReminderType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData(f => ({ ...f, type }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        formData.type === type
                          ? 'bg-indigo-500/30 border-indigo-500 text-indigo-300'
                          : 'bg-white/5 border-spiritual-border/50 text-spiritual-text/60 hover:border-spiritual-border'
                      }`}
                    >
                      {REMINDER_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="datetime">Data e Hora</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spiritual-text/40" />
                  <input
                    id="datetime"
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={e => setFormData(f => ({ ...f, datetime: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-spiritual-border/50 rounded-lg text-spiritual-text outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <Label>Recorrência</Label>
                <div className="flex gap-2 mt-2">
                  {(['none', 'daily', 'weekly', 'monthly'] as const).map(recurring => (
                    <button
                      key={recurring}
                      onClick={() => setFormData(f => ({ ...f, recurring }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all flex items-center gap-1.5 ${
                        formData.recurring === recurring
                          ? 'bg-indigo-500/30 border-indigo-500 text-indigo-300'
                          : 'bg-white/5 border-spiritual-border/50 text-spiritual-text/60 hover:border-spiritual-border'
                      }`}
                    >
                      {recurring === 'none' && <X className="w-3 h-3" />}
                      {recurring === 'daily' && <Clock className="w-3 h-3" />}
                      {recurring === 'weekly' && <Repeat className="w-3 h-3" />}
                      {recurring === 'monthly' && <Calendar className="w-3 h-3" />}
                      {recurring === 'none' ? 'Uma vez' : recurring === 'daily' ? 'Diário' : recurring === 'weekly' ? 'Semanal' : 'Mensal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <SpiritualButton onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Cancelar
              </SpiritualButton>
              <SpiritualButton
                onClick={handleSave}
                variant="default"
                className="flex-1"
                disabled={!formData.title.trim() || !formData.datetime}
              >
                Salvar
              </SpiritualButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  formatDateTime: (dt: string) => string;
  variant?: 'default' | 'completed';
}

function ReminderCard({ reminder, onEdit, onDelete, onToggle, formatDateTime, variant = 'default' }: ReminderCardProps) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      reminder.completed
        ? 'bg-white/5 border-spiritual-border/30'
        : 'bg-white/10 border-spiritual-border/50 hover:border-spiritual-border'
    }`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(reminder.id)}
          className={`mt-1 flex-shrink-0 transition-colors ${
            reminder.completed ? 'text-emerald-400' : 'text-spiritual-text/40 hover:text-indigo-400'
          }`}
        >
          {reminder.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${reminder.completed ? 'line-through text-spiritual-text/50' : 'text-spiritual-text'}`}>
              {reminder.title}
            </h4>
            <Badge
              variant="outline"
              className={`text-xs ${REMINDER_TYPE_COLORS[reminder.type]} border-current`}
            >
              {REMINDER_TYPE_LABELS[reminder.type]}
            </Badge>
          </div>

          {reminder.description && (
            <p className={`text-sm mb-2 ${reminder.completed ? 'text-spiritual-text/40' : 'text-spiritual-text/60'}`}>
              {reminder.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-spiritual-text/40">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(reminder.datetime)}
            </span>
            {reminder.recurring !== 'none' && (
              <span className="flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {reminder.recurring === 'daily' ? 'Diário' : reminder.recurring === 'weekly' ? 'Semanal' : 'Mensal'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(reminder)}
            className="p-2 rounded-lg text-spiritual-text/40 hover:text-indigo-400 hover:bg-white/10 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-2 rounded-lg text-spiritual-text/40 hover:text-rose-400 hover:bg-white/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReminderManager;