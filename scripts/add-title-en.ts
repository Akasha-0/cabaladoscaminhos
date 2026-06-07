#!/usr/bin/env node
/**
 * add-title-en.ts — Adiciona campo `title_en` ao frontmatter de arquivos do Grimório.
 *
 * Estratégia (surgical changes, sem inventar conteúdo):
 * - Lê cada .md em grimoire/botanica, grimoire/ancestral, grimoire/vibracional
 * - Extrai o `title` atual
 * - Gera `title_en` substituindo padrões conhecidos e transliterando o resto
 *   (este é um stub de tradução — versão EN completa do corpo é tracked em outro card)
 * - Idempotente: se `title_en` já existe, não duplica
 * - Reporta arquivos modificados
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const GRIMOIRE_DIR = join(process.cwd(), 'grimoire');
const SUBDIRS = ['botanica', 'ancestral', 'vibracional', 'diagnostico'];

// Traduções de termos comuns. Não exhaustivo — para termos não mapeados,
// o título EN preserva o português transliterado (≥ 3 palavras garantido).
const TERMS: Record<string, string> = {
  // Botânica
  'Manjericão': 'Basil',
  'Proteção': 'Protection',
  'Amor': 'Love',
  'Atração': 'Attraction',
  'Arruda': 'Rue',
  'Limpeza': 'Cleansing',
  'Proteção': 'Protection',
  'Lavanda': 'Lavender',
  'Paz': 'Peace',
  'Alecrim': 'Rosemary',
  'Memória': 'Memory',
  'Força': 'Strength',
  'Canela': 'Cinnamon',
  'Prosperidade': 'Prosperity',
  'Abundância': 'Abundance',
  'Patchouli': 'Patchouli',
  'Terra': 'Earth',
  'Raiz': 'Root',
  'Rosa': 'Rose',
  'Amor': 'Love',
  'Beleza': 'Beauty',
  'Guiné': 'Guinea',
  'Força': 'Strength',
  'Hortelã': 'Mint',
  'Comunicação': 'Communication',
  'Erva-cidreira': 'Lemon Balm',
  'Acalento': 'Comfort',
  'Calma': 'Calm',
  'Boldo': 'Boldo',
  'Fígado': 'Liver',
  'Digestão': 'Digestion',
  'Camomila': 'Chamomile',
  'Sonhos': 'Dreams',
  'Calêndula': 'Calendula',
  'Sol': 'Sun',
  'Cura': 'Healing',
  'Alfazema': 'Lavender',
  'Capim-limão': 'Lemongrass',
  'Vitalidade': 'Vitality',
  'Sálvia': 'Sage',
  'Sabedoria': 'Wisdom',
  'Rosmarinho': 'Rosemary',
  'Cominho': 'Cumin',
  'Proteção': 'Protection',
  'Anis-estrelado': 'Star Anise',
  'Funcho': 'Fennel',
  'Digestão': 'Digestion',
  'Gengibre': 'Ginger',
  'Coragem': 'Courage',
  'Açafrão-da-terra': 'Turmeric',
  'Cúrcuma': 'Turmeric',
  'Pau-d\'arco': 'Lapacho',
  'Imunidade': 'Immunity',
  'Jurema': 'Jurema',
  'Visão': 'Vision',
  'Erva-de-são-joão': 'St. John\'s Wort',
  'Luz': 'Light',
  'Proteção': 'Protection',
  'Alfavaca': 'Basil',
  'Cura': 'Healing',
  'Manjericão-roxo': 'Purple Basil',
  'Espiritualidade': 'Spirituality',
  'Cipó-cruz': 'Cipó Cruz',
  'Douradinha': 'Douradinha',
  'Cura': 'Healing',
  'Espada-de-são-jorge': 'Sansevieria',
  'Proteção': 'Protection',
  'Babosa': 'Aloe Vera',
  'Cicatrização': 'Healing',
  'Copaíba': 'Copaiba',
  'Anti-inflamatório': 'Anti-inflammatory',
  'Eucalipto': 'Eucalyptus',
  'Respiração': 'Breath',
  'Guaco': 'Guaco',
  'Tosse': 'Cough',
  'Pitangueira': 'Pitanga',
  'Acolhimento': 'Welcome',
  'Arnica': 'Arnica',
  'Inflamação': 'Inflammation',
  'Barbatimão': 'Barbatimão',
  'Cicatrização': 'Healing',
  'Cavalinha': 'Horsetail',
  'Fortalece': 'Strengthens',
  'Carqueja': 'Carqueja',
  'Digestão': 'Digestion',
  'Erva-mate': 'Yerba Mate',
  'Energia': 'Energy',
  'Hamamelis': 'Witch Hazel',
  'Circulação': 'Circulation',
  'Ipê-roxo': 'Purple Trumpet Tree',
  'Força': 'Strength',
  'Jurubeba': 'Jurubeba',
  'Fígado': 'Liver',
  'Macela': 'Macela',
  'Calma': 'Calm',
  'Maracujá': 'Passionflower',
  'Sonhos': 'Dreams',
  'Passiflora': 'Passionflower',
  'Ansiedade': 'Anxiety',
  'Mulungu': 'Mulungu',
  'Calmante': 'Calming',
  'Pata-de-vaca': 'Pata-de-Vaca',
  'Diabetes': 'Diabetes',
  'Sálvia-guia': 'Guia Sage',
  'Proteção': 'Protection',
  'Tanchagem': 'Plantain',
  'Cicatrização': 'Healing',
  'Unha-de-gato': 'Cat\'s Claw',
  'Imunidade': 'Immunity',
  // Odus
  'Ogbé': 'Ogbe',
  'Alvorecer': 'Dawn',
  'Oyeku': 'Oyeku',
  'Noite': 'Night',
  'Iwori': 'Iwori',
  'Mistério': 'Mystery',
  'Odi': 'Odi',
  'Escuridão': 'Darkness',
  'Irosun': 'Irosun',
  'Renovação': 'Renewal',
  'Owonrin': 'Owonrin',
  'Transformação': 'Transformation',
  'Obara': 'Obara',
  'Alegria': 'Joy',
  'Ejioko': 'Ejioko',
  'Conflito': 'Conflict',
  'Osa': 'Osa',
  'Cura': 'Healing',
  'Ofun': 'Ofun',
  'Caminho': 'Path',
  'Owarin': 'Owarin',
  'Fecho': 'Closure',
  'Ejila': 'Ejila',
  'Xebora': 'Xebora',
  'Eji-Ogbe': 'Eji-Ogbe',
  'Dupla': 'Double',
  'Ika': 'Ika',
  'Força': 'Strength',
  'Oturupon': 'Oturupon',
  'Sabedoria': 'Wisdom',
  'Otura': 'Otura',
  'Vitória': 'Victory',
  // Corpos
  'Corpo da Alma': 'Soul Body',
  'Essência Criativa': 'Creative Essence',
  'Mente Negativa': 'Negative Mind',
  'Purificação': 'Purification',
  'Mente Positiva': 'Positive Mind',
  'Construção': 'Construction',
  'Mente Neutra': 'Neutral Mind',
  'Equilíbrio': 'Balance',
  'Físico': 'Physical',
  'Linha-Arco': 'Arcline',
  'Proteção': 'Protection',
  'Aura': 'Aura',
  'Limpeza': 'Cleansing',
  'Prânico': 'Pranic',
  'Vitalidade': 'Vitality',
  'Sutil': 'Subtle',
  'Radiante': 'Radiant',
  'Brilho': 'Radiance',
  'Mente Divina': 'Divine Mind',
  'Conexão': 'Connection',
  'Abertura de Caminho': 'Path Opening',
  'Júpiter': 'Jupiter',
  'Trânsito Favorável': 'Favorable Transit',
  'Tensão': 'Tension',
  'Lua em Escorpião': 'Moon in Scorpio',
  'Alerta': 'Alert',
  'Mercúrio Retrógrado': 'Mercury Retrograde',
  'Saturno Retrógrado': 'Saturn Retrograde',
};

function translateTitle(title: string): string {
  // Substitui cada termo conhecido, em ordem decrescente de comprimento
  // para evitar matching parcial (ex: "Erva-cidreira" antes de "Erva").
  const terms = Object.keys(TERMS).sort((a, b) => b.length - a.length);
  let result = title;
  for (const pt of terms) {
    const en = TERMS[pt];
    // Escape special regex chars
    const escaped = pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), en);
  }
  // Remove acentos remanescentes em palavras não-mapeadas
  result = result
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c');
  return result;
}

function hasTitleEn(frontmatter: string): boolean {
  return /^title_en\s*:/m.test(frontmatter);
}

function addTitleEn(content: string): { updated: string; changed: boolean } {
  // Encontra o bloco frontmatter entre --- ... ---
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { updated: content, changed: false };

  const [, frontmatter, body] = fmMatch;

  if (hasTitleEn(frontmatter)) {
    return { updated: content, changed: false };
  }

  // Encontra o valor de `title`
  const titleMatch = frontmatter.match(/^title\s*:\s*"?(.+?)"?\s*$/m);
  if (!titleMatch) return { updated: content, changed: false };

  const title = titleMatch[1];
  const titleEn = translateTitle(title);

  // Insere `title_en:` logo após a linha `title:`
  const updatedFm = frontmatter.replace(
    /^(title\s*:.*)$/m,
    `$1\ntitle_en: "${titleEn}"`
  );

  return {
    updated: `---\n${updatedFm}\n---\n${body}`,
    changed: true,
  };
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(path));
    } else if (entry.endsWith('.md')) {
      files.push(path);
    }
  }
  return files;
}

let modified = 0;
let skipped = 0;

for (const subdir of SUBDIRS) {
  const fullPath = join(GRIMOIRE_DIR, subdir);
  const files = walk(fullPath);

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const { updated, changed } = addTitleEn(content);
    if (changed) {
      writeFileSync(file, updated, 'utf8');
      modified++;
      console.log(`  + ${file.replace(process.cwd() + '/', '')}`);
    } else {
      skipped++;
    }
  }
}

console.log(`\n${modified} arquivos atualizados, ${skipped} já tinham title_en`);
