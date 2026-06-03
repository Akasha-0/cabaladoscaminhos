'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Calendar, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClientSearchResult {
  id: string;
  nome: string;
  dataNascimento: string;
  horaNascimento?: string;
  localNascimento?: string;
  mapa?: {
    sol?: string;
    ascendente?: string;
    caminho?: string;
    missao?: string;
    alma?: string;
    karma?: string;
    oduNatal?: string;
  };
}

interface ClientSearchComboboxProps {
  onSelectClient: (client: ClientSearchResult) => void;
  onCreateNew: () => void;
}

export function ClientSearchCombobox({ onSelectClient, onCreateNew }: ClientSearchComboboxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/mesa-real/clients?search=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.clients || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('[ClientSearch] Search failed:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectClient(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleSelectClient = (client: ClientSearchResult) => {
    onSelectClient(client);
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative space-y-2">
      {/* Search Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Search className="w-3 h-3" />
          Buscar Cliente Existente
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
        <Input
          ref={inputRef}
          placeholder="Digite o nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && results.length > 0 && setIsOpen(true)}
          className="pl-9 pr-9 bg-muted/50 border-border/50 focus:border-primary/50"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl shadow-black/30 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Nenhum cliente encontrado</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="w-full"
              >
                <User className="w-3 h-3 mr-2" />
                Cadastrar novo cliente
              </Button>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto py-1">
              {results.map((client, index) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className={cn(
                    'w-full px-3 py-2 text-left flex items-start gap-3 transition-colors',
                    index === selectedIndex
                      ? 'bg-primary/20 text-foreground'
                      : 'hover:bg-muted/50 text-foreground'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client.nome}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(client.dataNascimento)}
                      {client.localNascimento && ` · ${client.localNascimento}`}
                    </p>
                    {client.mapa?.sol && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] px-1.5 py-0 bg-secondary/10 border-secondary/30"
                      >
                        {client.mapa.sol}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
                </button>
              ))}
              <div className="border-t border-border/50 mt-1 pt-2 px-3 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    onCreateNew();
                  }}
                  className="w-full text-xs"
                >
                  <User className="w-3 h-3 mr-2" />
                  Cadastrar novo cliente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
