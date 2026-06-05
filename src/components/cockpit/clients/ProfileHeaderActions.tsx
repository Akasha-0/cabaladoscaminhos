// src/components/cockpit/clients/ProfileHeaderActions.tsx
'use client';

import { Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderActionsProps {
  clientId: string;
  clientName: string;
}

export function ProfileHeaderActions({ clientId, clientName }: ProfileHeaderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    const ok = window.confirm(
      `Deseja mesmo excluir o consulente "${clientName}"?\n\nEsta ação é irreversível e removerá permanentemente o consulente, todas as suas leituras de Mesa Real e históricos de consultas.`
    );
    if (!ok) return;

    setIsDeleting(true);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/mesa-real/clients?clientId=${clientId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/cockpit/consulentes');
          router.refresh();
        } else {
          const err = await res.json();
          alert('Erro ao excluir consulente: ' + (err.error || 'Erro desconhecido'));
          setIsDeleting(false);
        }
      } catch (err) {
        console.error('[ProfileHeaderActions] Failed to delete:', err);
        alert('Erro de rede ao excluir consulente');
        setIsDeleting(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Link href={`/cockpit/consulentes/${clientId}/editar`}>
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <Edit className="w-3.5 h-3.5 mr-2" />
          Editar
        </Button>
      </Link>
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting || isPending}
        onClick={handleDelete}
        className="bg-destructive/10 hover:bg-destructive/25 text-destructive border border-destructive/20"
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5 mr-2" />
        )}
        {isDeleting ? 'Excluindo…' : 'Excluir'}
      </Button>
    </div>
  );
}
