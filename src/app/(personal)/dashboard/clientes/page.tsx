'use client';

// ============================================================
// CLIENTES PAGE - Cabala Dos Caminhos
// Cockpit Oracular - Client Management
// ============================================================

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Users, Plus, Search, Loader2, UserPlus, Trash2, Play, Calendar } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Client {
  id: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
  createdAt: string;
}

// ============================================================
// API HELPERS
// ============================================================

async function fetchClients(): Promise<Client[]> {
  const res = await fetch('/api/mesa-real/clients');
  const data = await res.json();
  return data.clients || [];
}

async function createClient(data: Partial<Client>): Promise<Client> {
  const res = await fetch('/api/mesa-real/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.client) throw new Error(result.error || 'Erro ao criar cliente');
  return result.client;
}

async function deleteClient(id: string): Promise<void> {
  await fetch(`/api/mesa-real/clients?clientId=${id}`, { method: 'DELETE' });
}

// ============================================================
// NEW CLIENT FORM
// ============================================================

interface NewClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function NewClientForm({ onSuccess, onCancel }: NewClientFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    userId: 'system',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createClient(formData);
      toast({ title: 'Cliente criado com sucesso!' });
      onSuccess();
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-slate-300">Nome Completo *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          placeholder="Nome conforme certidão de nascimento"
          className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-slate-300">Data de Nascimento *</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
          className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthTime" className="text-slate-300">Hora do Nascimento</Label>
          <Input
            id="birthTime"
            type="time"
            value={formData.birthTime}
            onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
            placeholder="HH:MM"
            className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthCity" className="text-slate-300">Cidade de Nascimento</Label>
          <Input
            id="birthCity"
            value={formData.birthCity}
            onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
            placeholder="Cidade/Estado"
            className="bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-400">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Criar Cliente'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================
// CLIENT CARD
// ============================================================

interface ClientCardProps {
  client: Client;
  onDelete: () => void;
  onSelect: () => void;
}

function ClientCard({ client, onDelete, onSelect }: ClientCardProps) {
  const birthDate = new Date(client.birthDate).toLocaleDateString('pt-BR');

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-amber-500/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base text-slate-100 truncate">{client.fullName}</CardTitle>
            <CardDescription className="text-slate-400 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {birthDate}
              {client.birthCity && <span className="ml-1">• {client.birthCity}</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelect}
          className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
        >
          <Play className="w-3 h-3 mr-1" />
          Selecionar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Cliente excluído' });
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir cliente',
        variant: 'destructive',
      });
    }
  };

  const handleSelect = (client: Client) => {
    window.location.href = `/dashboard/mesa-real?clientId=${client.id}`;
  };

  // Filter clients by search
  const filteredClients = clients.filter((c) =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              ✦ Consulentes
            </h1>
            <p className="text-slate-400 text-sm font-raleway mt-1">
              Cadastre e gerencie seus consulentes para a Mesa Real
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0">
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Consulente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-slate-100 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                    Novo Consulente
                  </span>
                </DialogTitle>
              </DialogHeader>
              <NewClientForm
                onSuccess={() => {
                  setDialogOpen(false);
                  loadClients();
                }}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar consulente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
          />
        </div>

        {/* Client List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-slate-400 text-sm">Carregando consulentes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-slate-400 mb-6">
              {searchQuery
                ? 'Nenhum consulente encontrado'
                : 'Nenhum consulente cadastrado'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Consulente
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={() => handleDelete(client.id)}
                onSelect={() => handleSelect(client)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}