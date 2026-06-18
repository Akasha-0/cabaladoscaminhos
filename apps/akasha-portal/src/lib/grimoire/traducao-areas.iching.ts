/**
 * Pilar 5 · I Ching · Tradução por Área (F-229 §5)
 * Pure data — zero business logic.
 */
import type { Pilar } from './significados-curados';
import type { TraducaoArea } from './traducao-areas';

export const ICHING: TraducaoArea[] = [
  {
    pilar: 'iching',
    area: 'paz',
    frase:
      'O hexagrama de hoje diz em qual ESTADO você está. Paz não é ausência de conflito — é saber em qual fase você está. Olhe o hexagrama, leia a mensagem, ajuste a postura.',
    fonte: 'Wilhelm/Baynes 1950, I Ching: O Livro das Mutações',
  },
  {
    pilar: 'iching',
    area: 'saude',
    frase:
      'O corpo muda a cada dia; o I Ching é o espelho. Hexagrama do dia te diz se HOJE é dia de movimento (Trovão 51) ou repouso (Montanha 52). Não force a fase errada.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'relacoes',
    frase:
      'Cada hexagrama mostra o tom da relação HOJE. Hexagrama 31 (Influência) aproxima; 44 (Encontrar) alerta; 8 (Solidão) pede individuação. Não force intimidade quando o I Ching pede espaço.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'dinheiro',
    frase:
      'Hexagrama 11 (Paz) = abundância; 12 (Estagnamento) = espera; 42 (Aumento) = expansão. Use o hexagrama do dia para calibrar: HOJE, dinheiro pede expandir ou contrair?',
    fonte: 'Wilhelm/Baynes 1950; King Wen sequence',
  },
  {
    pilar: 'iching',
    area: 'trabalho',
    frase:
      'O hexagrama do dia é seu briefing. 51 (Trovão) pede início; 15 (Modéstia) pede contenção; 49 (Revolução) pede mudança radical. Antes de agir, leia o hexagrama — ele antecipa a fase.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'proposito',
    frase:
      'Seu hexagrama NATAL é o tema da vida inteira. O do DIA é o microcosmos. O do MOMENTO (mutação por linha) é a hora. Jogue o I Ching hoje, antes de decidir o grande. O livro fala com quem escuta.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'criatividade',
    frase:
      'O I Ching é criativo POR NATUREZA — cada hexagrama é uma possibilidade. Crie a partir do hexagrama de hoje: ele indica o tom. 35 (Progresso) = expor; 50 (Cachimbo) = nutrir; 58 (Alegre) = compartilhar.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'espiritualidade',
    frase:
      'A meditação sobre 1 hexagrama HOJE = prática espiritual completa. Escolha o do dia, leia o nome + essência, sente 10 min com a imagem. O I Ching é livro vivo: muda com você.',
    fonte: 'Wilhelm/Baynes 1950; tradição confuciana + taoísta',
  },
];
