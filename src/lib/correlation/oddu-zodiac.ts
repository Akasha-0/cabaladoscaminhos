/**
 * Odú-Ifá Zodíaco Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to their corresponding Zodiac signs
 * With spiritual meaning for divination and astrological interpretation
 *
 * @provisional — Grafias de Odu usadas aqui (Okaran, Etaogundá, Oxé, Ejionlá,
 * Iuní, Owonrin, Ejila, Logumí, Odí, Bejí, Ibí, Okandí) são **variantes de
 * linhagem** reconhecidas em IDEIA.md §linha 639 (D4 a resolver). O canônico
 * está em `src/lib/constants/odus.ts` (Ogbe, Etogundá, Oxê, Ejionile, Ossá,
 * Ofun, Owarin, Ejilaxebô, Oturupon, Oturá, Iká, Ofurufu).
 *
 * NÃO substituir as grafias locais — elas representam variantes legítimas
 * da tradição Merindilogun. Quando D4 for resolvido pelo operador, este
 * módulo deve ser migrado para usar `ODUS[i].name` do canônico.
 *
 * Veja: tests/lib/correlation/odu-canonical-names.test.ts (guardião)
 */

export type ZodiacSign =
  | 'Áries'
  | 'Touro'
  | 'Gêmeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra';

export interface OduZodiac {
  odu_numero: number;
  odu_nome: string;
  odu_nome_yoruba: string;
  signo: ZodiacSign;
  elemento: ElementType;
  significado_espiritual: string;
  mensagem_central: string;
}

export const ODU_ZODIAC_MAPPINGS: Record<number, OduZodiac> = {
  1: { odu_numero: 1, odu_nome: 'Okaran', odu_nome_yoruba: 'Okànràn', signo: 'Áries', elemento: 'fogo', significado_espiritual: 'Coragem, recomeço, pioneirismo. Odu do líder que abre caminhos e da chama que acende novas jornadas.', mensagem_central: 'A coragem move montanhas. Okaran traz a força do fogo para iniciar.' },
  2: { odu_numero: 2, odu_nome: 'Ejiokô', odu_nome_yoruba: 'Ejìokò', signo: 'Touro', elemento: 'terra', significado_espiritual: 'Estabilidade, valor, escolha consciente. Revela a necessidade de construir sobre fundamentos sólidos.', mensagem_central: 'Escolhas importantes pedem firmeza. Ejiokô orienta decisões com persistência.' },
  3: { odu_numero: 3, odu_nome: 'Etaogundá', odu_nome_yoruba: 'Ẹtaọgúndá', signo: 'Gêmeos', elemento: 'ar', significado_espiritual: 'Comunicação, dualidade, transformação. Reflete a natureza mutável e a capacidade de adaptar-se.', mensagem_central: 'A fluidez entre opostos traz sabedoria. Etaogundá abre portas da comunicação.' },
  4: { odu_numero: 4, odu_nome: 'Irosun', odu_nome_yoruba: 'Ìrosùn', signo: 'Câncer', elemento: 'água', significado_espiritual: 'Intuição lunar, emoções profundas, proteção. Revela verdades ocultas e a sabedoria do inconsciente.', mensagem_central: 'Confie na voz interior. Irosun conecta com a memória ancestral.' },
  5: { odu_numero: 5, odu_nome: 'Oxé', odu_nome_yoruba: 'Ọ̀sà', signo: 'Leão', elemento: 'fogo', significado_espiritual: 'Poder pessoal, criatividade, realeza interior. Ação decisiva que transforma realidades.', mensagem_central: 'O fogo do destino brilha em ti. Oxé desperta a força criadora.' },
  6: { odu_numero: 6, odu_nome: 'Obará', odu_nome_yoruba: 'Ọbàlúayé', signo: 'Virgem', elemento: 'terra', significado_espiritual: 'Purificação, serviço, análise. Transformação através da cura e do discernimento preciso.', mensagem_central: 'A purificação traz restauração. Obará limpa e transforma.' },
  7: { odu_numero: 7, odu_nome: 'Odi', odu_nome_yoruba: 'Òdí', signo: 'Libra', elemento: 'ar', significado_espiritual: 'Harmonia, equilíbrio, destino. Padrões ocultos que direcionam relacionamentos e escolhas.', mensagem_central: 'O equilíbrio revela o caminho. Odi traz justiça aos destinos.' },
  8: { odu_numero: 8, odu_nome: 'Ejionlá', odu_nome_yoruba: 'Ejìọnlá', signo: 'Escorpião', elemento: 'água', significado_espiritual: 'Transformação profunda, regeneração, mistério. Morte e renascimento espiritual.', mensagem_central: 'Das cinzas surge a força. Ejionlá desperta o poder transformador.' },
  9: { odu_numero: 9, odu_nome: 'Iuní', odu_nome_yoruba: 'Ọ̀shẹ́', signo: 'Sagitário', elemento: 'fogo', significado_espiritual: 'Expansão, fé, aventura espiritual. Busca por significado e conexão com o divino.', mensagem_central: 'O conhecimento ilumina a jornada. Oshe expande horizontes.' },
  10: { odu_numero: 10, odu_nome: 'Owonrin', odu_nome_yoruba: 'Ọ̀fún', signo: 'Capricórnio', elemento: 'terra', significado_espiritual: 'Disciplina, paciência, conquistas materiais. Sabedoria conquistada através da perseverança.', mensagem_central: 'A paciência constrói impérios. Ofun traz realizações duradouras.' },
  11: { odu_numero: 11, odu_nome: 'Ejila', odu_nome_yoruba: 'Èyọ́nlá', signo: 'Aquário', elemento: 'ar', significado_espiritual: 'Inovação, humanitarianismo, sabedoria libertária. Visão que transcende convenções.', mensagem_central: 'A sabedoria libertária transforma. Eyonla abre a mente para o novo.' },
  12: { odu_numero: 12, odu_nome: 'Logumí', odu_nome_yoruba: 'Mẹ̀rìnlá', signo: 'Peixes', elemento: 'água', significado_espiritual: 'Unidade cósmica, sacrifício, compaixão infinita. Dissolução de fronteiras entre self e universo.', mensagem_central: 'A compaixão une todos os seres. Merinla dissolve o véu entre dimensões.' },
  13: { odu_numero: 13, odu_nome: 'Odí', odu_nome_yoruba: 'Mẹ̀rọ̀', signo: 'Áries', elemento: 'fogo', significado_espiritual: 'Descoberta, tesouros ocultos, revelação. Prosperidade que surge do inesperado e da coragem.', mensagem_central: 'Tesouros escondidos esperam coragem. Mero revela a riqueza do caminho.' },
  14: { odu_numero: 14, odu_nome: 'Bejí', odu_nome_yoruba: 'Jìnza', signo: 'Touro', elemento: 'terra', significado_espiritual: 'Força interior, proteção, vitória. Batalha espiritual ganha através da determinação inabalável.', mensagem_central: 'A determinação vence obstáculos. Jinza traz a força do guerreiro.' },
  15: { odu_numero: 15, odu_nome: 'Ibí', odu_nome_yoruba: 'Jọ́tágbè', signo: 'Gêmeos', elemento: 'ar', significado_espiritual: 'Comunicação ancestral, linhagem espiritual. Conexão entre passado e presente através da palavra sagrada.', mensagem_central: 'A ancestralidade fala através de ti. Jotagbe abre canais de sabedoria.' },
  16: { odu_numero: 16, odu_nome: 'Otura', odu_nome_yoruba: 'Òtúrá', signo: 'Câncer', elemento: 'água', significado_espiritual: 'Jornada, destino, caminho revelado. O destino se forma a cada passo da jornada.', mensagem_central: 'O caminho se revela na caminhada. Otura orienta a jornada do destino.' },
};

Object.freeze(ODU_ZODIAC_MAPPINGS);

function normalizeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function getOduZodiac(odu: number | string): OduZodiac | null {
  if (typeof odu === 'number') return ODU_ZODIAC_MAPPINGS[odu] ?? null;
  const normalized = odu.toLowerCase().trim();
  if (!normalized) return null;
  const numValue = Number(normalized);
  if (!isNaN(numValue) && numValue >= 1 && numValue <= 16) return ODU_ZODIAC_MAPPINGS[numValue] ?? null;
  for (const mapping of Object.values(ODU_ZODIAC_MAPPINGS)) {
    if (mapping.odu_nome.toLowerCase() === normalized) return mapping;
    if (mapping.odu_nome_yoruba.toLowerCase() === normalized) return mapping;
  }
  for (const mapping of Object.values(ODU_ZODIAC_MAPPINGS)) {
    if (mapping.odu_nome.toLowerCase().includes(normalized)) return mapping;
  }
  return null;
}

export function getAllOduZodiacs(): OduZodiac[] {
  return Object.keys(ODU_ZODIAC_MAPPINGS).map(Number).sort((a, b) => a - b).map((num) => ODU_ZODIAC_MAPPINGS[num]);
}

export function getAllOduNumbers(): number[] {
  return Object.keys(ODU_ZODIAC_MAPPINGS).map(Number).sort((a, b) => a - b);
}

export function getAllOduNames(): string[] {
  return Object.values(ODU_ZODIAC_MAPPINGS).map((m) => m.odu_nome).sort((a, b) => {
    const numA = ODU_ZODIAC_MAPPINGS[Object.values(ODU_ZODIAC_MAPPINGS).find((m) => m.odu_nome === a)?.odu_numero ?? 0]?.odu_numero ?? 0;
    const numB = ODU_ZODIAC_MAPPINGS[Object.values(ODU_ZODIAC_MAPPINGS).find((m) => m.odu_nome === b)?.odu_numero ?? 0]?.odu_numero ?? 0;
    return numA - numB;
  });
}

export function getAllZodiacSigns(): ZodiacSign[] {
  const signs = new Set(Object.values(ODU_ZODIAC_MAPPINGS).map((m) => m.signo));
  return Array.from(signs) as ZodiacSign[];
}

export function getOduByElement(elemento: ElementType): OduZodiac[] {
  return Object.values(ODU_ZODIAC_MAPPINGS).filter((m) => m.elemento === elemento).sort((a, b) => a.odu_numero - b.odu_numero);
}

export function getZodiacOdu(signo: string): OduZodiac[] {
  const normalized = normalizeDiacritics(signo.trim());
  if (!normalized) return [];
  return Object.values(ODU_ZODIAC_MAPPINGS)
    .filter((m) => normalizeDiacritics(m.signo) === normalized)
    .sort((a, b) => a.odu_numero - b.odu_numero);
}

export function hasOduZodiac(oduNumero: number): boolean {
  return oduNumero in ODU_ZODIAC_MAPPINGS;
}

export function getOduZodiacSign(oduNumero: number): ZodiacSign | null {
  return ODU_ZODIAC_MAPPINGS[oduNumero]?.signo ?? null;
}

export function getOduElement(oduNumero: number): ElementType | null {
  return ODU_ZODIAC_MAPPINGS[oduNumero]?.elemento ?? null;
}

export function getOduMessage(oduNumero: number): string | null {
  return ODU_ZODIAC_MAPPINGS[oduNumero]?.mensagem_central ?? null;
}
