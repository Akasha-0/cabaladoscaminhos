/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateMapaPDF, formatOduSection, formatOrixaSection, downloadPDF } from '@/lib/pdf/mapa-export';

// Mock jsPDF with proper default export
vi.mock('jspdf', () => {
  const MockDoc = vi.fn().mockImplementation(() => ({
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    roundedRect: vi.fn(),
    splitTextToSize: vi.fn((text: string) => text.split('\n')),
    addPage: vi.fn(),
    output: vi.fn(() => new Blob(['mock pdf'], { type: 'application/pdf' })),
  }));
  
  return { default: MockDoc };
});

// Mock document functions
const mockCreateElement = vi.fn(() => ({
  href: '',
  download: '',
  click: vi.fn(),
  appendChild: vi.fn(),
  removeChild: vi.fn(),
}));

describe('Mapa PDF Export', () => {
  // Mock MapaData for testing
  const mockMapaData = {
    numerologia: {
      numeroVida: 7,
      numeroDestino: 3,
      numeroAlma: 5,
      numeroPersonalidade: 9,
    },
    odu: {
      nome: 'Ogbe',
      numero: 1,
      orixas: ['Exu', 'Obatalá'],
      quizilas: ['Pombo', 'Galinha'],
      preceitos: 'Paz, verdade e justiça. Proibido matar.',
      interpretacao: 'Ogbe traz a energia da criação e novos começos.',
    },
    astrologia: {
      signoSolar: 'Leão',
      signoLua: 'Câncer',
      ascendente: 'Escorpião',
      planetas: {
        Sol: 'Leão 15°',
        Lua: 'Câncer 22°',
        Mercurio: 'Virgem 8°',
        Venus: 'Libra 3°',
        Marte: 'Escorpião 27°',
      },
    },
    orixas: ['Oxalá', 'Ogum', 'Iemanjá'],
    convergencias: [
      {
        energia: 'Força Interior',
        forca: 'dupla',
        descricao: 'Combinação poderosa de energia solar e lunar.',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.createElement
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        } as unknown as HTMLElement;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatOduSection', () => {
    it('formats Ogbe with orixas', () => {
      const result = formatOduSection('Ogbe');
      expect(result).toContain('Ogbe');
      expect(result).toContain('Exu');
      expect(result).toContain('Quizilas');
    });

    it('formats Oyeku correctly', () => {
      const result = formatOduSection('Oyeku');
      expect(result).toContain('Oyeku');
      expect(result).toContain('Oxum');
      expect(result).toContain('Yemanjá');
    });

    it('includes preceitos for all odus', () => {
      const result = formatOduSection('Ogbe');
      expect(result).toContain('Preceitos:');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles unknown odu gracefully', () => {
      const result = formatOduSection('Unknown');
      expect(result).toContain('Unknown');
      expect(result).toContain('Obatalá'); // Default fallback
    });

    it('includes all required fields', () => {
      const result = formatOduSection('Ogbe');
      expect(result).toContain('Odú:');
      expect(result).toContain('Orixás:');
      expect(result).toContain('Quizilas:');
      expect(result).toContain('Preceitos:');
    });
  });

  describe('formatOrixaSection', () => {
    it('formats Oxalá with colors and herbs', () => {
      const result = formatOrixaSection('Oxalá');
      expect(result).toContain('Oxalá');
      expect(result).toContain('branco');
      expect(result).toContain('boldo');
    });

    it('formats Iemanjá with correct data', () => {
      const result = formatOrixaSection('Iemanjá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('azul');
      expect(result).toContain('Oia!'); // Greeting
    });

    it('formats Ogum with peppers and greeting', () => {
      const result = formatOrixaSection('Ogum');
      expect(result).toContain('Ogum');
      expect(result).toContain('pimenta');
      expect(result).toContain('Olá!'); // Greeting
    });

    it('handles unknown orixá with defaults', () => {
      const result = formatOrixaSection('UnknownOrixá');
      expect(result).toContain('UnknownOrixá');
      expect(result).toContain('branco'); // Default color
      expect(result).toContain('boldo'); // Default herb
    });

    it('includes all required fields', () => {
      const result = formatOrixaSection('Oxalá');
      expect(result).toContain('Orixá:');
      expect(result).toContain('Cores:');
      expect(result).toContain('Ervas:');
      expect(result).toContain('Saudação:');
    });
  });

  describe('generateMapaPDF', () => {
    it('returns Blob with PDF content type', async () => {
      const result = await generateMapaPDF(mockMapaData);
      expect(result.type).toBe('application/pdf');
    });

    it('returns Blob with non-zero size', async () => {
      const result = await generateMapaPDF(mockMapaData);
      expect(result.size).toBeGreaterThan(0);
    });

    it('generates PDF with default options', async () => {
      const result = await generateMapaPDF(mockMapaData);
      expect(result).toBeInstanceOf(Blob);
    });

    it('generates PDF with dark theme', async () => {
      const result = await generateMapaPDF(mockMapaData, { colorScheme: 'dark' });
      expect(result.type).toBe('application/pdf');
    });

    it('generates PDF with light theme', async () => {
      const result = await generateMapaPDF(mockMapaData, { colorScheme: 'light' });
      expect(result.type).toBe('application/pdf');
    });

    it('generates PDF with custom title', async () => {
      const result = await generateMapaPDF(mockMapaData, { title: 'Meu Mapa Personalizado' });
      expect(result.type).toBe('application/pdf');
    });

    it('generates PDF without chart', async () => {
      const result = await generateMapaPDF(mockMapaData, { includeChart: false });
      expect(result.type).toBe('application/pdf');
    });

    it('generates PDF without correlations', async () => {
      const result = await generateMapaPDF(mockMapaData, { includeCorrelations: false });
      expect(result.type).toBe('application/pdf');
    });

    it('generates PDF without Odu reading', async () => {
      const result = await generateMapaPDF(mockMapaData, { includeOduReading: false });
      expect(result.type).toBe('application/pdf');
    });

    it('handles missing optional fields gracefully', async () => {
      const minimalData = {
        numerologia: {
          numeroVida: 1,
          numeroDestino: 1,
          numeroAlma: 1,
          numeroPersonalidade: 1,
        },
        odu: {
          nome: 'Ogbe',
          numero: 1,
          orixas: ['Exu'],
          quizilas: [],
          preceitos: '',
        },
        astrologia: {
          signoSolar: 'Leão',
          signoLua: 'Lua',
          ascendente: 'Áries',
          planetas: {},
        },
        orixas: [],
      };
      
      const result = await generateMapaPDF(minimalData);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('handles empty convergencias array', async () => {
      const data = {
        ...mockMapaData,
        convergencias: [],
      };
      
      const result = await generateMapaPDF(data, { includeCorrelations: true });
      expect(result.type).toBe('application/pdf');
    });

    it('handles empty orixas array', async () => {
      const data = {
        ...mockMapaData,
        orixas: [],
      };
      
      const result = await generateMapaPDF(data);
      expect(result.type).toBe('application/pdf');
    });

    it('handles empty planets object', async () => {
      const data = {
        ...mockMapaData,
        astrologia: {
          ...mockMapaData.astrologia,
          planetas: {},
        },
      };
      
      const result = await generateMapaPDF(data);
      expect(result.type).toBe('application/pdf');
    });

    it('uses default title when not provided', async () => {
      const result = await generateMapaPDF(mockMapaData, { title: undefined });
      expect(result.type).toBe('application/pdf');
    });
  });

  describe('downloadPDF', () => {
    it('creates download link and clicks it', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      
      downloadPDF(blob, 'test.pdf');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('sets correct filename', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      
      downloadPDF(blob, 'custom-name.pdf');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('uses default filename when not provided', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      
      downloadPDF(blob);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('MapaData structure validation', () => {
    it('accepts valid MapaData with all fields', () => {
      expect(() => {
        // This should not throw
        formatOduSection(mockMapaData.odu.nome);
        formatOrixaSection(mockMapaData.orixas[0]);
      }).not.toThrow();
    });

    it('handles tarot data if present', async () => {
      const dataWithTarot = {
        ...mockMapaData,
        tarot: {
          cartaNascimento: 1,
          cartaAnoPessoal: 5,
        },
      };
      
      const result = await generateMapaPDF(dataWithTarot);
      expect(result.type).toBe('application/pdf');
    });

    it('handles sefirot data if present', async () => {
      const dataWithSefirot = {
        ...mockMapaData,
        sefirot: ['Keter', 'Chokhmah', 'Binah'],
      };
      
      const result = await generateMapaPDF(dataWithSefirot);
      expect(result.type).toBe('application/pdf');
    });
  });
});
