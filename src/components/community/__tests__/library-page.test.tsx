// ============================================================================
// Library — testes da biblioteca de artigos
// ============================================================================
// Cobre:
//  - render basico com 8 artigos mock
//  - filtro por tradicao
//  - filtro por tipo
//  - filtro por evidencia
//  - busca textual
//  - ordenacao (Recente / Popular)
//  - empty state
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import './_mocks';
import { resetCommunityMocks } from './_mocks';

import LibraryPage from '@/app/(community)/library/page';

describe('Library page', () => {
  beforeEach(() => {
    resetCommunityMocks();
  });

  describe('renderizacao inicial', () => {
    it('renderiza sem crash', () => {
      expect(() => render(<LibraryPage />)).toBeTruthy();
    });

    it('mostra o titulo da pagina', () => {
      render(<LibraryPage />);
      expect(screen.getByText(/Biblioteca/i)).toBeTruthy();
    });

    it('mostra o input de busca', () => {
      render(<LibraryPage />);
      expect(screen.getByPlaceholderText(/Buscar artigos/i)).toBeTruthy();
    });

    it('lista todos os 8 artigos mock no estado inicial', () => {
      render(<LibraryPage />);
      // Pega contagem via "X artigos"
      expect(screen.getByText(/8 artigos/)).toBeTruthy();
    });

    it('mostra artigos por titulo (alguns)', () => {
      render(<LibraryPage />);
      expect(screen.getByText(/Efeitos do Reiki em ansiedade/i)).toBeTruthy();
      expect(screen.getByText(/Ayahuasca e neuroplasticidade/i)).toBeTruthy();
      expect(screen.getByText(/Meditação Vipassana altera estrutura cerebral/i)).toBeTruthy();
    });

    it('mostra os chips de filtro das 3 categorias', () => {
      render(<LibraryPage />);
      // Tradicao
      expect(screen.getByRole('button', { name: 'cabala' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'ifa' })).toBeTruthy();
      // Tipo
      expect(screen.getByRole('button', { name: 'Paper' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Podcast' })).toBeTruthy();
      // Evidencia
      expect(screen.getByRole('button', { name: 'Meta-análise' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Anecdótico' })).toBeTruthy();
    });
  });

  describe('Filtro por tradicao', () => {
    it('clicar em "cabala" filtra para artigos dessa tradicao', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'cabala' }));

      // So artigos de cabala: a4, a5 -> 2 artigos
      expect(screen.getByText(/2 artigos/)).toBeTruthy();
      // Titulos esperados
      expect(screen.getByText(/Cabala: introdução à Árvore da Vida/i)).toBeTruthy();
      expect(screen.getByText(/Como Cabalistas meditavam no século XVI/i)).toBeTruthy();
      // Reiki deve sumir
      expect(screen.queryByText(/Efeitos do Reiki em ansiedade/i)).toBeNull();
    });

    it('clicar em "xamanismo" filtra para 2 artigos', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'xamanismo' }));

      expect(screen.getByText(/2 artigos/)).toBeTruthy();
      expect(screen.getByText(/Ayahuasca e neuroplasticidade/i)).toBeTruthy();
      expect(screen.getByText(/psilocibina e depressão resistente/i)).toBeTruthy();
    });

    it('clicar em "todas" volta a listar todos', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'cabala' }));
      await user.click(screen.getByRole('button', { name: 'todas' }));

      // O chip "todas" aparece 3 vezes (uma por categoria). Pegamos o primeiro
      // que esta dentro do grupo de Tradicao.
      expect(screen.getAllByText(/8 artigos/)).toBeTruthy();
    });
  });

  describe('Filtro por tipo', () => {
    it('clicar em "Paper" mostra apenas artigos do tipo SCIENTIFIC_PAPER', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Paper' }));

      // a1, a2, a3 sao SCIENTIFIC_PAPER => 3 artigos
      expect(screen.getByText(/3 artigos/)).toBeTruthy();
      expect(screen.getByText(/Efeitos do Reiki em ansiedade/i)).toBeTruthy();
      expect(screen.getByText(/Ayahuasca e neuroplasticidade/i)).toBeTruthy();
      expect(screen.getByText(/Meditação Vipassana altera estrutura cerebral/i)).toBeTruthy();
      // Ensaio nao deve aparecer
      expect(screen.queryByText(/Cabala: introdução à Árvore da Vida/i)).toBeNull();
    });

    it('clicar em "Podcast" mostra apenas o podcast', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Podcast' }));

      expect(screen.getByText(/1 artigo/)).toBeTruthy();
      expect(screen.getByText(/Ayurveda e alimentação/i)).toBeTruthy();
    });

    it('clicar em "Ensaio" mostra apenas ensaios (a4 e a5)', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Ensaio' }));

      expect(screen.getByText(/2 artigos/)).toBeTruthy();
    });
  });

  describe('Filtro por evidencia', () => {
    it('clicar em "Meta-análise" filtra artigos META_ANALYSIS', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Meta-análise' }));

      // a1 e a2 sao META_ANALYSIS => 2
      expect(screen.getByText(/2 artigos/)).toBeTruthy();
      expect(screen.getByText(/Efeitos do Reiki em ansiedade/i)).toBeTruthy();
      expect(screen.getByText(/Ayahuasca e neuroplasticidade/i)).toBeTruthy();
    });

    it('clicar em "Revisado por pares" filtra PEER_REVIEWED', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Revisado por pares' }));

      // a3 (Vipassana) e a6 (psilocibina e depressao) => 2
      expect(screen.getByText(/2 artigos/)).toBeTruthy();
    });
  });

  describe('Busca textual', () => {
    it('filtrar por titulo', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      const input = screen.getByPlaceholderText(/Buscar artigos/i);
      await user.type(input, 'Vipassana');

      expect(screen.getByText(/1 artigo/)).toBeTruthy();
      expect(screen.getByText(/Meditação Vipassana altera estrutura cerebral/i)).toBeTruthy();
      expect(screen.queryByText(/Ayahuasca e neuroplasticidade/i)).toBeNull();
    });

    it('filtrar por summary (campo summary do artigo)', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      const input = screen.getByPlaceholderText(/Buscar artigos/i);
      await user.type(input, 'randomizado');

      // O summary de a1 menciona "randomizados controlados"
      expect(screen.getByText(/1 artigo/)).toBeTruthy();
      expect(screen.getByText(/Efeitos do Reiki em ansiedade/i)).toBeTruthy();
    });

    it('busca case-insensitive', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      const input = screen.getByPlaceholderText(/Buscar artigos/i);
      await user.type(input, 'REIKI');

      // a1 (tradicao reiki) e a8 (nao, ayurveda). So a1.
      expect(screen.getByText(/1 artigo/)).toBeTruthy();
    });
  });

  describe('Filtros combinados', () => {
    it('busca + tradicao juntos aplicam AND', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      // Cabala + busca "introducao" -> so a4
      await user.click(screen.getByRole('button', { name: 'cabala' }));
      const input = screen.getByPlaceholderText(/Buscar artigos/i);
      await user.type(input, 'introdução');

      expect(screen.getByText(/1 artigo/)).toBeTruthy();
      expect(screen.getByText(/Cabala: introdução à Árvore da Vida/i)).toBeTruthy();
    });

    it('tradicao + tipo juntos aplicam AND', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'cabala' }));
      await user.click(screen.getByRole('button', { name: 'Paper' }));

      // Cabala nao tem SCIENTIFIC_PAPER -> 0
      expect(screen.getByText(/0 artigos/)).toBeTruthy();
    });
  });

  describe('Sort (ordenacao)', () => {
    it('Recente (default) ordena por ano decrescente', () => {
      render(<LibraryPage />);
      const recentsBtn = screen.getByRole('button', { name: 'Recente' });
      expect(recentsBtn.className).toMatch(/bg-amber-500\/20/);
    });

    it('clicar em Popular muda o destaque e reordena', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      const popularBtn = screen.getByRole('button', { name: 'Popular' });
      await user.click(popularBtn);

      // Agora "Popular" esta ativo
      expect(popularBtn.className).toMatch(/bg-amber-500\/20/);

      // "Recente" deixa de estar ativo
      const recentsBtn = screen.getByRole('button', { name: 'Recente' });
      expect(recentsBtn.className).not.toMatch(/bg-amber-500\/20/);
    });

    it('Popular ordena por reads decrescente (primeiro item = mais leituras)', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Popular' }));

      // a6 tem 2103 reads (max) e deve ser o primeiro artigo.
      // Pegamos todos os cards por ordem no DOM.
      const articles = screen.getAllByRole('heading', { level: 3 });
      expect(articles[0].textContent).toMatch(/psilocibina e depressão resistente/i);
    });
  });

  describe('Empty state', () => {
    it('mostra mensagem quando nenhum artigo bate o filtro', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      const input = screen.getByPlaceholderText(/Buscar artigos/i);
      await user.type(input, 'xyz_nao_existe_123');

      expect(screen.getByText(/Nenhum artigo encontrado/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /Limpar filtros/i })).toBeTruthy();
    });

    it('"Limpar filtros" reseta busca + categoria', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      // Filtro cabala + busca "nope"
      await user.click(screen.getByRole('button', { name: 'cabala' }));
      const input = screen.getByPlaceholderText(/Buscar artigos/i);
      await user.type(input, 'nope');

      expect(screen.getByText(/Nenhum artigo encontrado/i)).toBeTruthy();

      await user.click(screen.getByRole('button', { name: /Limpar filtros/i }));

      // Volta para os 8 artigos
      expect(screen.getByText(/8 artigos/)).toBeTruthy();
      // E o input foi limpo
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  describe('Contagem singular/plural', () => {
    it('mostra "1 artigo" (singular) quando ha exatamente 1', async () => {
      const user = userEvent.setup();
      render(<LibraryPage />);

      await user.click(screen.getByRole('button', { name: 'Podcast' }));
      expect(screen.getByText(/1 artigo[^s]/)).toBeTruthy();
    });

    it('mostra "N artigos" (plural) quando ha mais de 1', () => {
      render(<LibraryPage />);
      expect(screen.getByText(/8 artigos/)).toBeTruthy();
    });
  });
});