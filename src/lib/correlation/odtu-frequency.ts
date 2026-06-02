/**
 * Odú-Ifá Solfeggio Frequency Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to Solfeggio frequencies
 */

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface OdTuFrequency {
  odu_numero: number;
  odu_nome: string;
  odu_nome_yoruba: string;
  frequencia: number;
  frequencia_alternativa?: number;
  elemento: ElementType;
  significado_healing: string;
  mensagem_central: string;
  cores: string[];
  dias_sagrados: string[];
  aplicacoes_healing: string[];
}

export const SOLFEGGIO_FREQUENCIES: readonly number[] = Object.freeze([174, 285, 396, 417, 528, 639, 741, 852, 963]);

export const ODTU_FREQUENCY_MAPPINGS: Record<number, OdTuFrequency> = {
  1: { odu_numero: 1, odu_nome: 'Okaran', odu_nome_yoruba: 'Okànràn', frequencia: 174, frequencia_alternativa: 963, elemento: 'éter', significado_healing: 'Fundação e estruturação.', mensagem_central: '174 Hz ancora seu espírito.', cores: ['branco', 'ouro'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Ancoramento', 'Fundação espiritual'] },
  2: { odu_numero: 2, odu_nome: 'Ejiokô', odu_nome_yoruba: 'Ejìokò', frequencia: 285, elemento: 'água', significado_healing: 'Nurturing e expansão do campo energético.', mensagem_central: 'A expansão gentil permite que a abundância flua.', cores: ['amarelo', 'dourado'], dias_sagrados: ['Sábado'], aplicacoes_healing: ['Expansão do campo áurico', 'Nurturing energético'] },
  3: { odu_numero: 3, odu_nome: 'Etaogundá', odu_nome_yoruba: 'Ẹtaọgúndá', frequencia: 396, elemento: 'fogo', significado_healing: 'Libertação de traumas e medos fundamentais.', mensagem_central: 'Libertação dos medos ancestrais abre espaço para a verdade.', cores: ['azul', 'branco'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Libertação de medos', 'Transmutação de traumas'] },
  4: { odu_numero: 4, odu_nome: 'Irosun', odu_nome_yoruba: 'Ìrosùn', frequencia: 417, elemento: 'água', significado_healing: 'Facilitação de mudanças.', mensagem_central: 'A transformação está ao seu alcance.', cores: ['amarelo', 'azul celeste'], dias_sagrados: ['Sábado'], aplicacoes_healing: ['Facilitação de mudanças', 'Remoção de obstáculos'] },
  5: { odu_numero: 5, odu_nome: 'Oxé', odu_nome_yoruba: 'Ọ̀sà', frequencia: 528, elemento: 'fogo', significado_healing: 'Frequência dos milagres e reparação do DNA.', mensagem_central: 'O amor é a frequência mais alta.', cores: ['vermelho', 'preto'], dias_sagrados: ['Terça-feira'], aplicacoes_healing: ['Milagres', 'Reparação do DNA', 'Cura do amor'] },
  6: { odu_numero: 6, odu_nome: 'Obará', odu_nome_yoruba: 'Ọbàlúayé', frequencia: 639, elemento: 'terra', significado_healing: 'Harmonização de relacionamentos.', mensagem_central: 'A harmonia se constrói com pacientes ajustes.', cores: ['branco', 'marrom'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Harmonização de relacionamentos', 'Reconciliação'] },
  7: { odu_numero: 7, odu_nome: 'Odi', odu_nome_yoruba: 'Òdí', frequencia: 741, elemento: 'água', significado_healing: 'Despertar da expressão.', mensagem_central: 'Expresse sua verdade com clareza.', cores: ['azul', 'branco'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Despertar da expressão', 'Purificação vocal'] },
  8: { odu_numero: 8, odu_nome: 'Ejionlá', odu_nome_yoruba: 'Ejìọnlá', frequencia: 852, elemento: 'água', significado_healing: 'Despertar da claridade mental e acesso ao terceiro olho.', mensagem_central: 'A sabedoria se revela quando você abre os olhos internos.', cores: ['verde', 'amarelo'], dias_sagrados: ['Sábado'], aplicacoes_healing: ['Despertar do terceiro olho', 'Claridade mental'] },
  9: { odu_numero: 9, odu_nome: 'Oshe', odu_nome_yoruba: 'Ọ̀shẹ́', frequencia: 963, elemento: 'éter', significado_healing: 'Conexão com o divino e iluminação completa.', mensagem_central: 'A iluminação aguarda sua decisão de buscar.', cores: ['azul', 'verde'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Iluminação divina', 'Consciência cósmica'] },
  10: { odu_numero: 10, odu_nome: 'Ofun', odu_nome_yoruba: 'Ọ̀fún', frequencia: 396, elemento: 'éter', significado_healing: 'Sabedoria do silêncio.', mensagem_central: 'O silêncio é a voz mais alta do espírito.', cores: ['branco', 'cinza'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Sabedoria do silêncio', 'Revelação temporal'] },
  11: { odu_numero: 11, odu_nome: 'Eyonla', odu_nome_yoruba: 'Èyọ́nlá', frequencia: 528, elemento: 'terra', significado_healing: 'Sabedoria anciã.', mensagem_central: 'A sabedoria dos anciões se torna acessível.', cores: ['roxo', 'marrom'], dias_sagrados: ['Terça-feira'], aplicacoes_healing: ['Sabedoria anciã', 'Cura ancestral'] },
  12: { odu_numero: 12, odu_nome: 'Merinla', odu_nome_yoruba: 'Mẹ̀rìnlá', frequencia: 741, elemento: 'terra', significado_healing: 'Mistério sagrado.', mensagem_central: 'Alguns mistérios devem ser contemplados.', cores: ['roxo', 'preto'], dias_sagrados: ['Terça-feira'], aplicacoes_healing: ['Contemplação mística', 'Reverência ao sagrado'] },
  13: { odu_numero: 13, odu_nome: 'Mero', odu_nome_yoruba: 'Mẹ̀rọ̀', frequencia: 417, elemento: 'água', significado_healing: 'Riqueza escondida.', mensagem_central: 'Tesouros inesperados aguardam sua descoberta.', cores: ['amarelo', 'dourado', 'verde'], dias_sagrados: ['Sábado'], aplicacoes_healing: ['Descoberta de tesouros', 'Prosperidade oculta'] },
  14: { odu_numero: 14, odu_nome: 'Jinza', odu_nome_yoruba: 'Jìnza', frequencia: 528, elemento: 'fogo', significado_healing: 'Guerra espiritual e vitória da luz.', mensagem_central: 'A espada de som corta toda energia hostil.', cores: ['vermelho', 'preto', 'laranja'], dias_sagrados: ['Terça-feira'], aplicacoes_healing: ['Proteção espiritual', 'Vitória da luz'] },
  15: { odu_numero: 15, odu_nome: 'Jotagbe', odu_nome_yoruba: 'Jọ́tágbè', frequencia: 963, elemento: 'éter', significado_healing: 'Comunicação ancestral.', mensagem_central: 'Seus ancestrais desejam guiá-lo.', cores: ['branco', 'prata'], dias_sagrados: ['Segunda-feira', 'Domingo'], aplicacoes_healing: ['Comunicação ancestral', 'Conexão com a linhagem'] },
  16: { odu_numero: 16, odu_nome: 'Otura', odu_nome_yoruba: 'Òtúrá', frequencia: 852, elemento: 'terra', significado_healing: 'Caminho revelado.', mensagem_central: 'O caminho se revela enquanto você caminha.', cores: ['roxo', 'verde'], dias_sagrados: ['Terça-feira', 'Segunda-feira'], aplicacoes_healing: ['Iluminação do caminho', 'Visão do destino'] },
};

Object.freeze(ODTU_FREQUENCY_MAPPINGS);
Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

export function getOduFrequency(odu: number | string): OdTuFrequency | null {
  if (typeof odu === 'number') {
    if (odu >= 1 && odu <= 16) { return ODTU_FREQUENCY_MAPPINGS[odu] ?? null; }
    return null;
  }
  const normalizedInput = odu.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const mapping of Object.values(ODTU_FREQUENCY_MAPPINGS)) {
    const nomePT = mapping.odu_nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nomeYoruba = mapping.odu_nome_yoruba.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nomePT === normalizedInput || nomeYoruba === normalizedInput) { return mapping; }
  }
  return null;
}

export function getFrequencyByOdu(odu: number | string): number | null {
  const mapping = getOduFrequency(odu);
  return mapping?.frequencia ?? null;
}

export function getAllOduFrequencies(): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).sort((a, b) => a.odu_numero - b.odu_numero);
}

export function getAllOduNumbers(): number[] {
  return Object.keys(ODTU_FREQUENCY_MAPPINGS).map(Number).sort((a, b) => a - b);
}

export function getAllOduNames(): string[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).map((m) => m.odu_nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function getAllOduNamesYoruba(): string[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).map((m) => m.odu_nome_yoruba).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function getOduByElement(elemento: ElementType): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).filter((m) => m.elemento === elemento).sort((a, b) => a.odu_numero - b.odu_numero);
}

export function getOduByFrequency(frequencia: number): OdTuFrequency[] {
  return Object.values(ODTU_FREQUENCY_MAPPINGS).filter((m) => m.frequencia === frequencia || m.frequencia_alternativa === frequencia).sort((a, b) => a.odu_numero - b.odu_numero);
}

export function getElementByOdu(odu: number | string): ElementType | null {
  const mapping = getOduFrequency(odu);
  return mapping?.elemento ?? null;
}

export function getMessageByOdu(odu: number | string): string | null {
  const mapping = getOduFrequency(odu);
  return mapping?.mensagem_central ?? null;
}

export function getHealingByOdu(odu: number | string): string[] | null {
  const mapping = getOduFrequency(odu);
  return mapping?.aplicacoes_healing ?? null;
}

export function hasOduFrequency(oduNumero: number): boolean {
  return oduNumero in ODTU_FREQUENCY_MAPPINGS;
}

export function getUsedFrequencies(): number[] {
  const frequencies = new Set<number>();
  Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((m) => {
    frequencies.add(m.frequencia);
    if (m.frequencia_alternativa) { frequencies.add(m.frequencia_alternativa); }
  });
  return Array.from(frequencies).sort((a, b) => a - b);
}

export function getUsedElements(): ElementType[] {
  const elements = new Set<ElementType>();
  Object.values(ODTU_FREQUENCY_MAPPINGS).forEach((m) => { elements.add(m.elemento); });
  return Array.from(elements);
}

// fallow-ignore-next-line unused-export
export default { getOduFrequency, getFrequencyByOdu, getAllOduFrequencies, getAllOduNumbers, getAllOduNames, getAllOduNamesYoruba, getOduByElement, getOduByFrequency, getElementByOdu, getMessageByOdu, getHealingByOdu, hasOduFrequency, getUsedFrequencies, getUsedElements };
