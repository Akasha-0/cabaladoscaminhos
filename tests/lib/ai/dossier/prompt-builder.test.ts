/**
 * Mesa Real Dossier Tests
 * @module tests/lib/ai/dossier
 */
import { describe, it, expect } from 'vitest';
import {
  gerarSystemPromptDossier,
  gerarPromptDossiê,
  construirArquiteturaDossiê,
  construirInjeccaoTerreno,
  construirBaseArquitetura,
  encontrarOduCorrelacionado,
  adicionarOduAArquitetura,
  construirSecaoPrompt,
  parsearRespostaDossiê,
} from '@/lib/ai/dossier/prompt-builder';
import type { ArquiteturaDossiê, TiragemMesaReal } from '@/lib/ai/dossier/types';

describe('Dossier Prompt Builder', () => {
  describe('gerarSystemPromptDossier', () => {
    it('should return a non-empty string system prompt', () => {
      const prompt = gerarSystemPromptDossier();
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should contain key instruction elements', () => {
      const prompt = gerarSystemPromptDossier();
      
      // System prompt must mention archetype analysis
      expect(prompt.toLowerCase()).toContain('cruzamento');
      
      // Must mention the three analysis components
      expect(prompt).toContain('Terreno');
      expect(prompt).toContain('Tiragem');
      expect(prompt).toContain('Diretriz');
      
      // Must mention JSON output format
      expect(prompt).toContain('sumario');
      expect(prompt).toContain('secoes');
    });

    it('should mention all spiritual systems', () => {
      const prompt = gerarSystemPromptDossier();
      
      expect(prompt).toContain('Mesa Real');
      expect(prompt).toContain('Odús');
      expect(prompt).toContain('Cabala');
      expect(prompt).toContain('Numerologia');
      expect(prompt).toContain('Tântrica');
    });
  });

  describe('gerarPromptDossiê', () => {
    it('should return a non-empty string user prompt', () => {
      const arquitetura: ArquiteturaDossiê[] = [
        {
          casa_numero: 1,
          casa_nome: 'O Mensageiro',
          casa_significado: 'Início, comunicação',
          carta_numero: 5,
          carta_nome: 'A Árvore',
          carta_significado: 'Crescimento, saúde',
          carta_orientacao: 'normal',
          odu_numero: 1,
          odu_nome: 'Eji-Okunrin',
          odu_significado: 'Dualidade e reflexão',
          odu_conselho: 'Busque o equilíbrio interior',
          odu_orixa: 'Obatalá',
          injeccao_terreno: [
            { tipo: 'ascendente', valor: 'Leão', fonte: 'astrologia' },
            { tipo: 'numero_alma', valor: 7, fonte: 'tantrica' },
          ],
          element: 'Fogo',
          sefirot: ['Kether'],
          chakra: 7,
        },
      ];

      const prompt = gerarPromptDossiê(arquitetura, 'Maria Silva');

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(50);
    });

    it('should include client name in prompt', () => {
      const arquitetura: ArquiteturaDossiê[] = [];
      const clienteNome = 'João dos Santos';

      const prompt = gerarPromptDossiê(arquitetura, clienteNome);

      expect(prompt).toContain(clienteNome);
      expect(prompt).toContain('DOSSIÊ');
    });

    it('should include architecture data when provided', () => {
      const arquitetura: ArquiteturaDossiê[] = [
        {
          casa_numero: 4,
          casa_nome: 'A Casa',
          casa_significado: 'Lar, família, raízes',
          carta_numero: 8,
          carta_nome: 'O Buquê',
          carta_significado: 'Amor, celebração',
          carta_orientacao: 'normal',
          injeccao_terreno: [
            { tipo: 'fundo_ceus', valor: 'Carangueiro', fonte: 'astrologia' },
          ],
          element: 'Terra',
          sefirot: ['Chesed'],
          chakra: 1,
        },
      ];

      const prompt = gerarPromptDossiê(arquitetura, 'Cliente Teste');

      expect(prompt).toContain('A Casa');
      expect(prompt).toContain('4');
      expect(prompt).toContain('Buquê');
      expect(prompt).toContain('Terreno');
      expect(prompt).toContain('Tiragem');
      expect(prompt).toContain('Sephirot');
    });

    it('should handle empty architecture gracefully', () => {
      const arquitetura: ArquiteturaDossiê[] = [];
      const prompt = gerarPromptDossiê(arquitetura, 'Teste');

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      // Should still have header and instructions
      expect(prompt).toContain('DOSSIÊ');
    });
  });

  describe('construirArquiteturaDossiê', () => {
    it('should build architecture from tiragem', () => {
      const tiragem: TiragemMesaReal = {
        formato: '9x4',
        cartas: [
          { posicao: 1, casaNumero: 1, cartaNumero: 14, nomeCarta: 'A Raposa', significado: 'Astúcia', orientacao: 'normal' },
          { posicao: 2, casaNumero: 2, cartaNumero: 5, nomeCarta: 'A Árvore', significado: 'Crescimento', orientacao: 'normal' },
        ],
        odus: [
          { oduNumero: 3, nome: 'Ogbe', significado: 'Início', orixa: 'Obatalá' },
        ],
        timestamp: new Date().toISOString(),
      };

      const arquitetura = construirArquiteturaDossiê(tiragem);

      expect(arquitetura).toHaveLength(2);
      expect(arquitetura[0].casa_numero).toBe(1);
      expect(arquitetura[0].carta_numero).toBe(14);
      expect(arquitetura[0].carta_nome).toBe('A Raposa');
    });

    it('should include terrain injections based on house correlations', () => {
      const tiragem: TiragemMesaReal = {
        formato: '9x4',
        cartas: [
          { posicao: 1, casaNumero: 1, cartaNumero: 1, nomeCarta: 'O Mensageiro', significado: 'Mensagem', orientacao: 'normal' },
        ],
        timestamp: new Date().toISOString(),
      };

      const clientData = {
        ascendente: 'Leão',
        numeroAlma: 7,
      };

      const arquitetura = construirArquiteturaDossiê(tiragem, clientData);

      expect(arquitetura).toHaveLength(1);
      expect(arquitetura[0].injeccao_terreno).toBeDefined();
      expect(arquitetura[0].injeccao_terreno).toHaveLength(2);
      expect(arquitetura[0].injeccao_terreno![0].tipo).toBe('ascendente');
      expect(arquitetura[0].injeccao_terreno![0].valor).toBe('Leão');
    });

    it('should include odu data when available', () => {
      const tiragem: TiragemMesaReal = {
        formato: '9x4',
        cartas: [
          { posicao: 8, casaNumero: 8, cartaNumero: 8, nomeCarta: 'O Buquê', significado: 'Amor', orientacao: 'normal' },
        ],
        odus: [
          { oduNumero: 8, nome: 'Owanrin', significado: 'Invertido', orixa: 'Eshu', conselho: 'Cuidado com ilusões' },
        ],
        timestamp: new Date().toISOString(),
      };

      const arquitetura = construirArquiteturaDossiê(tiragem);

      expect(arquitetura[0].odu_numero).toBe(8);
      expect(arquitetura[0].odu_nome).toBe('Owanrin');
      expect(arquitetura[0].odu_conselho).toBe('Cuidado com ilusões');
    });

    it('should sort by casa number', () => {
      const tiragem: TiragemMesaReal = {
        formato: '9x4',
        cartas: [
          { posicao: 20, casaNumero: 20, cartaNumero: 20, nomeCarta: 'O Caminho', significado: 'Jornada', orientacao: 'normal' },
          { posicao: 5, casaNumero: 5, cartaNumero: 5, nomeCarta: 'A Árvore', significado: 'Crescimento', orientacao: 'normal' },
          { posicao: 12, casaNumero: 12, cartaNumero: 12, nomeCarta: 'Os Pássaros', significado: 'Comunicação', orientacao: 'normal' },
        ],
        timestamp: new Date().toISOString(),
      };

      const arquitetura = construirArquiteturaDossiê(tiragem);

      expect(arquitetura[0].casa_numero).toBe(5);
      expect(arquitetura[1].casa_numero).toBe(12);
      expect(arquitetura[2].casa_numero).toBe(20);
    });
  });

  describe('construirArquiteturaDossiê helpers', () => {
    describe('construirInjeccaoTerreno', () => {
      it('returns empty array when clientData is undefined', () => {
        const result = construirInjeccaoTerreno(5, undefined);
        expect(result).toEqual([]);
      });

      it('returns empty array when no relevant fields present', () => {
        const result = construirInjeccaoTerreno(5, {});
        expect(result).toEqual([]);
      });

      it('injects ascendente and numeroAlma for house 1', () => {
        const clientData = { ascendente: 'Leão', numeroAlma: 7 };
        const result = construirInjeccaoTerreno(1, clientData);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ tipo: 'ascendente', valor: 'Leão', fonte: 'astrologia' });
        expect(result[1]).toEqual({ tipo: 'numero_alma', valor: 7, fonte: 'tantrica' });
      });

      it('injects only ascendente for house 1 when numeroAlma missing', () => {
        const result = construirInjeccaoTerreno(1, { ascendente: 'Virgem' });
        expect(result).toHaveLength(1);
        expect(result[0].tipo).toBe('ascendente');
      });

      it('injects numero_motivacao for house 4', () => {
        const result = construirInjeccaoTerreno(4, { caminhoVida: 5 });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ tipo: 'numero_motivacao', valor: 5, fonte: 'cabala' });
      });

      it('injects dom_divino for house 12', () => {
        const result = construirInjeccaoTerreno(12, { domDivino: 3 });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ tipo: 'dom_divino', valor: 3, fonte: 'tantrica' });
      });

      it('injects numero_karma for house 34', () => {
        const result = construirInjeccaoTerreno(34, { caminhoVida: 11 });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ tipo: 'numero_karma', valor: 11, fonte: 'tantrica' });
      });

      it('defaults to numero_alma from numerologia for other houses', () => {
        const result = construirInjeccaoTerreno(7, { caminhoVida: 9 });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ tipo: 'numero_alma', valor: 9, fonte: 'numerologia' });
      });
    });

    describe('construirBaseArquitetura', () => {
      it('maps all required fields from a carta', () => {
        const carta = {
          posicao: 1,
          casaNumero: 5,
          cartaNumero: 12,
          nomeCarta: 'Os Pássaros',
          significado: 'Comunicação',
          orientacao: 'normal' as const,
        };
        const result = construirBaseArquitetura(carta, []);
        expect(result.casa_numero).toBe(5);
        expect(result.carta_numero).toBe(12);
        expect(result.carta_significado).toBe('Comunicação');
        expect(result.carta_orientacao).toBe('normal');
        expect(result.injeccao_terreno).toBeUndefined();
      });

      it('includes terrain injections when provided', () => {
        const carta = {
          posicao: 1,
          casaNumero: 1,
          cartaNumero: 1,
          nomeCarta: 'O Mensageiro',
          significado: 'msg',
          orientacao: 'normal' as const,
        };
        const injecoes = [{ tipo: 'ascendente' as const, valor: 'Escorpião', fonte: 'astrologia' }];
        const result = construirBaseArquitetura(carta, injecoes);
        expect(result.injeccao_terreno).toEqual(injecoes);
      });

      it('uses fallback names for unknown house/card numbers', () => {
        const carta = {
          posicao: 99,
          casaNumero: 99,
          cartaNumero: 99,
          nomeCarta: '???',
          significado: '???',
          orientacao: 'normal' as const,
        };
        const result = construirBaseArquitetura(carta, []);
        expect(result.casa_nome).toBe('Casa 99');
        expect(result.carta_nome).toBe('Carta 99');
      });
    });

    describe('encontrarOduCorrelacionado', () => {
      const carta = {
        posicao: 4,
        casaNumero: 4,
        cartaNumero: 8,
        nomeCarta: 'O Buquê',
        significado: 'amor',
        orientacao: 'normal' as const,
      };

      it('returns odu matching by posicao', () => {
        const odus = [{ oduNumero: 4, nome: 'Owanrin', significado: 'teste', conselho: 'c', orixa: 'Eshu' }];
        const result = encontrarOduCorrelacionado(carta, odus);
        expect(result?.oduNumero).toBe(4);
      });

      it('returns odu matching by cartaNumero', () => {
        const odus = [{ oduNumero: 8, nome: 'Ogbe', significado: 'teste', conselho: 'c', orixa: 'Obatalá' }];
        const result = encontrarOduCorrelacionado(carta, odus);
        expect(result?.oduNumero).toBe(8);
      });

      it('returns undefined when no match found', () => {
        const odus = [{ oduNumero: 99, nome: 'Other', significado: 'teste', conselho: 'c', orixa: 'X' }];
        const result = encontrarOduCorrelacionado(carta, odus);
        expect(result).toBeUndefined();
      });

      it('returns undefined for empty odu array', () => {
        const result = encontrarOduCorrelacionado(carta, []);
        expect(result).toBeUndefined();
      });

      it('returns undefined when odus is undefined', () => {
        const result = encontrarOduCorrelacionado(carta, undefined as unknown as []);
        expect(result).toBeUndefined();
      });
    });

    describe('adicionarOduAArquitetura', () => {
      it('adds odu fields when odu is provided', () => {
        const base = { casa_numero: 5, casa_nome: 'A Árvore' } as Omit<ArquiteturaDossiê, 'odu_numero' | 'odu_nome' | 'odu_significado' | 'odu_conselho' | 'odu_orixa'>;
        const odu = { oduNumero: 3, nome: 'Otura', significado: 'teste', conselho: 'c', orixa: 'Oxum' };
        const result = adicionarOduAArquitetura(base, odu);
        expect(result.odu_numero).toBe(3);
        expect(result.odu_nome).toBe('Otura');
        expect(result.odu_orixa).toBe('Oxum');
      });

      it('returns base without odu fields when odu is undefined', () => {
        const base = { casa_numero: 5, casa_nome: 'A Árvore' } as Omit<ArquiteturaDossiê, 'odu_numero' | 'odu_nome' | 'odu_significado' | 'odu_conselho' | 'odu_orixa'>;
        const result = adicionarOduAArquitetura(base, undefined);
        expect(result).not.toHaveProperty('odu_numero');
        expect(result.casa_numero).toBe(5);
      });
    });

    describe('construirSecaoPrompt', () => {
      it('includes casa header and significado', () => {
        const casa: ArquiteturaDossiê = {
          casa_numero: 3,
          casa_nome: 'O Navio',
          casa_significado: 'Viagem',
          carta_numero: 3,
          carta_nome: 'O Navio',
          carta_significado: 'Jornada',
          carta_orientacao: 'normal',
          element: 'Água',
          sefirot: ['Binah'],
          chakra: 2,
        };
        const result = construirSecaoPrompt(casa);
        expect(result).toContain('### CASA 3: O Navio');
        expect(result).toContain('**Terreno (Significado da Casa):** Viagem');
        expect(result).toContain('  + Carta: O Navio (3)');
      });

      it('includes odu block when present', () => {
        const casa: ArquiteturaDossiê = {
          casa_numero: 1,
          casa_nome: 'O Mensageiro',
          casa_significado: 'Início',
          carta_numero: 1,
          carta_nome: 'O Mensageiro',
          carta_significado: 'msg',
          carta_orientacao: 'normal',
          odu_numero: 8,
          odu_nome: 'Owanrin',
          odu_significado: 'dualidade',
          odu_conselho: 'busque equilíbrio',
          odu_orixa: 'Obatalá',
        };
        const result = construirSecaoPrompt(casa);
        expect(result).toContain('**Odu:**');
        expect(result).toContain('Owanrin');
        expect(result).toContain('Obatalá');
        expect(result).toContain('busque equilíbrio');
      });

      it('omits odu block when not present', () => {
        const casa: ArquiteturaDossiê = {
          casa_numero: 2,
          casa_nome: 'A Cruz',
          casa_significado: 'Decisão',
          carta_numero: 2,
          carta_nome: 'A Cruz',
          carta_significado: 'escolha',
          carta_orientacao: 'normal',
        };
        const result = construirSecaoPrompt(casa);
        expect(result).not.toContain('**Odu:**');
      });

      it('includes terrain injections when present', () => {
        const casa: ArquiteturaDossiê = {
          casa_numero: 1,
          casa_nome: 'O Mensageiro',
          casa_significado: 'Início',
          carta_numero: 1,
          carta_nome: 'O Mensageiro',
          carta_significado: 'msg',
          carta_orientacao: 'normal',
          injeccao_terreno: [
            { tipo: 'ascendente', valor: 'Leão', fonte: 'astrologia' },
          ],
        };
        const result = construirSecaoPrompt(casa);
        expect(result).toContain('Injeções Espirituais');
        expect(result).toContain('ascendente');
        expect(result).toContain('Leão');
      });

      it('includes correlations when element, sefirot, or chakra present', () => {
        const casa: ArquiteturaDossiê = {
          casa_numero: 1,
          casa_nome: 'O Mensageiro',
          casa_significado: 'Início',
          carta_numero: 1,
          carta_nome: 'O Mensageiro',
          carta_significado: 'msg',
          carta_orientacao: 'normal',
          element: 'Fogo',
          sefirot: ['Kether'],
          chakra: 7,
        };
        const result = construirSecaoPrompt(casa);
        expect(result).toContain('**Correlações:**');
        expect(result).toContain('Elemento: Fogo');
        expect(result).toContain('Sephirot: Kether');
        expect(result).toContain('Chakra: 7');
      });
    });
  });

  describe('ArquiteturaDossiê type validation', () => {
    it('should support terrain injection for house 1', () => {
      const casa1: ArquiteturaDossiê = {
        casa_numero: 1,
        casa_nome: 'O Mensageiro',
        casa_significado: 'Início, comunicação, movimento',
        carta_numero: 1,
        carta_nome: 'O Mensageiro',
        carta_significado: 'Novas mensagens',
        carta_orientacao: 'normal',
        injeccao_terreno: [
          { tipo: 'ascendente', valor: 'Escorpião', fonte: 'astrologia' },
          { tipo: 'numero_alma', valor: 9, fonte: 'tantrica' },
        ],
      };

      expect(casa1.casa_numero).toBe(1);
      expect(casa1.injeccao_terreno).toHaveLength(2);
      expect(casa1.injeccao_terreno![0].tipo).toBe('ascendente');
      expect(casa1.injeccao_terreno![1].tipo).toBe('numero_alma');
    });

    it('should support odu data when available', () => {
      const casaOdu: ArquiteturaDossiê = {
        casa_numero: 12,
        casa_nome: 'Os Pássaros',
        casa_significado: 'Comunicação, pensamentos',
        carta_numero: 12,
        carta_nome: 'Os Pássaros',
        carta_significado: 'Conversas, rumores',
        carta_orientacao: 'invertida',
        odu_numero: 8,
        odu_nome: 'Owanrin',
        odu_significado: 'Invertido, ilusão',
        odu_conselho: 'Cuidado com mal-entendidos',
        odu_orixa: 'Eshu',
        injeccao_terreno: [
          { tipo: 'dom_divino', valor: 15, fonte: 'tantrica' },
        ],
      };

      expect(casaOdu.odu_numero).toBe(8);
      expect(casaOdu.odu_conselho).toBe('Cuidado com mal-entendidos');
      expect(casaOdu.carta_orientacao).toBe('invertida');
    });

    it('should support sefirot and chakra correlations', () => {
      const casaSefirot: ArquiteturaDossiê = {
        casa_numero: 34,
        casa_nome: 'Os Peixes',
        casa_significado: 'Abundância, fluidez',
        carta_numero: 33,
        carta_nome: 'O Peixe',
        carta_significado: 'Prosperidade',
        carta_orientacao: 'normal',
        sefirot: ['Malkuth', 'Yesod'],
        chakra: 1,
        element: 'Água',
        injeccao_terreno: [
          { tipo: 'numero_karma', valor: 22, fonte: 'tantrica' },
        ],
      };

      expect(casaSefirot.sefirot).toHaveLength(2);
      expect(casaSefirot.sefirot).toContain('Malkuth');
      expect(casaSefirot.chakra).toBe(1);
      expect(casaSefirot.element).toBe('Água');
    });
  });

  describe('TiragemMesaReal structure', () => {
    it('should support 9x4 format matrix', () => {
      const tiragem: TiragemMesaReal = {
        formato: '9x4',
        cartas: [
          { posicao: 1, casaNumero: 1, cartaNumero: 14, nomeCarta: 'A Raposa', significado: 'Astúcia', orientacao: 'normal' },
          { posicao: 2, casaNumero: 2, cartaNumero: 5, nomeCarta: 'A Árvore', significado: 'Crescimento', orientacao: 'normal' },
        ],
        odus: [
          { oduNumero: 3, nome: 'Ogbe', significado: 'Início', orixa: 'Obatalá' },
        ],
        timestamp: new Date().toISOString(),
      };

      expect(tiragem.formato).toBe('9x4');
      expect(tiragem.cartas).toHaveLength(2);
      expect(tiragem.odus).toHaveLength(1);
    });

    it('should support 8x4+4 format matrix', () => {
      const tiragem: TiragemMesaReal = {
        formato: '8x4+4',
        cartas: [
          { posicao: 1, casaNumero: 1, cartaNumero: 10, nomeCarta: 'O Machado', significado: 'Decisão', orientacao: 'normal' },
        ],
        timestamp: new Date().toISOString(),
      };

      expect(tiragem.formato).toBe('8x4+4');
    });
  });
});

describe('Dossier Response Parsing', () => {
  describe('parsearRespostaDossiê', () => {
    it('should parse JSON string response', () => {
      const jsonResponse = '{"casa1":{"terreno":"teste","evento":"carta","diretriz":"odu","analise":"analise","orientacao":"orient"}}';
      
      const result = parsearRespostaDossiê(jsonResponse);
      
      expect(result.parsed).toBeDefined();
      expect(result.markdown).toContain('casa1');
    });

    it('should parse object response', () => {
      const objResponse = {
        sumario: 'Teste sumário',
        secoes: [{ casa: 1, titulo: 'Teste', interpretacao: 'Teste' }],
        conselhosGerais: ['Conselho 1'],
      };
      
      const result = parsearRespostaDossiê(objResponse);
      
      expect(result.markdown).toContain('Teste sumário');
    });

    it('should handle plain text response gracefully', () => {
      const textResponse = 'Este é um texto sem formato JSON específico';
      
      const result = parsearRespostaDossiê(textResponse);
      
      expect(result.parsed).toEqual({});
      expect(result.markdown).toBe(textResponse);
    });
  });
});

describe('Dossier Types', () => {
  it('should define HouseAnalysis interface correctly', () => {
    const analysis = {
      casa: 1,
      titulo: 'O Mensageiro',
      interpretacao: 'Nova comunicação se aproxima',
      recomendacao: 'Esteja aberto para mensagens importantes',
      convergencias: ['Ascendente + Carta + Odu'],
    };

    expect(analysis.casa).toBe(1);
    expect(analysis.titulo).toBe('O Mensageiro');
    expect(analysis.convergencias).toHaveLength(1);
  });

  it('should define DossiêResult interface correctly', () => {
    const result = {
      casa1: {
        terreno: 'Ascendente em Leão',
        evento: 'A Raposa inverteu',
        diretriz: 'Ogbe: novos começos',
        analise: 'Confusão mental indicada',
        orientacao: 'Mantenha-se alerta',
      },
      casa2: {
        terreno: 'Casa 2: finanças',
        evento: 'A Árvore estável',
        diretriz: 'Oxum: prosperidade',
        analise: 'Crescimento financeiro favorável',
        orientacao: 'Invista em conhecimento',
      },
    };

    expect(result.casa1.analise).toBe('Confusão mental indicada');
    expect(result.casa2.diretriz).toBe('Oxum: prosperidade');
  });
});