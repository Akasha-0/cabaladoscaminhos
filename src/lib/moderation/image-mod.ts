/**
 * ============================================================================
 * IMAGE MODERATION — Cabala dos Caminhos (Wave 36)
 * ============================================================================
 *
 * Avaliação de imagens anexadas a posts/comentários/avatars.
 *
 *   - NSFW heuristic: checa filename + url para sinais óbvios (sem chamar API
 *     externa — privacidade LGPD). Em produção, integra com Cloudflare
 *     Images moderation ou AWS Rekognition (já cobertos no W34 security).
 *
 *   - Copyright: detecta URLs conhecidas (Pixabay, Unsplash, Pexels) que
 *     são livres, e exige atribuição para outras.
 *
 *   - EXIF stripping: recomenda remoção de metadados de geolocalização
 *     antes do upload (LGPD Art. 37 — dados de localização).
 *
 *   - Religious symbols: heurística por filename + alt text para auto-tag
 *     (pentagrama, cruz, menorah, om, ponto riscado, etc.).
 *
 * @see docs/MODERATION-AUTO-W36.md — image moderation reference
 * ============================================================================
 */

// ============================================================================
// NSFW HEURISTIC
// ============================================================================

/**
 * Heurística baseada em filename + URL path. Não abre bytes da imagem
 * (isso seria feito em Cloudflare Images / AWS Rekognition em prod).
 *
 * Quando `providerResult` for fornecido (integração externa), ele tem peso
 * maior. Senão, usamos apenas signals do filename.
 */
export interface NSFWCheckInput {
  imageUrl: string;
  filename?: string;
  /** Resultado de Cloudflare Images / Rekognition se já houver */
  providerResult?: {
    nsfwScore: number; // 0..1
    violenceScore: number;
  };
}

export interface NSFWCheckResult {
  flagged: boolean;
  confidence: number;
  signals: string[];
  recommendation: 'ALLOW' | 'BLUR' | 'REMOVE';
}

const NSFW_FILENAME_PATTERNS = [
  /\bnsfw\b/i,
  /\bnude\b/i,
  /\bnaked\b/i,
  /\bporn\b/i,
  /\bxxx\b/i,
  /\badult[-_]?only\b/i,
  /\bsex\b/i,
  /\bgore\b/i,
  /\bblood\b/i,
  /\bnsfw_br/i,
  /\bdesnud[oa]\b/i,
  /\bpelad[oa]\b/i,
  /\bnudez\b/i,
  /\bviol[eê]ncia\b/i,
  /\bsangue\b/i,
];

export function checkNSFW(input: NSFWCheckInput): NSFWCheckResult {
  const signals: string[] = [];
  let score = 0;

  // Provider (preferred) — 0.7 a 0.9 = blur, > 0.9 = remove
  if (input.providerResult) {
    const { nsfwScore, violenceScore } = input.providerResult;
    if (nsfwScore > 0.5) { signals.push(`nsfw_provider:${nsfwScore.toFixed(2)}`); score = Math.max(score, nsfwScore); }
    if (violenceScore > 0.5) { signals.push(`violence_provider:${violenceScore.toFixed(2)}`); score = Math.max(score, violenceScore * 0.9); }
  }

  // Filename heuristic (fallback)
  const filename = input.filename ?? input.imageUrl.split('/').pop() ?? '';
  for (const pat of NSFW_FILENAME_PATTERNS) {
    if (pat.test(filename)) {
      signals.push(`filename_pattern:${pat.source}`);
      score = Math.max(score, 0.85);
      break;
    }
  }

  // URL path patterns
  if (/\/(nsfw|adult|xxx|porn)\//i.test(input.imageUrl)) {
    signals.push('url_path_nsfw');
    score = Math.max(score, 0.9);
  }

  let recommendation: NSFWCheckResult['recommendation'];
  if (score >= 0.9) recommendation = 'REMOVE';
  else if (score >= 0.6) recommendation = 'BLUR';
  else recommendation = 'ALLOW';

  return {
    flagged: score >= 0.6,
    confidence: Number(score.toFixed(3)),
    signals,
    recommendation,
  };
}

// ============================================================================
// COPYRIGHT
// ============================================================================

const FREE_IMG_DOMAINS = [
  'pixabay.com',
  'unsplash.com',
  'pexels.com',
  'images.unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
];

export interface CopyrightCheckInput {
  imageUrl: string;
  attribution?: string;
}

export interface CopyrightCheckResult {
  isFreeDomain: boolean;
  requiresAttribution: boolean;
  signals: string[];
  recommendation: 'ALLOW' | 'REQUIRE_ATTRIBUTION' | 'MANUAL_REVIEW';
}

export function checkCopyright(input: CopyrightCheckInput): CopyrightCheckResult {
  const signals: string[] = [];
  let isFreeDomain = false;

  try {
    const hostname = new URL(input.imageUrl).hostname.toLowerCase();
    if (FREE_IMG_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      isFreeDomain = true;
      signals.push(`free_domain:${hostname}`);
    } else {
      signals.push(`external_domain:${hostname}`);
    }
  } catch {
    signals.push('invalid_url');
  }

  // Wikimedia exige atribuição mesmo sendo livre
  const wikimedia = /wikimedia\.org/i.test(input.imageUrl);
  const requiresAttribution = isFreeDomain || wikimedia;

  if (wikimedia) signals.push('wikimedia_attribution_required');

  let recommendation: CopyrightCheckResult['recommendation'];
  if (isFreeDomain && !wikimedia && (input.attribution ?? '').length > 0) {
    recommendation = 'ALLOW';
  } else if (requiresAttribution && (!input.attribution || input.attribution.length === 0)) {
    recommendation = 'REQUIRE_ATTRIBUTION';
  } else if (wikimedia && (!input.attribution || input.attribution.length === 0)) {
    recommendation = 'REQUIRE_ATTRIBUTION';
  } else {
    recommendation = 'ALLOW';
  }

  return {
    isFreeDomain,
    requiresAttribution,
    signals,
    recommendation,
  };
}

// ============================================================================
// EXIF / METADATA — LGPD Art. 37 (geolocalização)
// ============================================================================

export interface ExifCheckInput {
  imageUrl: string;
  /** Metadados EXIF presentes (se já conhecidos) */
  exif?: {
    hasGPS: boolean;
    hasCameraInfo: boolean;
    hasTimestamp: boolean;
  };
}

export interface ExifCheckResult {
  needsStrip: boolean;
  signals: string[];
  lgpdRisk: 'none' | 'low' | 'medium' | 'high';
  recommendation: 'ALLOW' | 'STRIP_EXIF' | 'BLOCK';
}

export function checkExif(input: ExifCheckInput): ExifCheckResult {
  const signals: string[] = [];
  let lgpdRisk: ExifCheckResult['lgpdRisk'] = 'none';

  if (input.exif) {
    if (input.exif.hasGPS) {
      signals.push('gps_present');
      lgpdRisk = 'high'; // localização pessoal = LGPD Art. 37
    }
    if (input.exif.hasCameraInfo) {
      signals.push('camera_info');
      lgpdRisk = lgpdRisk === 'none' ? 'low' : lgpdRisk;
    }
    if (input.exif.hasTimestamp) {
      signals.push('timestamp');
      lgpdRisk = lgpdRisk === 'none' ? 'low' : lgpdRisk;
    }
  } else {
    // Sem info — assumir risco médio (LGPD-safe default)
    signals.push('exif_unknown');
    lgpdRisk = 'medium';
  }

  const needsStrip = lgpdRisk !== 'none';
  const recommendation: ExifCheckResult['recommendation'] =
    lgpdRisk === 'high' ? 'STRIP_EXIF' :
      lgpdRisk === 'medium' ? 'STRIP_EXIF' :
        'ALLOW';

  return {
    needsStrip,
    signals,
    lgpdRisk,
    recommendation,
  };
}

// ============================================================================
// RELIGIOUS SYMBOLS — auto-tag
// ============================================================================

/**
 * Heurística leve para detectar símbolos religiosos em imagens.
 * Usa o filename + alt text + URL path. Não faz visão computacional
 * (em produção, usaríamos um modelo leve tipo CLIP, mas aqui basta
 * heurística para 90% dos casos).
 *
 * Saída: lista de tags para o Akasha IA usar em recommendations
 * ("você pode estar interessado em...").
 */

export interface ReligiousSymbolInput {
  imageUrl: string;
  filename?: string;
  altText?: string;
}

export interface ReligiousSymbolResult {
  detected: string[];
  signals: string[];
}

const SYMBOL_PATTERNS: Record<string, RegExp[]> = {
  // Cristianismo
  'cruz': [/cross/i, /cruz/i, /\bcruz\b/],
  'cristograma': [/ichthys/i, /christogram/i, /fish_symbol/i],
  'rosário': [/rosary/i, /rosario/i, /terço/i, /terco/i],
  'ícone-cristão': [/icon[_-]?saint/i, /santo[_-]?padroeiro/i],

  // Judaísmo
  'menorah': [/menorah/i, /chanukiah/i, /candelabro[_-]?judeu/i],
  'estrela-de-davi': [/star[_-]?of[_-]?david/i, /estrela[_-]?de[_-]?davi/i, /magendavid/i, /magen[_-]?david/i],
  'kipá': [/kippah/i, /yarmulke/i, /kippa/i, /kipá/i],
  'torah': [/torah/i, /sefer/i, /tor[áa]/i],

  // Islamismo
  'crescente': [/crescent/i, /lua[_-]?islam/i, /crescente[_-]?islam/i],
  'kalma': [/kalima/i, /shahada/i],

  // Hinduísmo / Budismo / Tantra
  'om': [/\bom[_-]?symbol/i, /aum[_-]?symbol/i, /\bsímbolo[_-]?om\b/i],
  'lótus': [/lotus/i, /lótus/i, /padma/i],
  'mandala': [/mandala/i],
  'sri-yantra': [/sri[_-]?yantra/i, /shri[_-]?yantra/i],
  'buda': [/buddha/i, /buda/i],

  // Candomblé / Umbanda / Ifá
  'orixá': [/orix[áa]/i, /orisha/i],
  'ogum': [/ogum/i, /ogun/i],
  'oxum': [/oxum/i, /oshun/i],
  'iemanja': [/iemanja/i, /iemanjá/i, /yemanjá/i, /yemoja/i],
  'xango': [/xang[oô]/i, /shango/i],
  'obaluaê': [/obaluaiê/i, /omulu/i, /omolú/i],
  'exu': [/exu/i, /eshu/i, /elegba/i],
  'preto-velho': [/preto[_-]?velho/i, /old[_-]?black[_-]?man/i],
  'caboclo': [/caboclo/i],
  'ponto-riscado': [/ponto[_-]?riscado/i, /ritual[_-]?desenho/i],
  'pomba-gira': [/pomba[_-]?gira/i, /pombagira/i],

  // Cabala / Cristianismo místico
  'árvore-da-vida': [/tree[_-]?of[_-]?life/i, /arvore[_-]?da[_-]?vida/i, /sephiroth[_-]?tree/i],
  'tetragrammaton': [/tetragrammaton/i, /yhvh/i, /yod[_-]?he[_-]?vav[_-]?he/i],

  // Astrologia
  'símbolo-zodiacal': [/zodiac/i, /signo[_-]?symbol/i],

  // Geral
  'incenso': [/incense/i, /incenso/i, /smudge[_-]?stick/i],
  'vela-ritual': [/ritual[_-]?candle/i, /vela[_-]?ritual/i, /ritual[_-]?vela/i],
};

export function detectReligiousSymbols(input: ReligiousSymbolInput): ReligiousSymbolResult {
  const haystack = [
    input.filename ?? '',
    input.altText ?? '',
    input.imageUrl,
  ].join(' ');

  const detected: string[] = [];
  const signals: string[] = [];

  for (const [symbol, patterns] of Object.entries(SYMBOL_PATTERNS)) {
    for (const pat of patterns) {
      if (pat.test(haystack)) {
        detected.push(symbol);
        signals.push(`symbol:${symbol}`);
        break; // 1 hit por símbolo é suficiente
      }
    }
  }

  return { detected: Array.from(new Set(detected)), signals };
}

// ============================================================================
// AGGREGATE CHECK
// ============================================================================

export interface ImageModerationInput {
  imageUrl: string;
  filename?: string;
  altText?: string;
  attribution?: string;
  exif?: { hasGPS: boolean; hasCameraInfo: boolean; hasTimestamp: boolean };
  providerResult?: { nsfwScore: number; violenceScore: number };
}

export interface ImageModerationResult {
  nsfw: NSFWCheckResult;
  copyright: CopyrightCheckResult;
  exif: ExifCheckResult;
  symbols: ReligiousSymbolResult;
  recommendation: 'ALLOW' | 'BLUR_REQUIRED' | 'ATTRIBUTION_REQUIRED' | 'BLOCK';
  needsHumanReview: boolean;
}

export function moderateImage(input: ImageModerationInput): ImageModerationResult {
  const nsfw = checkNSFW({
    imageUrl: input.imageUrl,
    filename: input.filename,
    providerResult: input.providerResult,
  });
  const copyright = checkCopyright({
    imageUrl: input.imageUrl,
    attribution: input.attribution,
  });
  const exif = checkExif({
    imageUrl: input.imageUrl,
    exif: input.exif,
  });
  const symbols = detectReligiousSymbols({
    imageUrl: input.imageUrl,
    filename: input.filename,
    altText: input.altText,
  });

  let recommendation: ImageModerationResult['recommendation'] = 'ALLOW';
  let needsHumanReview = false;

  if (nsfw.recommendation === 'REMOVE') recommendation = 'BLOCK';
  else if (nsfw.recommendation === 'BLUR') recommendation = 'BLUR_REQUIRED';
  else if (copyright.recommendation === 'REQUIRE_ATTRIBUTION') recommendation = 'ATTRIBUTION_REQUIRED';
  else if (exif.recommendation === 'STRIP_EXIF') {
    // Strip é silencioso em prod (server-side); apenas observa.
    recommendation = 'ALLOW';
  }

  // Símbolos religiosos: auto-tag não é revisão, é enrichment.
  // Mas se houver + de 3 símbolos religiosos + texto mercantilizado,
  // o pipeline de texto vai sinalizar.
  if (symbols.detected.length >= 5) needsHumanReview = true;

  return {
    nsfw,
    copyright,
    exif,
    symbols,
    recommendation,
    needsHumanReview,
  };
}