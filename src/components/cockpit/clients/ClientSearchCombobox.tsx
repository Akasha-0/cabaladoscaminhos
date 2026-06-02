// fallow-ignore-file unused-file
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Crown, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClientSearchResult {
  id: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
  birthState?: string;
  astrologyMap?: Record<string, unknown>;
  kabalisticMap?: Record<string, unknown>;
  tantricMap?: Record<string, unknown>;
  oduBirth?: Record<string, unknown>;
}

interface ClienteInfo {
  id?: string;
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
  };
}

interface ClientSearchComboboxProps {
  onSelect: (client: ClienteInfo) => void;
  onNewClient: () => void;
}

// fallow-ignore-next-line complexity
export function ClientSearchCombobox({ onSelect, onNewClient }: ClientSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search clients
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchClients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/mesa-real/clients?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Erro ao buscar clientes');
        const data = await res.json();
        setResults(data.clients || []);
        setIsOpen(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (client: ClientSearchResult) => {
    // Convert API client to ClienteInfo format
    const clienteInfo: ClienteInfo = {
      id: client.id,
      nome: client.fullName,
      dataNascimento: client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : '',
      horaNascimento: client.birthTime || '',
      localNascimento: [client.birthCity, client.birthState].filter(Boolean).join(', '),
      mapa: extractMapa(client),
    };
    onSelect(clienteInfo);
    setQuery('');
    setIsOpen(false);
  };

// fallow-ignore-next-line complexity
  const extractMapa = (client: ClientSearchResult) => {
    const mapa: ClienteInfo['mapa'] = {};

    if (client.astrologyMap) {
      const astro = client.astrologyMap as Record<string, string>;
      mapa.sol = astro.sun || astro.Sun || astro.sol || undefined;
      mapa.ascendente = astro.ascendant || astro.Ascendant || astro.ascendente || undefined;
    }

    if (client.kabalisticMap) {
      const kab = client.kabalisticMap as Record<string, unknown>;
      mapa.caminho = String(kab.caminho || kab.caminhoDaVida || kab.chamadaDaVida || '');
      mapa.missao = String(kab.missao || kab.missaoDaAlma || kab.missaoDaVida || '');
    }

    if (client.tantricMap) {
      const tant = client.tantricMap as Record<string, unknown>;
      mapa.alma = String(tant.alma || tant.numeroDaAlma || '');
      mapa.karma = String(tant.karma || tant.numeroDoKarma || '');
    }

    return Object.keys(mapa).length > 0 ? mapa : undefined;
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar cliente por nome..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden">
          {error && (
            <div className="p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!error && results.length === 0 && query && !isLoading && (
            <div className="p-3 text-sm text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
// fallow-ignore-next-line complexity
               {results.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="w-full px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{client.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR') : ''}
                    </span>
                    {client.birthCity && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.birthCity}
                        </span>
                      </>
                    )}
                  </div>
                  {/* Map badges preview */}
                  {(client.astrologyMap || client.kabalisticMap || client.tantricMap) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.astrologyMap && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-secondary/10 border-secondary/30"
                        >
                          <Crown className="w-2.5 h-2.5 mr-1" />
                          Astro
                        </Badge>
                      )}
                      {client.kabalisticMap && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-secondary/10 border-secondary/30"
                        >
                          <Sparkles className="w-2.5 h-2.5 mr-1" />
                          Cabala
                        </Badge>
                      )}
                      {client.tantricMap && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-primary/10 border-primary/30"
                        >
                          <MapPin className="w-2.5 h-2.5 mr-1" />
                          Tântrica
                        </Badge>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* New Client Button */}
          <div className="p-2 border-t border-border/30 bg-muted/20">
            <button
              onClick={onNewClient}
              className="w-full px-3 py-2 text-sm text-primary hover:bg-muted/50 rounded-lg transition-colors text-left"
            >
              + Cadastrar novo cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
