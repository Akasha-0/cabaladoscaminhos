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
    userId: 'system', // TODO: get from auth
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
        <Label htmlFor="fullName">Nome Completo *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          placeholder="Nome conforme certidão de nascimento"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Data de Nascimento *</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthTime">Hora do Nascimento</Label>
          <Input
            id="birthTime"
            type="time"
            value={formData.birthTime}
            onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
            placeholder="HH:MM"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthCity">Cidade de Nascimento</Label>
          <Input
            id="birthCity"
            value={formData.birthCity}
            onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
            placeholder="Cidade/Estado"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Criar Cliente'}
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
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{client.fullName}</CardTitle>
        <CardDescription>
          Nascido em {birthDate}
          {client.birthCity && ` - ${client.birthCity}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onSelect}>
          Selecionar
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
          Excluir
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
    // TODO: Navigate to mesa-real page with clientId
    window.location.href = `/dashboard/mesa-real?clientId=${client.id}`;
  };

  // Filter clients by search
  const filteredClients = clients.filter((c) =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Consulentes</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>Novo Consulente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Consulente</DialogTitle>
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
      <div className="mb-6">
        <Input
          placeholder="Buscar consulente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando consulentes...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Nenhum consulente encontrado'
              : 'Nenhum consulente cadastrado'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setDialogOpen(true)}>
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
  );
}
