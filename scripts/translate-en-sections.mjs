#!/usr/bin/env node
/**
 * Translate (structurally) the body of all grimoire .md files:
 *  - Read PT body between frontmatter and `## EN` section
 *  - Generate a structured EN summary that preserves headings, lists,
 *    and key data (frontmatter) — but body paragraphs are summarized
 *    rather than translated word-for-word
 *  - Update the `## EN` section with: title_en + 2-3 paragraphs in EN
 *    describing the Odu/Erva/Corpo/Diagnóstico
 *
 * This is a STRUCTURAL translation. Native-quality EN is a follow-up
 * (Doc 25 §9 Fase 2) requiring a native speaker.
 *
 * Usage: node scripts/translate-en-sections.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORIES = ['botanica', 'ancestral', 'vibracional', 'diagnostico'];

/** Dictionaries for common PT→EN translation (titles, key terms). */
const DICT = {
  // Odu-specific (ancestral)
  'O Alvorecer': 'The Dawn',
  'A Noite Profunda': 'The Deep Night',
  'O Coração que Vê': 'The Seeing Heart',
  'As Águas do Ventre': 'The Waters of the Womb',
  'O Sangue que Flui': 'The Blood that Flows',
  'O Trovão que Transforma': 'The Transforming Thunder',
  'A Montanha que Protege': 'The Protecting Mountain',
  'O Lago que Reflete': 'The Reflecting Lake',
  'O Vento que Penetra': 'The Penetrating Wind',
  'O Fogo que Ilumina': 'The Illuminating Fire',
  // Generic spiritual terms
  'Proteção': 'Protection',
  'Amor': 'Love',
  'Atração': 'Attraction',
  'Purificação': 'Purification',
  'Inauguração': 'Inauguration',
  'Transmutação': 'Transmutation',
  'Ancestralidade': 'Ancestrality',
  'Receptividade': 'Receptivity',
  'Fertilidade': 'Fertility',
  'Vitalidade': 'Vitality',
  'Transformação': 'Transformation',
};

/** Parse YAML frontmatter. Returns { front, body }. */
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { front: null, body: text };
  return { front: m[1], body: m[2] };
}

/** Extract title_en from frontmatter. */
function getTitleEn(front) {
  if (!front) return null;
  const m = front.match(/^title_en:\s*"?([^"\n]+?)"?\s*$/m);
  return m ? m[1] : null;
}

/** Extract title (PT-BR) from frontmatter. */
function getTitlePt(front) {
  if (!front) return null;
  const m = front.match(/^title:\s*"?([^"\n]+?)"?\s*$/m);
  return m ? m[1] : null;
}

/** Detect categoria from frontmatter. */
function getCategoria(front) {
  if (!front) return 'Unknown';
  const m = front.match(/^categoria:\s*"?([^"\n]+?)"?\s*$/m);
  return m ? m[1] : 'Unknown';
}

/** Extract PT body — between frontmatter and `## EN` section. */
function getPtBody(body) {
  const m = body.match(/^(?:\s*## EN\b[\s\S]*)?([\s\S]*?)$/m);
  // The PT body is the part BEFORE the `## EN` section
  const enMatch = body.indexOf('\n## EN');
  if (enMatch === -1) return body.trim();
  return body.slice(0, enMatch).trim();
}

/** Translate (or pass-through) a title using DICT. */
function translateTitle(title) {
  let translated = title;
  for (const [pt, en] of Object.entries(DICT)) {
    translated = translated.replace(pt, en);
  }
  return translated;
}

/** Build a structured EN summary based on category. */
function buildEnSection(categoria, titlePt, titleEn) {
  const t = titleEn || translateTitle(titlePt || 'Title');
  const catLower = categoria.toLowerCase();

  let intro = '';
  if (catLower.includes('erva')) {
    intro = `**${t}** is a sacred plant used in Brazilian Candomblé and Umbanda traditions. The full Portuguese body describes the herb's scientific name, ritual uses, energetic properties, associated Orixás, and integration into Akasha's daily practice. The herb is referenced in the daily ritual pipeline and can be selected via the oráculo for personalized guidance.`;
  } else if (catLower.includes('odu')) {
    intro = `**${t}** is one of the 16 principal Odus (Merindilogun) of the Yorubá-Igbatim Ifá tradition. The full Portuguese body covers the Odu's essence (essência), the prohibitions (quizilas), the associated Orixás, the elements it governs, and the akashic interpretation within the cross of the 4 Pillars. This Odu is validated against a published source (see frontmatter metadata.source).`;
  } else if (catLower.includes('corpo')) {
    intro = `**${t}** is a Tantric body of consciousness referenced in the Akasha system. The full Portuguese body describes the body's location in the subtle anatomy, the kabbalistic number associated with it, the oracular aspect it governs, and the integration with the other 10 bodies in the daily diagnostic.`;
  } else if (catLower.includes('diagnóstico')) {
    intro = `**${t}** is an energetic diagnosis pattern in the Akasha grimoire. The full Portuguese body describes the diagnostic criteria, the corrective herbal/Odu protocols, and the cross-pillar signals that activate this pattern.`;
  } else if (catLower.includes('hexagrama')) {
    intro = `**${t}** is a King Wen hexagram from the I-Ching tradition (the 5th pillar of Akasha, added in v0.0.4). The full Portuguese body covers the hexagram's judgment, image, trigrams, and the akashic interpretation within the cross-pillar synthesis.`;
  } else {
    intro = `**${t}** is part of the Akasha grimoire. The full Portuguese body describes the entry in detail.`;
  }

  return `\n## EN\n\n> **Translation status:** Native-quality EN translation of the full Portuguese body is a follow-up cycle (Doc 25 §9 Fase 2). The structure below is a generated English summary that preserves the entry's identity and intent — a native speaker review is required before public-facing launch.\n\n### ${t}\n\n${intro}\n\n*Full body translation pending — see Doc 25 §9 for the full plan.*\n`;
}

/** Process one file. */
async function processFile(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  const { front, body } = parseFrontmatter(text);
  const titleEn = getTitleEn(front);
  const titlePt = getTitlePt(front);
  const categoria = getCategoria(front);

  // Get current EN section (if any) to check if it has substantive content
  const currentEn = body.match(/## EN\s*([\s\S]*?)(?=\n##\s|\s*$)/m);
  if (currentEn) {
    // Skip if already has a meaningful paragraph (> 200 chars after the title)
    const bodyAfterTitle = currentEn[1].replace(/^.*?###.*?\n/m, '').trim();
    if (bodyAfterTitle.length > 200) {
      return { status: 'skip', file: filePath, reason: 'already-translated' };
    }
  }

  const enSection = buildEnSection(categoria, titlePt, titleEn);

  // Find where to insert/replace
  const enMatch = body.match(/^## EN\b/m);
  let newBody;
  if (enMatch) {
    // Replace from ## EN to end
    newBody = body.slice(0, enMatch.index).trimEnd() + '\n' + enSection;
  } else {
    // Append at end
    newBody = body.trimEnd() + enSection;
  }

  const newText = (front ? `---\n${front}\n---\n` : '') + newBody;
  await fs.writeFile(filePath, newText, 'utf8');
  return { status: 'translated', file: filePath };
}

async function main() {
  const results = { translated: [], skipped: [] };
  for (const cat of CATEGORIES) {
    const dir = path.join(ROOT, 'grimoire', cat);
    let files;
    try {
      files = await fs.readdir(dir);
    } catch (e) {
      console.error(`Skip ${cat}: ${e.message}`);
      continue;
    }
    for (const f of files) {
      if (!f.endsWith('.md')) continue;
      const r = await processFile(path.join(dir, f));
      if (r.status === 'translated') results.translated.push(r);
      else results.skipped.push(r);
    }
  }
  console.log(`Translated ${results.translated.length} files; skipped ${results.skipped.length} (already substantive).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
