'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CityResult {
  name: string;
  displayName: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (city: CityResult) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Ex: São Paulo',
  className,
  error,
  disabled = false,
}: CityAutocompleteProps) {
  const [results, setResults] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim() || value.length < 3) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Use OpenStreetMap Nominatim — free, no API key required
        // Restricted to Brazil for this app
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&countrycodes=br&format=json&addressdetails=1&limit=8`,
          {
            headers: {
              'Accept-Language': 'pt-BR, pt',
              'User-Agent': 'CabalaDosCaminhos/1.0',
            },
          }
        );
        if (!res.ok) throw new Error('City search failed');
        const data: Array<{
          display_name: string;
          address?: {
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            country?: string;
            'ISO3166-2'?: string;
          };
          lat: string;
          lon: string;
        }> = await res.json();

        const cities: CityResult[] = data.map((item) => {
          const addr = item.address ?? {};
          const name =
            addr.city ?? addr.town ?? addr.village ?? item.display_name.split(',')[0];
          // Extract state abbreviation from ISO3166-2 (e.g. "BR-SP" -> "SP") or use full state name
          const stateRaw = item['display_name']
            ?.split(',')
            .find((part) => {
              const s = part.trim();
              // Brazilian state abbreviations are 2 uppercase letters
              return /^[A-Z]{2}$/.test(s) || /^[A-Z][a-záéíóúàèìòùãõñâêîôû]+(\s+[A-Z][a-záéíóúàèìòùãõñâêîôû]+)*$/.test(s.trim());
            });

          // Extract state from display_name (usually the second-to-last segment for BR)
          const parts = item.display_name.split(',').map((p) => p.trim());
          let state = addr.state ?? '';
          // Try to extract 2-letter abbreviation from the parts
          if (!state) {
            const found = parts.find((p) => /^[A-Z]{2}$/.test(p.trim()));
            if (found) state = found.trim();
          }

          return {
            name,
            displayName: item.display_name,
            state,
            country: addr.country ?? 'Brasil',
            latitude: item.lat,
            longitude: item.lon,
          };
        });

        setResults(cities);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          handleSelectCity(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setResults([]);
        break;
    }
  };

  const handleSelectCity = (city: CityResult) => {
    onChange(city.name);
    onSelect(city);
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(-1);
  };

  const getCityLabel = (city: CityResult) => {
    const parts = [city.name];
    if (city.state) parts.push(city.state);
    if (city.country) parts.push(city.country);
    return parts.join(', ');
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          id="birthCity"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-invalid={!!error}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          className="bg-muted/50 border-border/50 focus:border-primary/50 pr-8"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border/50 rounded-lg shadow-md overflow-auto max-h-64"
          role="listbox"
        >
          {results.map((city, index) => (
            <button
              key={`${city.name}-${city.state}-${index}`}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors',
                index === selectedIndex && 'bg-accent/50'
              )}
              onClick={() => handleSelectCity(city)}
            >
              <span className="font-medium text-foreground">{city.name}</span>
              {city.state && (
                <span className="ml-2 text-muted-foreground">{city.state}</span>
              )}
              {city.country && (
                <span className="ml-1 text-muted-foreground/60">{city.country}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !isLoading && value.length >= 3 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border/50 rounded-lg shadow-md px-3 py-2 text-sm text-muted-foreground"
        >
          Nenhuma cidade encontrada
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
